export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#050816] text-white">
      <div className="text-center space-y-3">
        
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />

        <p className="text-sm text-gray-400">
          Loading AllChain Intelligence...
        </p>

      </div>
    </div>
  );
}