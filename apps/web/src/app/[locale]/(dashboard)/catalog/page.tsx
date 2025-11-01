'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hotel, Map, Truck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CatalogPage() {
  const params = useParams();
  const locale = params.locale as string;

  const catalogs = [
    {
      title: 'Hotels',
      description: 'Browse available hotels with pricing',
      href: `/${locale}/catalog/hotels`,
      icon: Hotel,
      color: 'bg-blue-500',
    },
    {
      title: 'Tours',
      description: 'View SIC tours and pricing',
      href: `/${locale}/catalog/tours`,
      icon: Map,
      color: 'bg-green-500',
    },
    {
      title: 'Transfers',
      description: 'Intercity transfer options',
      href: `/${locale}/catalog/transfers`,
      icon: Truck,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Catalog</h1>
        <p className="text-gray-700 mt-1 text-base">
          Browse available services for quote building
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {catalogs.map((catalog) => (
          <Card key={catalog.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className={`${catalog.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <catalog.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle>{catalog.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{catalog.description}</p>
              <Link href={catalog.href}>
                <Button className="w-full">Browse {catalog.title}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
