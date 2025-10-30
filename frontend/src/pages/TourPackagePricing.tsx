import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  Trash2,
  Package,
  Clock,
  Check,
  X as XIcon,
} from 'lucide-react';

interface TourPackage {
  id: number;
  packageName: string;
  city: string;
  duration: number; // hours
  description?: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  adultPrice: any;
  child0to6Price: any;
  child7to12Price: any;
  studentPrice?: any;
  includesLunch: boolean;
  includesEntrance: boolean;
  includesGuide: boolean;
  includesTransport: boolean;
  currency: string;
  notes?: string;
  isActive: boolean;
}

interface Supplier {
  id: number;
  name: string;
  type: string;
}

const AGE_CATEGORIES = [
  { key: 'adultPrice', label: 'Yetişkin', description: 'Adult', color: 'blue' },
  { key: 'child0to6Price', label: 'Çocuk 0-6', description: '0-6 yaş', color: 'pink' },
  { key: 'child7to12Price', label: 'Çocuk 7-12', description: '7-12 yaş', color: 'rose' },
  { key: 'studentPrice', label: 'Öğrenci', description: 'Student', color: 'amber' },
];

const TourPackagePricing: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    packageName: '',
    city: '',
    duration: '',
    description: '',
    seasonName: '',
    startDate: '',
    endDate: '',
    adultPrice: '',
    child0to6Price: '',
    child7to12Price: '',
    studentPrice: '',
    includesLunch: false,
    includesEntrance: false,
    includesGuide: false,
    includesTransport: false,
    currency: 'EUR',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [supplierRes, packagesRes] = await Promise.all([
        api.get(`/suppliers/${id}`),
        api.get(`/suppliers/${id}/tour-packages`),
      ]);
      setSupplier(supplierRes.data.data);
      setPackages(packagesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      packageName,
      city,
      duration,
      seasonName,
      startDate,
      endDate,
      adultPrice,
      child0to6Price,
      child7to12Price,
      studentPrice,
    } = formData;

    if (
      !packageName ||
      !city ||
      !duration ||
      !seasonName ||
      !startDate ||
      !endDate ||
      !adultPrice ||
      !child0to6Price ||
      !child7to12Price
    ) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      await api.post(`/suppliers/${id}/tour-packages`, formData);
      alert('Tur paketi başarıyla eklendi');
      setShowForm(false);
      setFormData({
        packageName: '',
        city: '',
        duration: '',
        description: '',
        seasonName: '',
        startDate: '',
        endDate: '',
        adultPrice: '',
        child0to6Price: '',
        child7to12Price: '',
        studentPrice: '',
        includesLunch: false,
        includesEntrance: false,
        includesGuide: false,
        includesTransport: false,
        currency: 'EUR',
        notes: '',
      });
      fetchData();
    } catch (error: any) {
      console.error('Error creating tour package:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (packageId: number) => {
    if (!window.confirm('Bu tur paketini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/tour-packages/${packageId}`);
      alert('Tur paketi silindi');
      fetchData();
    } catch (error) {
      console.error('Error deleting tour package:', error);
      alert('Silme işlemi başarısız');
    }
  };

  // Group by city + season
  const groupedPackages = packages.reduce((acc, pkg) => {
    const key = `${pkg.city}-${pkg.seasonName}`;
    if (!acc[key]) {
      acc[key] = {
        city: pkg.city,
        seasonName: pkg.seasonName,
        startDate: pkg.startDate,
        endDate: pkg.endDate,
        items: [],
      };
    }
    acc[key].items.push(pkg);
    return acc;
  }, {} as any);

  const groups = Object.values(groupedPackages);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/resources/suppliers')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tur Paketleri</h1>
            <p className="text-slate-600 mt-1">
              {supplier?.name} - Tur Paket Fiyatlandırması
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Yeni Paket Fiyatı
        </button>
      </div>

      {/* New Package Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Yeni Tur Paketi Fiyatı</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Package Name & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Paket Adı *
                </label>
                <input
                  type="text"
                  value={formData.packageName}
                  onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                  placeholder="Örn: Green Tour, Red Tour"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Şehir *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Örn: Nevşehir, Antalya"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Duration & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Süre (Saat) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="6"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kısa açıklama"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Season & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sezon Adı *
                </label>
                <input
                  type="text"
                  value={formData.seasonName}
                  onChange={(e) => setFormData({ ...formData, seasonName: e.target.value })}
                  placeholder="Yaz Sezonu 2025"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Başlangıç *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Bitiş *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {AGE_CATEGORIES.map((category) => (
                <div key={category.key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {category.label} {category.key !== 'studentPrice' && '*'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData[category.key as keyof typeof formData] as string}
                    onChange={(e) =>
                      setFormData({ ...formData, [category.key]: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required={category.key !== 'studentPrice'}
                  />
                </div>
              ))}
            </div>

            {/* Includes Flags */}
            <div className="border-t border-slate-200 pt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Paket İçeriği (Dahil Olan Hizmetler)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includesLunch}
                    onChange={(e) =>
                      setFormData({ ...formData, includesLunch: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">Öğle Yemeği</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includesEntrance}
                    onChange={(e) =>
                      setFormData({ ...formData, includesEntrance: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">Giriş Ücretleri</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includesGuide}
                    onChange={(e) =>
                      setFormData({ ...formData, includesGuide: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">Rehber</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includesTransport}
                    onChange={(e) =>
                      setFormData({ ...formData, includesTransport: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">Ulaşım</span>
                </label>
              </div>
            </div>

            {/* Currency & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Para Birimi *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notlar</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ek notlar"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tour Packages List */}
      {packages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">Henüz tur paketi eklenmemiş</p>
          <p className="text-sm text-slate-500 mt-1">
            Yukarıdaki "Yeni Paket Fiyatı" butonuna tıklayarak başlayın
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* Group Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    {group.city} - {group.seasonName}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    {new Date(group.startDate).toLocaleDateString('tr-TR')} -{' '}
                    {new Date(group.endDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Packages Table */}
              <div className="space-y-3">
                {group.items.map((pkg: TourPackage) => (
                  <div
                    key={pkg.id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{pkg.packageName}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {pkg.duration} saat
                        </p>
                        {pkg.description && (
                          <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {AGE_CATEGORIES.map((category) => (
                        <div
                          key={category.key}
                          className={`p-3 rounded-lg bg-${category.color}-50 border border-${category.color}-200`}
                        >
                          <div className="text-xs font-semibold text-slate-600 mb-1">
                            {category.label}
                          </div>
                          <div className={`text-lg font-bold text-${category.color}-700`}>
                            {pkg.currency === 'EUR' && '€'}
                            {pkg.currency === 'USD' && '$'}
                            {pkg.currency === 'TRY' && '₺'}
                            {Number(pkg[category.key as keyof TourPackage] || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500">{category.description}</div>
                        </div>
                      ))}
                    </div>

                    {/* Includes Flags */}
                    <div className="flex flex-wrap gap-2">
                      {pkg.includesLunch && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <Check className="h-3 w-3" />
                          Öğle Yemeği
                        </span>
                      )}
                      {pkg.includesEntrance && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <Check className="h-3 w-3" />
                          Giriş Ücretleri
                        </span>
                      )}
                      {pkg.includesGuide && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <Check className="h-3 w-3" />
                          Rehber
                        </span>
                      )}
                      {pkg.includesTransport && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <Check className="h-3 w-3" />
                          Ulaşım
                        </span>
                      )}
                    </div>

                    {pkg.notes && (
                      <p className="text-sm text-slate-500 mt-3 italic">{pkg.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TourPackagePricing;
