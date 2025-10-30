import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  DollarSign,
  Hotel,
  Car,
  UserCheck,
  UtensilsCrossed,
  MapPin,
  FileText,
  CreditCard,
} from 'lucide-react';
import api from '../services/api';

interface Reservation {
  id: number;
  reservationCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  totalCost: number;
  totalPrice: number;
  profit: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  adultCount: number;
  childCount: number;
  notes: string;
  internalNotes: string;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    agent?: {
      id: number;
      companyName: string;
      contactPerson: string;
    };
  };
  participants: Array<{
    id: number;
    participantType: string;
    firstName: string;
    lastName: string;
    age?: number;
  }>;
  days: Array<{
    id: number;
    dayNumber: number;
    date: string;
    hotel?: {
      id: number;
      name: string;
      city: string;
    };
    roomType: string;
    guide?: {
      id: number;
      firstName: string;
      lastName: string;
    };
    guideService: string;
    transferType: string;
    vehicleType: string;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    description: string;
    notes: string;
    dayCost: number;
    dayPrice: number;
    activities: Array<{
      id: number;
      activityType: string;
      name: string;
      cost: number;
      price: number;
      notes: string;
      supplier?: {
        id: number;
        name: string;
      };
    }>;
  }>;
  payments: Array<{
    id: number;
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentDate: string;
    notes: string;
  }>;
}

const ReservationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const fetchReservation = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reservations/${id}`);
      setReservation(response.data.data);
    } catch (error) {
      console.error('Fetch reservation error:', error);
      alert('Rezervasyon yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    const labels = {
      PENDING: 'Beklemede',
      CONFIRMED: 'Onaylandı',
      CANCELLED: 'İptal',
      COMPLETED: 'Tamamlandı',
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
          badges[status as keyof typeof badges]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getParticipantTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ADULT: 'Yetişkin',
      CHILD_0_2: 'Çocuk 0-2',
      CHILD_3_5: 'Çocuk 3-5',
      CHILD_6_11: 'Çocuk 6-11',
      STUDENT: 'Öğrenci',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-slate-600 mb-4">Rezervasyon bulunamadı</p>
        <button onClick={() => navigate('/reservations')} className="text-blue-600 hover:underline">
          Rezervasyonlara Dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/reservations')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-blue-600">{reservation.reservationCode}</h1>
                  {getStatusBadge(reservation.status)}
                </div>
                <p className="text-slate-600 mt-1">
                  {new Date(reservation.startDate).toLocaleDateString('tr-TR')} -{' '}
                  {new Date(reservation.endDate).toLocaleDateString('tr-TR')} ({reservation.totalDays} gün)
                </p>
              </div>
            </div>
            <Link
              to={`/reservations/${id}/edit`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Edit className="h-5 w-5" />
              Düzenle
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Müşteri Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Müşteri</p>
                <p className="text-lg font-semibold text-slate-900">
                  {reservation.customer.firstName} {reservation.customer.lastName}
                </p>
                <p className="text-sm text-slate-600">{reservation.customer.email}</p>
                {reservation.customer.phone && (
                  <p className="text-sm text-slate-600">{reservation.customer.phone}</p>
                )}
              </div>
              {reservation.customer.agent && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-700 font-medium mb-1">Acente (B2B)</p>
                  <p className="text-lg font-bold text-indigo-900">{reservation.customer.agent.companyName}</p>
                  <p className="text-sm text-indigo-700">{reservation.customer.agent.contactPerson}</p>
                </div>
              )}
              {!reservation.customer.agent && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">Direkt Müşteri (B2C)</p>
                  <p className="text-xs text-green-600 mt-1">Acentesiz rezervasyon</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border-2 border-blue-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Finansal Özet
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <p className="text-sm text-slate-600 mb-1">Maliyet</p>
                <p className="text-xl font-bold text-red-600">
                  {reservation.currency} {Number(reservation.totalCost).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-slate-600 mb-1">Satış Fiyatı</p>
                <p className="text-xl font-bold text-green-600">
                  {reservation.currency} {Number(reservation.totalPrice).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-slate-600 mb-1">Kar</p>
                <p className="text-xl font-bold text-purple-600">
                  {reservation.currency} {Number(reservation.profit).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 mb-1">Ödenen</p>
                <p className="text-xl font-bold text-blue-600">
                  {reservation.currency} {Number(reservation.paidAmount).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-slate-600 mb-1">Kalan</p>
                <p className="text-xl font-bold text-orange-600">
                  {reservation.currency} {Number(reservation.remainingAmount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              Katılımcılar ({reservation.adultCount} yetişkin, {reservation.childCount} çocuk)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reservation.participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {participant.firstName} {participant.lastName}
                    </p>
                    <p className="text-xs text-slate-600">
                      {getParticipantTypeLabel(participant.participantType)}
                      {participant.age && ` - ${participant.age} yaş`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Itinerary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Günlük Program
            </h2>
            <div className="space-y-4">
              {reservation.days.map((day) => (
                <div key={day.id} className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-blue-900">
                      Gün {day.dayNumber} - {new Date(day.date).toLocaleDateString('tr-TR')}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-red-700 font-semibold">Maliyet: €{Number(day.dayCost).toFixed(2)}</span>
                      <span className="text-green-700 font-semibold">Satış: €{Number(day.dayPrice).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hotel */}
                    {day.hotel && (
                      <div className="flex items-start gap-2">
                        <Hotel className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{day.hotel.name}</p>
                          <p className="text-xs text-slate-600">
                            {day.hotel.city} - {day.roomType || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Guide */}
                    {day.guide && (
                      <div className="flex items-start gap-2">
                        <UserCheck className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {day.guide.firstName} {day.guide.lastName}
                          </p>
                          <p className="text-xs text-slate-600">{day.guideService || 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {/* Vehicle */}
                    {day.vehicleType && (
                      <div className="flex items-start gap-2">
                        <Car className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{day.vehicleType}</p>
                          {day.transferType && <p className="text-xs text-slate-600">{day.transferType}</p>}
                        </div>
                      </div>
                    )}

                    {/* Meals */}
                    {(day.breakfast || day.lunch || day.dinner) && (
                      <div className="flex items-start gap-2">
                        <UtensilsCrossed className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Yemekler</p>
                          <p className="text-xs text-slate-600">
                            {[
                              day.breakfast && 'Kahvaltı',
                              day.lunch && 'Öğle',
                              day.dinner && 'Akşam',
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {day.description && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <p className="text-sm font-medium text-slate-900 flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Program
                      </p>
                      <p className="text-sm text-slate-700">{day.description}</p>
                    </div>
                  )}

                  {/* Activities */}
                  {day.activities && day.activities.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-semibold text-slate-900">Aktiviteler:</p>
                      {day.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-purple-900">{activity.name}</p>
                            {activity.supplier && (
                              <p className="text-xs text-purple-700">{activity.supplier.name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-red-700">Maliyet: €{Number(activity.cost).toFixed(2)}</p>
                            <p className="text-sm text-green-700 font-semibold">
                              Satış: €{Number(activity.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Day Notes */}
                  {day.notes && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs font-medium text-amber-900 mb-1">Notlar:</p>
                      <p className="text-xs text-amber-800">{day.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payments */}
          {reservation.payments && reservation.payments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Ödemeler
              </h2>
              <div className="space-y-3">
                {reservation.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {payment.currency} {Number(payment.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {payment.paymentMethod} - {new Date(payment.paymentDate).toLocaleDateString('tr-TR')}
                      </p>
                      {payment.notes && <p className="text-xs text-slate-500 mt-1">{payment.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {(reservation.notes || reservation.internalNotes) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                Notlar
              </h2>
              <div className="space-y-4">
                {reservation.notes && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Müşteri Notları</p>
                    <p className="text-sm text-slate-600 p-3 bg-blue-50 rounded-lg">{reservation.notes}</p>
                  </div>
                )}
                {reservation.internalNotes && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Dahili Notlar</p>
                    <p className="text-sm text-slate-600 p-3 bg-amber-50 rounded-lg">{reservation.internalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationDetail;
