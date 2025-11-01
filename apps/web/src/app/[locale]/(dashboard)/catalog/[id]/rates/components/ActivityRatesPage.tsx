'use client';

import type { ServiceOffering } from '@/lib/api/endpoints/suppliers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ActivityRatesPageProps {
  offering: ServiceOffering;
}

export default function ActivityRatesPage({ offering }: ActivityRatesPageProps) {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/${locale}/suppliers/activities`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Activities
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Activity Rates</h1>
        <p className="text-gray-700 mt-1 text-base">
          {offering.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Rate Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Activity rates management coming soon...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            This will include: per person/group pricing, tiered pricing based on group size, min/max participants, child discounts, and seasonal variations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
