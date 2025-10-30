import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, Save, X, User, Phone, Mail, MapPin, Building2, FileText, Hash } from 'lucide-react';
import api from '../services/api';

interface VehicleSupplierFormData {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  taxNumber: string;
  notes: string;
}

const VehicleSupplierForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [formData, setFormData] = useState<VehicleSupplierFormData>({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    taxNumber: '',
    notes: '',
  });

  useEffect(() => {
    fetchCities();
    if (isEdit) {
      fetchSupplier();
    }
  }, [id]);

  const fetchCities = async () => {
    try {
      const response = await api.get('/vehicle-suppliers/cities');
      setCities(response.data.data);
    } catch (error) {
      console.error('Şehirler yüklenirken hata:', error);
    }
  };

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vehicle-suppliers/${id}`);
      const supplier = response.data.data;
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        city: supplier.city || '',
        taxNumber: supplier.taxNumber || '',
        notes: supplier.notes || '',
      });
    } catch (error) {
      console.error('Tedarikçi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/vehicle-suppliers/${id}`, formData);
      } else {
        await api.post('/vehicle-suppliers', formData);
      }
      navigate('/resources/vehicle-suppliers');
    } catch (error: any) {
      console.error('Tedarikçi kaydedilirken hata:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {isEdit ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle'}
                </h1>
              </div>
              <p className="text-slate-600">
                {isEdit ? 'Tedarikçi bilgilerini güncelleyin' : 'Yeni tedarikçi bilgilerini girin'}
              </p>
            </div>
            <button
              onClick={() => navigate('/resources/vehicle-suppliers')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
              İptal
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-600" />
                Temel Bilgiler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Firma Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Örn: Antalya Transfer Services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-teal-600" />
                    Yetkili Kişi
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Örn: Ahmet Yılmaz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-teal-600" />
                    Vergi Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Örn: 1234567890"
                  />
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Phone className="h-5 w-5 text-teal-600" />
                İletişim Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-teal-600" />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="+90 242 555 00 00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-teal-600" />
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="info@transfer.com"
                  />
                </div>
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600" />
                Adres Bilgileri
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Örn: Konyaaltı Caddesi No:45 Antalya"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Şehir
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Şehir seçiniz</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notlar */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                Notlar
              </h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Ek notlar ve özel bilgiler..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/resources/vehicle-suppliers')}
                className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleSupplierForm;
