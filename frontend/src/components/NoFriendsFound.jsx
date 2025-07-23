import React from 'react';
import { Users, UserPlus, Search } from 'lucide-react';

const NoFriendsFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[100%] bg-gray-1100 text-gray-300 p-8 rounded-lg">
      {/* Animated Icon Container */}
      <div className="relative mb-6">
        {/* Background Circle with Pulse Animation */}
        <div className="absolute inset-0 bg-gray-800 rounded-full animate-pulse opacity-50"></div>
        
        {/* Main Icon */}
        <div className="relative bg-gray-800 p-6 rounded-full border border-gray-700 transform transition-all duration-500 hover:scale-110 hover:bg-gray-750">
          <Users className="w-12 h-12 text-gray-400" />
        </div>
        
        {/* Floating Search Icon */}
        <div className="absolute -top-2 -right-2 bg-blue-600 p-2 rounded-full animate-bounce">
          <Search className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Main Message */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-200 mb-2 animate-fade-in">
          No Friends Found
        </h3>
        <p className="text-gray-400 max-w-md leading-relaxed animate-fade-in-delay">
          It looks like you haven't added any friends yet. Start connecting with people to begin chatting!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
          <UserPlus className="w-4 h-4" />
          Add Friends
        </button>
        
        <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg border border-gray-600 transition-all duration-300 transform hover:scale-105">
          <Search className="w-4 h-4" />
          Discover People
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-60"></div>
      <div className="absolute bottom-10 right-10 w-1 h-1 bg-purple-500 rounded-full animate-ping opacity-40" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping opacity-50" style={{animationDelay: '2s'}}></div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-delay {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default NoFriendsFound;