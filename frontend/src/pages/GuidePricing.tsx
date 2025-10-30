import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DollarSign, Save, X, Plus, Trash2, Edit2, Calendar, MapPin } from 'lucide-react';
import api from '../services/api';

interface Guide {
  id: number;
  firstName: string;
  lastName: string;
}

interface GuidePricing {
  id: number;
  city: string;
  language: string;
  serviceType: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  notes?: string;
}

interface PriceEntry {
  language: string;
  serviceType: string;
  price: string;
}

const LANGUAGES = [
  { code: 'TR', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'EN', name: 'English', flag: '🇬🇧' },
  { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'AR', name: 'العربية', flag: '🇸🇦' },
  { code: 'FR', name: 'Français', flag: '🇫🇷' },
  { code: 'ES', name: 'Español', flag: '🇪🇸' },
  { code: 'IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'JP', name: '日本語', flag: '🇯🇵' },
  { code: 'CN', name: '中文', flag: '🇨🇳' },
];

const SERVICE_TYPES = [
  { value: 'FULL_DAY', label: 'Tam Gün', hours: '8-10 saat' },
  { value: 'HALF_DAY', label: 'Yarım Gün', hours: '4-5 saat' },
  { value: 'TRANSFER', label: 'Transfer', hours: 'Havaalanı karşılama' },
  { value: 'NIGHT_SERVICE', label: 'Gece Hizmeti', hours: 'Yemek, eğlence' },
];

const TURKISH_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Konya', 'Gaziantep',
  'Kayseri', 'Kapadokya', 'Pamukkale', 'Fethiye', 'Bodrum', 'Marmaris', 'Kuşadası',
  'Çanakkale', 'Trabzon', 'Erzurum', 'Van', 'Diyarbakır'
];

