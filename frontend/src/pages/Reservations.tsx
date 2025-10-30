import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, User, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';

interface Reservation {
  id: number;
  reservationCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    agent?: {
      id: number;
      companyName: string;
    };
  };
  _count: {
    days: number;
    participants: number;
  };
}

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/reservations', { params });
      setReservations(response.data.data);
    } catch (error) {
      console.error('Fetch reservations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) return;

    try {
      await api.delete(`/reservations/${id}`);
      fetchReservations();
    } catch (error) {
      console.error('Delete reservation error:', error);
      alert('Rezervasyon silinirken hata oluştu');
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredReservations = reservations.filter((res) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      res.reservationCode.toLowerCase().includes(searchLower) ||
      res.customer.firstName.toLowerCase().includes(searchLower) ||
      res.customer.lastName.toLowerCase().includes(searchLower) ||
      res.customer.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Rezervasyonlar</h1>
              <p className="text-slate-600 mt-1">Tüm rezervasyonları görüntüle ve yönet</p>
            </div>
            <Link
              to="/reservations/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5" />
              Yeni Rezervasyon
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rezervasyon kodu, müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PENDING">Beklemede</option>
            <option value="CONFIRMED">Onaylandı</option>
            <option value="CANCELLED">İptal</option>
            <option value="COMPLETED">Tamamlandı</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Rezervasyonlar yükleniyor...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Henüz rezervasyon eklenmemiş</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    {/* Left: Reservation Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-bold text-blue-600">
                          {reservation.reservationCode}
                        </h3>
                        {getStatusBadge(reservation.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Customer */}
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-slate-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {reservation.customer.firstName} {reservation.customer.lastName}
                            </p>
                            <p className="text-xs text-slate-600">{reservation.customer.email}</p>
                            {reservation.customer.agent && (
                              <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                                {reservation.customer.agent.companyName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-slate-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(reservation.startDate).toLocaleDateString('tr-TR')} -{' '}
                              {new Date(reservation.endDate).toLocaleDateString('tr-TR')}
                            </p>
                            <p className="text-xs text-slate-600">
                              {reservation.totalDays} gün | {reservation._count.participants} katılımcı
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-slate-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {reservation.currency} {Number(reservation.totalPrice).toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-600">
                              Ödenen: {reservation.currency} {Number(reservation.paidAmount).toFixed(2)}
                            </p>
                            {Number(reservation.remainingAmount) > 0 && (
                              <p className="text-xs text-red-600 font-medium">
                                Kalan: {reservation.currency} {Number(reservation.remainingAmount).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/reservations/${reservation.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Detaylar"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/reservations/${reservation.id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(reservation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
