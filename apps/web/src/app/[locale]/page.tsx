import { redirect } from 'next/navigation';

export default function LocaleRootPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Redirect to dashboard
  redirect(`/${locale}/dashboard`);
}
