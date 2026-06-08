import { Eraser, Loader2, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const RemoveBackground = () => {
  const [input, setInput] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [content, setContent] = useState("");
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
        setErrorMessage("No Clerk session token was found. Please sign out and sign in again.");
        return;
      }

      const formData = new FormData();
      formData.append("image", input);

      const response = await fetch(`${API_URL}/api/ai/remove-background`, {
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
        setErrorMessage(data.message || "Failed to remove image background.");
      }
    } catch (error) {
      console.error("Remove Background Fetch Error:", error);
      setErrorMessage("Network error: Could not connect to the backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#ff4938]" />
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          onChange={(e) => setInput(e.target.files?.[0] || null)}
          accept="image/*"
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
          required
          disabled={isLoading}
        />

        {previewUrl ? (
          <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={previewUrl}
              alt="Selected upload preview"
              className="w-full max-h-72 object-contain"
            />
          </div>
        ) : null}

        <button
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#f6ab41] to-[#ff4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Eraser className="w-5" />
              Remove Background
            </>
          )}
        </button>
      </form>

      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-150">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <Eraser className="w-5 h-5 text-[#ff4938]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {isLoading ? (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 gap-3 min-h-[250px]">
              <Loader2 className="w-9 h-9 animate-spin text-[#ff4938]" />
              <p className="text-sm font-medium">Removing background from your image...</p>
            </div>
          ) : errorMessage ? (
            <div className="h-full flex flex-col justify-center items-center text-red-500 text-center gap-2 min-h-[250px] p-4">
              <p className="font-semibold text-sm">Processing Failed</p>
              <p className="text-xs text-gray-400 max-w-xs">{errorMessage}</p>
            </div>
          ) : content ? (
            <div className="flex justify-center">
              <img
                src={content}
                alt="Background removed result"
                className="w-full rounded-xl border border-gray-200 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] [background-size:24px_24px] [background-position:0_0,0_12px,12px_-12px,-12px_0px]"
              />
            </div>
          ) : (
            <div className="h-full flex justify-center items-center">
              <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                <Eraser className="w-9 h-9" />
                <p>Upload an image and click "Remove Background" to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveBackground;
