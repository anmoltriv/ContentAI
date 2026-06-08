import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DEFAULT_ARTICLE_STATE = {
  input: "",
  selectedLength: 800,
  content: "",
  isLoading: false,
  errorMessage: "",
};

const DEFAULT_BLOG_STATE = {
  input: "",
  selectedCategory: "General",
  titles: [],
  isLoading: false,
  errorMessage: "",
};

const DEFAULT_IMAGE_STATE = {
  input: "",
  selectedStyle: "Realistic",
  publish: false,
  content: "",
  isLoading: false,
  errorMessage: "",
};

const AiContext = createContext(null);

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const message = await response.text();
  return { success: false, message };
};

export const AiProvider = ({ children }) => {
  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [creations, setCreations] = useState([]);
  const [creationsLoading, setCreationsLoading] = useState(true);
  const [creationsError, setCreationsError] = useState("");
  const [communityCreations, setCommunityCreations] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityError, setCommunityError] = useState("");
  const [articleState, setArticleState] = useState(DEFAULT_ARTICLE_STATE);
  const [blogState, setBlogState] = useState(DEFAULT_BLOG_STATE);
  const [imageState, setImageState] = useState(DEFAULT_IMAGE_STATE);
  const loadedUserIdRef = useRef(null);

  const getAuthToken = async () => {
    const token = await getToken();

    if (!token) {
      throw new Error(
        "No Clerk session token was found. Please sign out and sign in again.",
      );
    }

    return token;
  };

  const refreshCreations = async () => {
    setCreationsLoading(true);
    setCreationsError("");

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/api/ai/creations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await parseResponse(response);

      if (response.ok && data.success) {
        setCreations(data.creations || []);
      } else {
        const cleanMessage =
          typeof data.message === "string"
            ? data.message.replace(/<[^>]+>/g, "").trim()
            : "";

        setCreationsError(
          cleanMessage || "Failed to load your creation history.",
        );
      }
    } catch (error) {
      console.error("Creations Fetch Error:", error);
      setCreationsError(
        error.message || "Network error: Could not connect to the backend server.",
      );
    } finally {
      setCreationsLoading(false);
    }
  };

  const refreshCommunityCreations = async () => {
    setCommunityLoading(true);
    setCommunityError("");

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/api/ai/public-creations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await parseResponse(response);

      if (response.ok && data.success) {
        setCommunityCreations(data.creations || []);
      } else {
        const cleanMessage =
          typeof data.message === "string"
            ? data.message.replace(/<[^>]+>/g, "").trim()
            : "";

        setCommunityError(
          cleanMessage || "Failed to load community creations.",
        );
      }
    } catch (error) {
      console.error("Community Fetch Error:", error);
      setCommunityError(
        error.message || "Network error: Could not connect to the backend server.",
      );
    } finally {
      setCommunityLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;

    if (!user) {
      loadedUserIdRef.current = null;
      setCreations([]);
      setCommunityCreations([]);
      setArticleState(DEFAULT_ARTICLE_STATE);
      setBlogState(DEFAULT_BLOG_STATE);
      setImageState(DEFAULT_IMAGE_STATE);
      return;
    }

    if (loadedUserIdRef.current === user.id) return;

    loadedUserIdRef.current = user.id;
    refreshCreations();
    refreshCommunityCreations();
  }, [isAuthLoaded, isUserLoaded, user]);

  const generateArticle = async ({ prompt, length }) => {
    setArticleState((current) => ({
      ...current,
      input: prompt,
      selectedLength: length,
      content: "",
      errorMessage: "",
      isLoading: true,
    }));

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/api/ai/generate-article`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, length }),
      });
      const data = await parseResponse(response);

      if (response.ok && data.success) {
        setArticleState((current) => ({
          ...current,
          content: data.content,
          errorMessage: "",
          isLoading: false,
        }));
        refreshCreations();
      } else {
        throw new Error(data.message || "Failed to generate article.");
      }
    } catch (error) {
      console.error("Article Generation Error:", error);
      setArticleState((current) => ({
        ...current,
        errorMessage:
          error.message || "Network error: Could not connect to the backend server.",
        isLoading: false,
      }));
    }
  };

  const generateBlogTitles = async ({ keyword, category }) => {
    setBlogState((current) => ({
      ...current,
      input: keyword,
      selectedCategory: category,
      titles: [],
      errorMessage: "",
      isLoading: true,
    }));

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/api/ai/generate-blog-titles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          keyword,
          category,
        }),
      });
      const data = await parseResponse(response);

      if (response.ok && data.success) {
        const cleanedTitles = data.content
          .split("\n")
          .map((title) => title.replace(/^\s*[-*0-9.)]+\s*/, "").trim())
          .filter(Boolean);

        setBlogState((current) => ({
          ...current,
          titles: cleanedTitles,
          errorMessage: "",
          isLoading: false,
        }));
        refreshCreations();
      } else {
        throw new Error(data.message || "Failed to generate blog titles.");
      }
    } catch (error) {
      console.error("Blog Generation Error:", error);
      setBlogState((current) => ({
        ...current,
        errorMessage:
          error.message || "Network error: Could not connect to the backend server.",
        isLoading: false,
      }));
    }
  };

  const generateImage = async ({ prompt, style, publish }) => {
    setImageState((current) => ({
      ...current,
      input: prompt,
      selectedStyle: style,
      publish,
      content: "",
      errorMessage: "",
      isLoading: true,
    }));

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/api/ai/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          style,
          publish,
        }),
      });
      const data = await parseResponse(response);

      if (response.ok && data.success) {
        setImageState((current) => ({
          ...current,
          content: data.content,
          errorMessage: "",
          isLoading: false,
        }));
        refreshCreations();
        if (publish) {
          refreshCommunityCreations();
        }
      } else {
        throw new Error(data.message || "Failed to generate image.");
      }
    } catch (error) {
      console.error("Image Generation Error:", error);
      setImageState((current) => ({
        ...current,
        errorMessage:
          error.message || "Network error: Could not connect to the backend server.",
        isLoading: false,
      }));
    }
  };

  const value = {
    creations,
    creationsLoading,
    creationsError,
    refreshCreations,
    communityCreations,
    communityLoading,
    communityError,
    refreshCommunityCreations,
    articleState,
    setArticleState,
    generateArticle,
    blogState,
    setBlogState,
    generateBlogTitles,
    imageState,
    setImageState,
    generateImage,
  };

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
};

export const useAi = () => {
  const context = useContext(AiContext);

  if (!context) {
    throw new Error("useAi must be used within an AiProvider");
  }

  return context;
};
