'use client';
import AuthGuard from "../components/auth/AuthGuard";

export default function NFTPage() {
  return (
    <AuthGuard>
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#0B1220] text-white">
      
      <div className="text-center space-y-4">
        
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug">
          NFT Marketplace - Coming Soon 🚀
        </h1>

        <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
          We’re building a next-gen NFT trading experience with real-time pricing, AI insights, and instant minting support.
        </p>

      </div>
    </div>
    </AuthGuard>
  );
}