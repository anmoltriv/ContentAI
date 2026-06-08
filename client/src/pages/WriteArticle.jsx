import { Edit, Sparkles, Loader2 } from "lucide-react";
import React from "react";
import { useAi } from "../context/AiContext";

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200+ words)" },
  ];

  const {
    articleState,
    setArticleState,
    generateArticle,
  } = useAi();

  const selectedLength =
    articleLength.find((item) => item.length === articleState.selectedLength) ||
    articleLength[0];

  const onSubmitHandler = async (e) => {
    e.preventDefault(); 
    
    // Safety guard to prevent blank submissions
    if (!articleState.input.trim()) return alert("Please enter a topic first!");

    generateArticle({
      prompt: articleState.input,
      length: selectedLength.length,
    });
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      
      {/* LEFT COLUMN: Configuration Input Form */}
      <form onSubmit={onSubmitHandler} className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4A7AAF]" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>
        
        <p className="mt-6 text-sm font-medium">Article Topic</p>
        <input
          value={articleState.input}
          onChange={(e) =>
            setArticleState((current) => ({
              ...current,
              input: e.target.value,
            }))
          }
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-blue-400"
          placeholder="The Future of Artificial Intelligence is ..."
          disabled={articleState.isLoading}
        />
        
        <p className="mt-4 text-sm font-medium">Article Length</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {articleLength.map((item, index) => (
            <span
              key={index}
              onClick={() =>
                !articleState.isLoading &&
                setArticleState((current) => ({
                  ...current,
                  selectedLength: item.length,
                }))
              }
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedLength.text === item.text
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'text-gray-500 border-gray-300 hover:bg-gray-50'
              } ${articleState.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {item.text}
            </span>
          ))}
        </div>
        
        <button 
          disabled={articleState.isLoading}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#63a2ea] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer font-medium disabled:opacity-75 disabled:cursor-not-allowed shadow-xs"
        >
          {articleState.isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Edit className="w-5"/>
              Generate Article
            </>
          )}
        </button>
      </form>

      {/* RIGHT COLUMN: Real-Time Generated Output Display */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-150">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <Edit className="w-5 h-5 text-[#4A7AFF]"/>
          <h1 className="text-xl font-semibold">Generated Article</h1>
        </div>
        
        {/* Dynamic Display Area */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {articleState.isLoading ? (
            /* Loading Interface Block */
            <div className="h-full flex flex-col justify-center items-center text-gray-400 gap-3 min-h-[250px]">
              <Loader2 className="w-9 h-9 animate-spin text-[#4A7AFF]" />
              <p className="text-sm font-medium">Gemini is drafting your article...</p>
            </div>
          ) : articleState.errorMessage ? (
            /* Error Interface Block */
            <div className="h-full flex flex-col justify-center items-center text-red-500 text-center gap-2 min-h-[250px] p-4">
              <p className="font-semibold text-sm">Generation Failed</p>
              <p className="text-xs text-gray-400 max-w-xs">{articleState.errorMessage}</p>
            </div>
          ) : articleState.content ? (
            /* Success Response Block */
            <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed selection:bg-blue-100">
              {articleState.content}
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center min-h-[250px]">
              <div className="text-sm flex flex-col items-center gap-4 text-gray-400">
                <Edit className="w-9 h-9 stroke-1"/>
                <p className="text-center max-w-xs">Enter a topic and click "Generate Article" to get started</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default WriteArticle;
