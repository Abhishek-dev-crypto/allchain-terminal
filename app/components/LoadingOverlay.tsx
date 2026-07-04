type Props = {
    message?: string;
};

export default function LoadingOverlay({
    message = "Updating AI..."
}: Props) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] text-xs text-gray-300">
            {message}
        </div>
    );
}