import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Hotel as HotelIcon, Save, X, Star, MapPin, Phone, Mail, User, Building2, Globe, FileText } from 'lucide-react';
import api from '../services/api';

interface HotelFormData {
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  stars: number | null;
  contactPerson: string;
  facilities: string[];
  notes: string;
}

const HotelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<HotelFormData>({
    name: '',
    address: '',
    city: '',
    country: 'Turkey',
    phone: '',
    email: '',
    stars: null,
    contactPerson: '',
    facilities: [],
    notes: '',
  });

  const [facilityInput, setFacilityInput] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchHotel();
    }
  }, [id]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hotels/${id}`);
      const hotel = response.data.data;
      setFormData({
        name: hotel.name,
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        phone: hotel.phone || '',
        email: hotel.email || '',
        stars: hotel.stars,
        contactPerson: hotel.contactPerson || '',
        facilities: hotel.facilities || [],
        notes: hotel.notes || '',
      });
    } catch (error) {
      console.error('Otel yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/hotels/${id}`, formData);
      } else {
        await api.post('/hotels', formData);
      }
      navigate('/resources/hotels');
    } catch (error: any) {
      console.error('Otel kaydedilirken hata:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, facilityInput.trim()],
      });
      setFacilityInput('');
    }
  };

  const handleRemoveFacility = (facility: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((f) => f !== facility),
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <HotelIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {isEdit ? 'Otel Düzenle' : 'Yeni Otel Ekle'}
                </h1>
              </div>
              <p className="text-slate-600">
                {isEdit ? 'Otel bilgilerini güncelleyin' : 'Yeni otel bilgilerini girin'}
              </p>
            </div>
            <button
              onClick={() => navigate('/resources/hotels')}
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
                <Building2 className="h-5 w-5 text-purple-600" />
                Temel Bilgiler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Otel Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Örn: Grand Hyatt Istanbul"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Yıldız Değeri
                  </label>
                  <select
                    value={formData.stars || ''}
                    onChange={(e) => setFormData({ ...formData, stars: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Seçiniz</option>
                    <option value="1">1 Yıldız</option>
                    <option value="2">2 Yıldız</option>
                    <option value="3">3 Yıldız</option>
                    <option value="4">4 Yıldız</option>
                    <option value="5">5 Yıldız</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-600" />
                    Yetkili Kişi
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Örn: Ahmet Yılmaz"
                  />
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Phone className="h-5 w-5 text-purple-600" />
                İletişim Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-purple-600" />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+90 212 555 00 00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600" />
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="info@hotel.com"
                  />
                </div>
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                Adres Bilgileri
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Adres *
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Örn: Cumhuriyet Caddesi No:123 Taksim"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Şehir *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Örn: Istanbul"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-600" />
                      Ülke
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Örn: Turkey"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Olanaklar */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Olanaklar (Facilities)</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={facilityInput}
                    onChange={(e) => setFacilityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFacility())}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Örn: WiFi, Pool, Spa, Restaurant..."
                  />
                  <button
                    type="button"
                    onClick={handleAddFacility}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                  >
                    Ekle
                  </button>
                </div>

                {formData.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium"
                      >
                        {facility}
                        <button
                          type="button"
                          onClick={() => handleRemoveFacility(facility)}
                          className="hover:text-purple-900 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notlar */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Notlar
              </h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Ek notlar ve özel bilgiler..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/resources/hotels')}
                className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default HotelForm;
