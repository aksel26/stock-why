interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "오류가 발생했습니다",
  message = "잠시 후 다시 시도해주세요.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-[#1a1a1a] text-[#caff33] px-6 py-3 rounded-full hover:bg-black transition-colors duration-200 font-semibold text-sm"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
