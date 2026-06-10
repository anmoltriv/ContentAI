import { Eraser, Loader2, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const RemoveObject = () => {
  const [input, setInput] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [object, setObject] = useState(""); // Fixed: Added missing state for textarea
  const [content, setContent] = useState(""); // Holds the processed image URL/Base64
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { getToken } = useAuth();

  useEffect(() => {
    if (!input) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(input);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [input]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input) {
      return alert("Please upload an image first!");
    }

    setIsLoading(true);
    setErrorMessage("");
    setContent("");

    try {
      const token = await getToken();

      if (!token) {
        setErrorMessage(
          "No Clerk session token was found. Please sign out and sign in again.",
        );
        return;
      }

      const formData = new FormData();
      formData.append("image", input);
      formData.append("prompt", object); // Added: Prompt added to form data

      // Updated endpoint to reflect object removal instead of background removal
      const response = await fetch(`${API_URL}/api/ai/remove-object`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { success: false, message: await response.text() };

      if (response.ok && data.success) {
        setContent(data.content);
      } else {
        setErrorMessage(data.message || "Failed to remove object.");
      }
    } catch (error) {
      console.error("Remove Object Fetch Error:", error);
      setErrorMessage(
        "Network error: Could not connect to the backend server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left Column: Input Form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4a7aff]" />
          <h1 className="text-xl font-semibold">Object Removal</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          accept="image/*"
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
          required
        />

        {/* Added: Preview of local uploaded image */}
        {previewUrl && (
          <div className="mt-4 border border-gray-200 rounded-md overflow-hidden bg-slate-50 flex justify-center items-center p-2 max-h-60">
            <img
              src={previewUrl}
              alt="Source preview"
              className="max-w-full max-h-56 object-contain rounded"
            />
          </div>
        )}

        <p className="mt-6 text-sm font-medium">
          Describe object name to remove
        </p>
        <textarea
          onChange={(e) => setObject(e.target.value)}
          rows={4}
          value={object}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 h-25"
          placeholder="e.g., trash can, photobomber behind me"
          required
        />

        <button
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#f6ab41] to-[#ff4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 animate-spin" />
          ) : (
            <Eraser className="w-5" />
          )}
          {isLoading ? "Processing..." : "Remove Object"}
        </button>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
            {errorMessage}
          </p>
        )}
      </form>

      {/* Right Column: Processed Result */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Eraser className="w-5 h-5 text-[#4a7aff]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        <div className="flex-1 flex justify-center items-center mt-4">
          {isLoading ? (
            <div className="text-sm flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="w-9 h-9 animate-spin text-[#4a7aff]" />
              <p>Magic is happening...</p>
            </div>
          ) : content ? (
            <div className="w-full flex justify-center items-center p-2">
              <img
                src={content}
                alt="Processed output"
                className="max-w-full rounded shadow-sm max-h-[400px] object-contain"
              />
            </div>
          ) : (
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400 text-center px-4">
              <Eraser className="w-9 h-9" />
              <p>Upload an image and click "Remove Object" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveObject;