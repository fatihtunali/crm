import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign, Plus, Edit, Trash2, ArrowLeft, Calendar,
  Users, Baby, Clock, CheckCircle, XCircle
} from 'lucide-react';
import api from '../services/api';

interface HotelPricing {
  id: number;
  seasonName: string;
  startDate: string;
  endDate: string;
  doubleRoomPrice: number;
  singleSupplement: number;
  tripleRoomPrice: number;
  child0to2Price: number;
  child3to5Price: number;
  child6to11Price: number;
  notes?: string;
  isActive: boolean;
}

interface Hotel {
  id: number;
  name: string;
  city: string;
}

const HotelPricing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [pricings, setPricings] = useState<HotelPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    seasonName: '',
    startDate: '',
    endDate: '',
    doubleRoomPrice: '',
    singleSupplement: '',
    tripleRoomPrice: '',
    child0to2Price: '',
    child3to5Price: '',
    child6to11Price: '',
    notes: '',
  });

  useEffect(() => {
    fetchHotel();
    fetchPricings();
  }, [id]);

  const fetchHotel = async () => {
    try {
      const response = await api.get(`/hotels/${id}`);
      setHotel(response.data.data);
    } catch (error) {
      console.error('Otel yüklenirken hata:', error);
    }
  };

  const fetchPricings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hotels/${id}/pricings`);
      setPricings(response.data.data);
    } catch (error) {
      console.error('Fiyatlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/hotels/pricings/${editingId}`, formData);
      } else {
        await api.post(`/hotels/${id}/pricings`, formData);
      }

      fetchPricings();
      resetForm();
    } catch (error: any) {
      console.error('Fiyat kaydedilirken hata:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    }
  };

  const handleEdit = (pricing: HotelPricing) => {
    setEditingId(pricing.id);
    setFormData({
      seasonName: pricing.seasonName,
      startDate: pricing.startDate.split('T')[0],
      endDate: pricing.endDate.split('T')[0],
      doubleRoomPrice: pricing.doubleRoomPrice.toString(),
      singleSupplement: pricing.singleSupplement.toString(),
      tripleRoomPrice: pricing.tripleRoomPrice.toString(),
      child0to2Price: pricing.child0to2Price.toString(),
      child3to5Price: pricing.child3to5Price.toString(),
      child6to11Price: pricing.child6to11Price.toString(),
      notes: pricing.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (pricingId: number) => {
    if (!confirm('Bu fiyatı silmek istediğinizden emin misiniz?')) return;

    try {
      await api.delete(`/hotels/pricings/${pricingId}`);
      fetchPricings();
    } catch (error) {
      console.error('Fiyat silinirken hata:', error);
      alert('Fiyat silinirken bir hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      seasonName: '',
      startDate: '',
      endDate: '',
      doubleRoomPrice: '',
      singleSupplement: '',
      tripleRoomPrice: '',
      child0to2Price: '',
      child3to5Price: '',
      child6to11Price: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => navigate('/resources/hotels')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-6 w-6 text-slate-600" />
                </button>
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {hotel?.name || 'Yükleniyor...'}
                  </h1>
                  <p className="text-slate-600">Fiyatlandırma Yönetimi</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Yeni Fiyat Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingId ? 'Fiyat Düzenle' : 'Yeni Fiyat Ekle'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Sezon Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.seasonName}
                      onChange={(e) => setFormData({ ...formData, seasonName: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Örn: Yaz Sezonu 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      Başlangıç Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      Bitiş Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Yetişkin Fiyatları (Per Person)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Double Room (Kişi Başı) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.doubleRoomPrice}
                          onChange={(e) => setFormData({ ...formData, doubleRoomPrice: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Single Supplement
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.singleSupplement}
                          onChange={(e) => setFormData({ ...formData, singleSupplement: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Triple Room (Kişi Başı)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.tripleRoomPrice}
                          onChange={(e) => setFormData({ ...formData, tripleRoomPrice: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Baby className="h-5 w-5 text-green-600" />
                      Çocuk Fiyatları (Per Person)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          0-2.99 Yaş
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.child0to2Price}
                          onChange={(e) => setFormData({ ...formData, child0to2Price: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          3-5.99 Yaş
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.child3to5Price}
                          onChange={(e) => setFormData({ ...formData, child3to5Price: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          6-11.99 Yaş
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.child6to11Price}
                          onChange={(e) => setFormData({ ...formData, child6to11Price: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Notlar
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="Ek bilgiler..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {editingId ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pricings List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Fiyatlar yükleniyor...</p>
            </div>
          ) : pricings.length === 0 ? (
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
            <div className="space-y-4">
              {pricings.map((pricing) => (
                <div
                  key={pricing.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{pricing.seasonName}</h3>
                        {pricing.isActive ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(pricing.startDate)} - {formatDate(pricing.endDate)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(pricing)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(pricing.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-600 mb-1">Double Room</p>
                      <p className="text-lg font-bold text-blue-900">{formatPrice(pricing.doubleRoomPrice)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-purple-600 mb-1">Single Supp.</p>
                      <p className="text-lg font-bold text-purple-900">{formatPrice(pricing.singleSupplement)}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-indigo-600 mb-1">Triple Room</p>
                      <p className="text-lg font-bold text-indigo-900">{formatPrice(pricing.tripleRoomPrice)}</p>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-pink-600 mb-1">0-2.99 Yaş</p>
                      <p className="text-lg font-bold text-pink-900">{formatPrice(pricing.child0to2Price)}</p>
                    </div>
                    <div className="bg-rose-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-rose-600 mb-1">3-5.99 Yaş</p>
                      <p className="text-lg font-bold text-rose-900">{formatPrice(pricing.child3to5Price)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-amber-600 mb-1">6-11.99 Yaş</p>
                      <p className="text-lg font-bold text-amber-900">{formatPrice(pricing.child6to11Price)}</p>
                    </div>
                  </div>

                  {pricing.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600">{pricing.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelPricing;
