import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from '../providers';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from 'sonner';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // In Next.js 15, params is now async
  await params; // Ensure params is awaited even though we don't use locale here

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        {children}
        <Toaster />
        <Sonner />
      </Providers>
    </NextIntlClientProvider>
  );
}
