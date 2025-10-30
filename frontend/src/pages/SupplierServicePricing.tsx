import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  Trash2,
  DollarSign,
  Coffee,
  UtensilsCrossed,
  Sunset,
  Tag,
} from 'lucide-react';

interface SupplierPricing {
  id: number;
  city: string;
  serviceType: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  price: any;
  currency: string;
  notes?: string;
  isActive: boolean;
}

interface Supplier {
  id: number;
  name: string;
  type: string;
}

const SERVICE_TYPES = [
  { value: 'BREAKFAST', label: 'Kahvaltı', description: 'Breakfast', icon: Coffee, color: 'amber' },
  { value: 'LUNCH', label: 'Öğle Yemeği', description: 'Lunch', icon: UtensilsCrossed, color: 'blue' },
  { value: 'DINNER', label: 'Akşam Yemeği', description: 'Dinner', icon: Sunset, color: 'purple' },
  { value: 'ACTIVITY', label: 'Aktivite', description: 'Activity', icon: Tag, color: 'green' },
  { value: 'OTHER', label: 'Diğer', description: 'Other', icon: DollarSign, color: 'slate' },
];

const SupplierServicePricing: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [pricings, setPricings] = useState<SupplierPricing[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    city: '',
    serviceType: 'LUNCH',
    seasonName: '',
    startDate: '',
    endDate: '',
    price: '',
    currency: 'EUR',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [supplierRes, pricingsRes] = await Promise.all([
        api.get(`/suppliers/${id}`),
        api.get(`/suppliers/${id}/service-pricings`),
      ]);
      setSupplier(supplierRes.data.data);
      setPricings(pricingsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { city, serviceType, seasonName, startDate, endDate, price } = formData;

    if (!city || !serviceType || !seasonName || !startDate || !endDate || !price) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      await api.post(`/suppliers/${id}/service-pricings`, formData);
      alert('Hizmet fiyatı başarıyla eklendi');
      setShowForm(false);
      setFormData({
        city: '',
        serviceType: 'LUNCH',
        seasonName: '',
        startDate: '',
        endDate: '',
        price: '',
        currency: 'EUR',
        notes: '',
      });
      fetchData();
    } catch (error: any) {
      console.error('Error creating service pricing:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (pricingId: number) => {
    if (!window.confirm('Bu hizmet fiyatını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/suppliers/service-pricings/${pricingId}`);
      alert('Hizmet fiyatı silindi');
      fetchData();
    } catch (error) {
      console.error('Error deleting service pricing:', error);
      alert('Silme işlemi başarısız');
    }
  };

  // Group by city + season
  const groupedPricings = pricings.reduce((acc, pricing) => {
    const key = `${pricing.city}-${pricing.seasonName}`;
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
  }, {} as any);

  const groups = Object.values(groupedPricings);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/resources/suppliers')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Hizmet Fiyatları</h1>
            <p className="text-slate-600 mt-1">
              {supplier?.name} - Yemek ve aktivite hizmet fiyatları
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          {showForm ? 'Formu Kapat' : 'Yeni Hizmet Fiyatı'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Yeni Hizmet Fiyatı Ekle</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Şehir *
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Örn: Nevşehir"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Hizmet Tipi *
                  </span>
                </label>
                <select
                  value={formData.serviceType}
                  onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  {SERVICE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Sezon Adı *
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.seasonName}
                  onChange={e => setFormData({ ...formData, seasonName: e.target.value })}
                  placeholder="Örn: Yaz Sezonu 2025"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Fiyat (Per Person) * (€)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="25.00"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Bitiş Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Notlar</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Özel notlar..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              Kaydet
            </button>
          </form>
        </div>
      )}

      {/* Pricing List */}
      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Henüz hizmet fiyatı eklenmemiş</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
            >
              İlk hizmet fiyatını ekleyin
            </button>
          </div>
        ) : (
          groups.map((group: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* Header: City + Season */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <UtensilsCrossed className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{group.city}</h3>
                    <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {group.seasonName} • {new Date(group.startDate).toLocaleDateString('tr-TR')} - {new Date(group.endDate).toLocaleDateString('tr-TR')}
                    </p>
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
                        const pricing = group.items.find((p: SupplierPricing) => p.serviceType === st.value);
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
          ))
        )}
      </div>
    </div>
  );
};

export default SupplierServicePricing;