const GuidePricing = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [guide, setGuide] = useState<Guide | null>(null);
  const [pricings, setPricings] = useState<GuidePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state for bulk entry
  const [city, setCity] = useState('');
  const [seasonName, setSeasonName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [notes, setNotes] = useState('');

  // Matrix of prices (language x serviceType)
  const [priceMatrix, setPriceMatrix] = useState<Record<string, string>>({});

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

  const getMatrixKey = (lang: string, serviceType: string) => `${lang}-${serviceType}`;

  const handlePriceChange = (lang: string, serviceType: string, value: string) => {
    setPriceMatrix({
      ...priceMatrix,
      [getMatrixKey(lang, serviceType)]: value,
    });
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!city || !seasonName || !startDate || !endDate) {
      alert('Şehir, sezon adı ve tarihler zorunludur');
      return;
    }

    // Collect all non-empty prices from the matrix
    const entries: PriceEntry[] = [];
    Object.entries(priceMatrix).forEach(([key, price]) => {
      if (price && parseFloat(price) > 0) {
        const [language, serviceType] = key.split('-');
        entries.push({ language, serviceType, price });
      }
    });

    if (entries.length === 0) {
      alert('En az bir fiyat girmelisiniz');
      return;
    }

    try {
      setLoading(true);

      // Create multiple pricing entries
      const promises = entries.map(entry =>
        api.post(`/guides/${id}/pricings`, {
          city,
          language: entry.language,
          serviceType: entry.serviceType,
          seasonName,
          startDate,
          endDate,
          price: parseFloat(entry.price),
          currency,
          notes,
        })
      );

      await Promise.all(promises);

      // Reset form
      setCity('');
      setSeasonName('');
      setStartDate('');
      setEndDate('');
      setNotes('');
      setPriceMatrix({});
      setShowForm(false);

      fetchPricings();
    } catch (error: any) {
      console.error('Fiyat eklenirken hata:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pricingId: number) => {
    if (!confirm('Bu fiyatı silmek istediğinize emin misiniz?')) return;

    try {
      await api.delete(`/guides/pricings/${pricingId}`);
      fetchPricings();
    } catch (error) {
      console.error('Fiyat silinirken hata:', error);
      alert('Fiyat silinirken bir hata oluştu');
    }
  };

  // Group pricings by city and season
  const groupedPricings = pricings.reduce((acc, pricing) => {
    const key = `${pricing.city}-${pricing.seasonName}`;
    if (!acc[key]) {
      acc[key] = {
        city: pricing.city,
        seasonName: pricing.seasonName,
        startDate: pricing.startDate,
        endDate: pricing.endDate,
        prices: [],
      };
    }
    acc[key].prices.push(pricing);
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Rehber Fiyatlandırması
                </h1>
              </div>
              <p className="text-slate-600">
                {guide && `${guide.firstName} ${guide.lastName}`} - Şehir, dil ve hizmet tipi bazlı fiyatlar
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                Toplu Fiyat Ekle
              </button>
              <button
                onClick={() => navigate('/resources/guides')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* Bulk Entry Form */}
          {showForm && (
            <form onSubmit={handleBulkSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Toplu Fiyat Girişi
              </h2>

              {/* City and Season Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <MapPin className="inline h-4 w-4 text-blue-600 mr-1" />
                    Şehir *
                  </label>
                  <select
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seçiniz</option>
                    {TURKISH_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sezon Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    placeholder="Örn: Yaz Sezonu"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="inline h-4 w-4 text-blue-600 mr-1" />
                    Başlangıç *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="inline h-4 w-4 text-blue-600 mr-1" />
                    Bitiş *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price Matrix Table */}
              <div className="overflow-x-auto">
                <p className="text-sm text-slate-600 mb-3">
                  Tabloda istediğiniz hizmet tipi ve dil kombinasyonları için fiyat girin. Boş bırakılan alanlar kaydedilmez.
                </p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-3 text-left font-bold text-slate-700">
                        Hizmet Tipi
                      </th>
                      {LANGUAGES.map(lang => (
                        <th key={lang.code} className="border border-slate-300 bg-gradient-to-br from-blue-50 to-blue-100 p-3 text-center font-semibold text-slate-700">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="text-xs">{lang.code}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SERVICE_TYPES.map(service => (
                      <tr key={service.value}>
                        <td className="border border-slate-300 bg-slate-50 p-3">
                          <div>
                            <div className="font-semibold text-slate-900">{service.label}</div>
                            <div className="text-xs text-slate-600">{service.hours}</div>
                          </div>
                        </td>
                        {LANGUAGES.map(lang => (
                          <td key={lang.code} className="border border-slate-300 p-2 bg-white">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={priceMatrix[getMatrixKey(lang.code, service.value)] || ''}
                              onChange={(e) => handlePriceChange(lang.code, service.value, e.target.value)}
                              placeholder="€"
                              className="w-full px-2 py-2 text-center border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notlar
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Ek notlar..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  {loading ? 'Kaydediliyor...' : 'Fiyatları Kaydet'}
                </button>
              </div>
            </form>
          )}

          {/* Existing Pricings - Grouped by City and Season */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Fiyatlar yükleniyor...</p>
            </div>
          ) : Object.keys(groupedPricings).length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <DollarSign className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz fiyat yok</h3>
              <p className="text-slate-600 mb-6">İlk fiyatı ekleyerek başla</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.values(groupedPricings).map((group: any, idx: number) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Group Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          {group.city} - {group.seasonName}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          <Calendar className="inline h-3.5 w-3.5 mr-1" />
                          {new Date(group.startDate).toLocaleDateString('tr-TR')} - {new Date(group.endDate).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                        {group.prices.length} fiyat
                      </span>
                    </div>
                  </div>

                  {/* Prices Table */}
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Dil</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Hizmet Tipi</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Fiyat</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.prices.map((pricing: GuidePricing) => {
                            const lang = LANGUAGES.find(l => l.code === pricing.language);
                            const service = SERVICE_TYPES.find(s => s.value === pricing.serviceType);
                            return (
                              <tr key={pricing.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{lang?.flag}</span>
                                    <span className="font-medium text-slate-900">{lang?.code}</span>
                                    <span className="text-sm text-slate-600">{lang?.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div>
                                    <div className="font-medium text-slate-900">{service?.label}</div>
                                    <div className="text-xs text-slate-600">{service?.hours}</div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className="text-lg font-bold text-green-700">
                                    {pricing.currency} {pricing.price}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => handleDelete(pricing.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
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

export default GuidePricing;
