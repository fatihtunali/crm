import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, DollarSign, X, Trash2, Calendar } from 'lucide-react';
import api from '../services/api';

interface GuidePricing {
  id: number;
  city: string;
  serviceType: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  notes?: string;
}

interface Guide {
  id: number;
  firstName: string;
  lastName: string;
}

const SERVICE_TYPES = [
  { value: 'FULL_DAY', label: 'Tam Gün', description: '8-10 saat' },
  { value: 'HALF_DAY', label: 'Yarım Gün', description: '4-5 saat' },
  { value: 'TRANSFER', label: 'Transfer', description: 'Havaalanı karşılama' },
  { value: 'NIGHT_SERVICE', label: 'Gece Kullanımı', description: 'Yemek, eğlence' },
  { value: 'PACKAGE_TOUR', label: 'Paket Tur', description: 'Günlük fiyat' },
];

const GuidePricing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [guide, setGuide] = useState<Guide | null>(null);
  const [pricings, setPricings] = useState<GuidePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [city, setCity] = useState('');
  const [serviceType, setServiceType] = useState('FULL_DAY');
  const [seasonName, setSeasonName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchGuide();
    fetchPricings();
  }, [id]);

  const fetchGuide = async () => {
    try {
      const response = await api.get(`/guides/${id}`);
      setGuide(response.data.data);
    } catch (error) {
      console.error('Rehber yüklenirken hata:', error);
    }
  };

  const fetchPricings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/guides/${id}/pricings`);
      setPricings(response.data.data);
    } catch (error) {
      console.error('Fiyatlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!city || !serviceType || !seasonName || !startDate || !endDate || !price) {
      alert('Tüm alanları doldurun');
      return;
    }

    try {
      await api.post(`/guides/${id}/pricings`, {
        city,
        serviceType,
        seasonName,
        startDate,
        endDate,
        price: parseFloat(price),
        currency: 'EUR',
        notes,
      });

      // Reset form
      setCity('');
      setServiceType('FULL_DAY');
      setSeasonName('');
      setStartDate('');
      setEndDate('');
      setPrice('');
      setNotes('');
      setShowForm(false);

      fetchPricings();
    } catch (error: any) {
      console.error('Fiyat eklenirken hata:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (pricingId: number) => {
    if (!confirm('Bu fiyatı silmek istediğinizden emin misiniz?')) return;

    try {
      await api.delete(`/guides/pricings/${pricingId}`);
      fetchPricings();
    } catch (error) {
      console.error('Fiyat silinirken hata:', error);
    }
  };

  // Group pricings by city and season
  const groupedPricings = pricings.reduce((acc, pricing) => {
    const key = `${pricing.city}|${pricing.seasonName}`;
    if (!acc[key]) {
      acc[key] = {
        city: pricing.city,
        seasonName: pricing.seasonName,
        startDate: pricing.startDate,
        endDate: pricing.endDate,
        items: [],
      };
    }
    acc[key].items.push(pricing);
    return acc;
  }, {} as Record<string, any>);

  const getServiceLabel = (value: string) => {
    return SERVICE_TYPES.find(st => st.value === value)?.label || value;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/resources/guides')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Rehber Fiyatlandırma
                </h1>
                {guide && (
                  <p className="text-slate-600 mt-1">
                    {guide.firstName} {guide.lastName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {showForm ? 'İptal' : 'Yeni Fiyat Ekle'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Add Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Yeni Fiyat Ekle</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Şehir *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="İstanbul, Kapadokya, Antalya..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hizmet Tipi *
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {SERVICE_TYPES.map(st => (
                      <option key={st.value} value={st.value}>
                        {st.label} - {st.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sezon Adı *
                  </label>
                  <input
                    type="text"
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    placeholder="Yaz Sezonu, Kış Sezonu..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fiyat (EUR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notlar
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="İsteğe bağlı notlar..."
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-md transition-all"
                  >
                    Fiyat Ekle
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pricing List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Fiyatlar yükleniyor...</p>
            </div>
          ) : Object.keys(groupedPricings).length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <DollarSign className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz fiyat yok</h3>
              <p className="text-slate-600 mb-6">İlk fiyatı ekleyerek başla</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold"
              >
                <Plus className="h-5 w-5" />
                Yeni Fiyat Ekle
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.values(groupedPricings).map((group: any, idx: number) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Group Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-white border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{group.city}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {group.seasonName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(group.startDate).toLocaleDateString('tr-TR')} - {new Date(group.endDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prices - Table View */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          {SERVICE_TYPES.map(st => (
                            <th key={st.value} className="px-4 py-3 text-left">
                              <div>
                                <div className="font-semibold text-slate-900">{st.label}</div>
                                <div className="text-xs text-slate-600 font-normal">{st.description}</div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {SERVICE_TYPES.map(st => {
                            const pricing = group.items.find((p: GuidePricing) => p.serviceType === st.value);
                            return (
                              <td key={st.value} className="px-4 py-4 border-r border-slate-100 last:border-r-0">
                                {pricing ? (
                                  <div className="group relative">
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-xl font-bold text-green-700">€{Number(pricing.price)}</span>
                                      <span className="text-xs text-green-600">{pricing.currency}</span>
                                    </div>
                                    {pricing.notes && (
                                      <p className="text-xs text-slate-500 mt-1">{pricing.notes}</p>
                                    )}
                                    <button
                                      onClick={() => handleDelete(pricing.id)}
                                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-red-100 hover:bg-red-200 rounded-full transition-all shadow-sm"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-600" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-sm">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
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

export default GuidePricing;
