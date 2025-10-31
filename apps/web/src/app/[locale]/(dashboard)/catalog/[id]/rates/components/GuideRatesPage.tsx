'use client';

import type { ServiceOffering } from '@/lib/api/endpoints/suppliers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface GuideRatesPageProps {
  offeringId: number;
  offering: ServiceOffering;
}

export default function GuideRatesPage({ offeringId, offering }: GuideRatesPageProps) {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/${locale}/suppliers/guides`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Guides
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Guide Service Rates</h1>
        <p className="text-gray-700 mt-1 text-base">
          {offering.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guide Rate Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Guide service rates management coming soon...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            This will include: day/half-day/hourly rates, overtime charges, holiday surcharges, language premiums, and group size pricing tiers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
