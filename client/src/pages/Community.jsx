import React from "react";
import { Heart } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useAi } from "../context/AiContext";

const Community = () => {
  const { user, isLoaded } = useUser();
  const { communityCreations, communityLoading, communityError } = useAi();

  if (!isLoaded || communityLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <p className="text-gray-500">Loading community...</p>
      </div>
    );
  }

  if (communityError) {
    return (
      <div className="flex-1 flex items-center justify-center h-full p-6">
        <div className="bg-white border border-red-200 text-red-500 rounded-xl px-4 py-3">
          {communityError}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full gap-4 p-6">
      <h1 className="text-xl font-bold">Creations</h1>

      <div className="bg-white h-full w-full rounded-xl overflow-y-scroll grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-3 content-start">
        {communityCreations.length ? (
          communityCreations.map((creation) => {
            const isLiked = user && creation.likes?.includes(user.id);

            return (
              <div
                key={creation.id}
                className="relative group w-full aspect-square rounded-lg overflow-hidden"
              >
                <img
                  src={creation.content}
                  alt={creation.prompt || "Creation"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 flex gap-2 items-end justify-between p-4 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white transition-opacity duration-300">
                  <p className="text-sm line-clamp-2 max-w-[70%]">
                    {creation.prompt}
                  </p>
                  <div className="flex flex-col items-center gap-1">
                    <Heart
                      className={`w-6 h-6 hover:scale-110 cursor-pointer transition-transform ${
                        isLiked ? "fill-red-500 text-red-500" : "text-white"
                      }`}
                    />
                    <p className="text-xs font-semibold">
                      {creation.likes?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex items-center justify-center min-h-60 text-gray-500">
            No public images have been shared yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
