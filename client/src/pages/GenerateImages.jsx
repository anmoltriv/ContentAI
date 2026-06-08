import { Image, Loader2, Sparkles } from "lucide-react";
import React from "react";
import { useAi } from "../context/AiContext";

const GenerateImages = () => {
  const ImageStyle = [
    "Realistic",
    "Ghibli",
    "Anime",
    "Cartoon",
    "Fantasy",
    "3d",
    "Potrait",
  ];

  const {
    imageState,
    setImageState,
    generateImage,
  } = useAi();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!imageState.input.trim()) return alert("Please enter an image prompt first!");

    generateImage({
      prompt: imageState.input,
      style: imageState.selectedStyle,
      publish: imageState.publish,
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
          <Sparkles className="w-6 text-green-500" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Describe Your Image</p>
        <textarea
          onChange={(e) =>
            setImageState((current) => ({
              ...current,
              input: e.target.value,
            }))
          }
          rows={4}
          value={imageState.input}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 h-25 focus:border-green-400"
          placeholder="Describe what you want to See"
          disabled={imageState.isLoading}
        />
        <p className="mt-4 text-sm font-medium">Style</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {ImageStyle.map((item, index) => (
            <span
              key={index}
              onClick={() =>
                !imageState.isLoading &&
                setImageState((current) => ({
                  ...current,
                  selectedStyle: item,
                }))
              }
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${imageState.selectedStyle == item ? "bg-green-50 text-green-700 border-green-300" : "text-gray-500 border-gray-300"} ${imageState.isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="my-6 flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) =>
                setImageState((current) => ({
                  ...current,
                  publish: e.target.checked,
                }))
              }
              checked={imageState.publish}
              className="sr-only peer"
              disabled={imageState.isLoading}
            />
            <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition"></div>
            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>
          <p>Make this image public</p>
        </div>

        <button
          type="submit"
          disabled={imageState.isLoading}
          className="w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {imageState.isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image className="w-5" />
              Generate Image
            </>
          )}
        </button>
      </form>
      {/* right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-150">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <Image className="w-5 h-5 text-green-500" />
          <h1 className="text-xl font-semibold">Generated Image</h1>
        </div>
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {imageState.isLoading ? (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 gap-3 min-h-[250px]">
              <Loader2 className="w-9 h-9 animate-spin text-green-500" />
              <p className="text-sm font-medium">Hugging Face is generating your image...</p>
            </div>
          ) : imageState.errorMessage ? (
            <div className="h-full flex flex-col justify-center items-center text-red-500 text-center gap-2 min-h-[250px] p-4">
              <p className="font-semibold text-sm">Generation Failed</p>
              <p className="text-xs text-gray-400 max-w-xs">{imageState.errorMessage}</p>
            </div>
          ) : imageState.content ? (
            <div className="flex justify-center">
              <img src={imageState.content} alt="Generated AI artwork" className="w-full rounded-xl border border-gray-200" />
            </div>
          ) : (
            <div className="h-full flex justify-center items-center">
              <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                <Image className="w-9 h-9" />
                <p>Enter a prompt and click "Generate image" to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateImages;
