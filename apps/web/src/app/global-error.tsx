'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div>
              <h1 className="text-6xl font-bold text-gray-900">500</h1>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">Something went wrong!</h2>
              <p className="mt-2 text-sm text-gray-600">
                {error.message || 'An unexpected error occurred'}
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => reset()}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
