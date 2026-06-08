import React from "react";
import { Gem, Sparkles } from "lucide-react";
import { Protect } from "@clerk/clerk-react";
import CreationItem from "../components/CreationItem";
import { useAi } from "../context/AiContext";

const Dashboard = () => {
  const { creations, creationsLoading, creationsError } = useAi();
  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex justify-start gap-4 flex-wrap">
        {/* Total Creation Card */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">Total Creations</p>{" "}
            <h2 className="text-lg font-semibold">{creations.length}</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#3588F2] to-[#0bb0d7] text-white flex justify-center items-center">
            <Sparkles className="w-5 text-white" />
          </div>
        </div>
        {/* Active Plan Card */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">Active Plan</p>{" "}
            <h2 className="text-lg font-semibold">
              <Protect
                plan="premium"
                fallback={<span className="text-gray-700">Free Plan</span>}
              >
                <span className="bg-linear-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                  Premium Plan
                </span>
              </Protect>{" "}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#ff61c5] to-[#9e53ee] text-white flex justify-center items-center">
            <Gem className="w-5 text-white" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <p className='mt-6 mb-4'> Recent Creations </p>
        {creationsLoading ? (
          <div className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg text-gray-500">
            Loading your history...
          </div>
        ) : creationsError ? (
          <div className="p-4 max-w-5xl text-sm bg-white border border-red-200 rounded-lg text-red-500">
            {creationsError}
          </div>
        ) : creations.length ? (
          creations.map((item) => <CreationItem key={item.id} item={item} />)
        ) : (
          <div className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg text-gray-500">
            No creations found yet. Generate an article, title, or image to see it here.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
