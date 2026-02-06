interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorMessage({ 
  title = "Error", 
  message, 
  onRetry, 
  showRetry = false 
}: ErrorMessageProps) {
  return (
    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
      <h3 className="text-red-400 font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}