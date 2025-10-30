import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Save,
  X,
  Building2,
  MapPin,
  Calendar,
} from 'lucide-react';

interface FormData {
  placeName: string;
  city: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  adultPrice: string;
  child0to6Price: string;
  child7to12Price: string;
  studentPrice: string;
  currency: string;
  notes: string;
}

const EntranceFeeForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    placeName: '',
    city: '',
    seasonName: '',
    startDate: '',
    endDate: '',
    adultPrice: '',
    child0to6Price: '',
    child7to12Price: '',
    studentPrice: '',
    currency: 'EUR',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { placeName, city, seasonName, startDate, endDate, adultPrice, child0to6Price, child7to12Price, studentPrice } = formData;

    if (!placeName || !city || !seasonName || !startDate || !endDate || !adultPrice || !child0to6Price || !child7to12Price || !studentPrice) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      // 1. Önce MUSEUM tipinde supplier oluştur
      const supplierData = {
        name: placeName,
        type: 'MUSEUM',
        city: city,
        notes: formData.notes,
      };
      const supplierResponse = await api.post('/suppliers', supplierData);
      const supplierId = supplierResponse.data.data.id;

      // 2. Giriş ücretini ekle
      await api.post(`/suppliers/${supplierId}/entrance-fees`, {
        city: formData.city,
        seasonName: formData.seasonName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        adultPrice: formData.adultPrice,
        child0to6Price: formData.child0to6Price,
        child7to12Price: formData.child7to12Price,
        studentPrice: formData.studentPrice,
        currency: formData.currency,
        notes: formData.notes,
      });

      alert('Giriş ücreti başarıyla eklendi');
      navigate('/entrance-fees');
    } catch (error: any) {
      console.error('Error creating entrance fee:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/entrance-fees');
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Yeni Giriş Ücreti</h1>
            <p className="text-slate-600 mt-1">Müze, antik kent veya turistik mekan giriş ücreti ekleyin</p>
          </div>
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
            İptal
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          {/* Yer Bilgileri */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Yer Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Yer Adı *
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.placeName}
                  onChange={e => setFormData({ ...formData, placeName: e.target.value })}
                  placeholder="Örn: Topkapı Sarayı, Efes Antik Kenti"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

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
                  placeholder="Örn: İstanbul, İzmir"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sezon Bilgileri */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sezon Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          {/* Fiyatlar */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Fiyatlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Yetişkin (Adult) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.adultPrice}
                  onChange={e => setFormData({ ...formData, adultPrice: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Çocuk 0-6 Yaş *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.child0to6Price}
                  onChange={e => setFormData({ ...formData, child0to6Price: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Çocuk 7-12 Yaş *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.child7to12Price}
                  onChange={e => setFormData({ ...formData, child7to12Price: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Öğrenci (Student) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.studentPrice}
                  onChange={e => setFormData({ ...formData, studentPrice: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Para Birimi
                </label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="TRY">TRY</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Ek bilgiler..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntranceFeeForm;
