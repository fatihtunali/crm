'use client';

import { useParams } from 'next/navigation';
import { useServiceOffering } from '@/lib/api/hooks/use-suppliers';
import { ServiceType } from '@/lib/api/endpoints/suppliers';
import HotelRoomRatesPage from './components/HotelRoomRatesPage';
import TransferRatesPage from './components/TransferRatesPage';
import VehicleRatesPage from './components/VehicleRatesPage';
import GuideRatesPage from './components/GuideRatesPage';
import ActivityRatesPage from './components/ActivityRatesPage';

export default function ServiceRatesPage() {
  const params = useParams();
  const offeringId = parseInt(params.id as string);

  const { data: offering, isLoading } = useServiceOffering(offeringId);

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!offering?.data) {
    return (
      <div className="p-8">
        <p>Service offering not found</p>
      </div>
    );
  }

  const serviceType = offering.data.serviceType;

  // Route to the appropriate rate management component based on service type
  switch (serviceType) {
    case ServiceType.HOTEL_ROOM:
      return <HotelRoomRatesPage offeringId={offeringId} offering={offering.data} />;

    case ServiceType.TRANSFER:
      return <TransferRatesPage offeringId={offeringId} offering={offering.data} />;

    case ServiceType.VEHICLE_HIRE:
      return <VehicleRatesPage offeringId={offeringId} offering={offering.data} />;

    case ServiceType.GUIDE_SERVICE:
      return <GuideRatesPage offeringId={offeringId} offering={offering.data} />;

    case ServiceType.ACTIVITY:
      return <ActivityRatesPage offeringId={offeringId} offering={offering.data} />;

    default:
      return (
        <div className="p-8">
          <p>Unknown service type: {serviceType}</p>
        </div>
      );
  }
}
