import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Page not found
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
