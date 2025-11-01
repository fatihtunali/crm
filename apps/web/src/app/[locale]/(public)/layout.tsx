'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plane } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Simple Public Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${locale}/portal`} className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">Travel Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/portal`}
              className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href={`/${locale}/portal/request`}
              className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
            >
              Request Itinerary
            </Link>
            <Link
              href={`/${locale}/login`}
              className="text-sm font-medium bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Agent Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t bg-gray-50 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Travel Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
