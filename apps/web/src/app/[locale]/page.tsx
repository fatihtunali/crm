import { redirect } from 'next/navigation';

export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // In Next.js 15, params is now async
  const { locale } = await params;

  // Redirect to dashboard
  redirect(`/${locale}/dashboard`);
}
