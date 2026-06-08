import { Hash, Loader2, Sparkles } from "lucide-react";
import React from "react";
import { useAi } from "../context/AiContext";

const BlogTitles = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Education",
    "Travel",
    " Food",
  ];

  const {
    blogState,
    setBlogState,
    generateBlogTitles,
  } = useAi();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!blogState.input.trim()) return alert("Please enter a keyword first!");

    generateBlogTitles({
      keyword: blogState.input,
      category: blogState.selectedCategory,
    });
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">AI Title Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Keyword</p>
        <input
          onChange={(e) =>
            setBlogState((current) => ({
              ...current,
              input: e.target.value,
            }))
          }
          value={blogState.input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-purple-400"
          placeholder="The Future of Artificial Intelligence is ..."
          disabled={blogState.isLoading}
        />
        <p className="mt-4 text-sm font-medium">Category</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {blogCategories.map((item, index) => (
            <span
              key={index}
              onClick={() =>
                !blogState.isLoading &&
                setBlogState((current) => ({
                  ...current,
                  selectedCategory: item,
                }))
              }
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${blogState.selectedCategory == item ? "bg-purple-50 text-purple-700 border-purple-300" : "text-gray-500 border-gray-300"} ${blogState.isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {item}
            </span>
          ))}
        </div>
        <button
          type="submit"
          disabled={blogState.isLoading}
          className="w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#65adff] to-[#c341f6] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {blogState.isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Hash className="w-5" />
              Generate Title
            </>
          )}
        </button>
      </form>
      {/* right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-150">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <Hash className="w-5 h-5 text-[#8e37eb]" />
          <h1 className="text-xl font-semibold">Generated Titles</h1>
        </div>
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {blogState.isLoading ? (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 gap-3 min-h-[250px]">
              <Loader2 className="w-9 h-9 animate-spin text-[#8e37eb]" />
              <p className="text-sm font-medium">
                Gemini is generating blog titles...
              </p>
            </div>
          ) : blogState.errorMessage ? (
            <div className="h-full flex flex-col justify-center items-center text-red-500 text-center gap-2 min-h-[250px] p-4">
              <p className="font-semibold text-sm">Generation Failed</p>
              <p className="text-xs text-gray-400 max-w-xs">{blogState.errorMessage}</p>
            </div>
          ) : blogState.titles.length ? (
            <div className="space-y-3">
              {blogState.titles.map((title, index) => (
                <div
                  key={`${title}-${index}`}
                  className="rounded-lg border border-purple-100 bg-purple-50/40 p-3"
                >
                  <p className="text-xs text-purple-500 font-medium">
                    Title {index + 1}
                  </p>
                  <p className="text-sm text-gray-800 mt-1">{title}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex justify-center items-center">
              <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                <Hash className="w-9 h-9" />
                <p>Enter a Topic and click "Generate Titles" to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogTitles;
