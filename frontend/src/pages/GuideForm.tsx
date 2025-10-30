import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Save, X, Phone, Mail, Languages, Award, DollarSign, Star, FileText, Briefcase } from 'lucide-react';
import api from '../services/api';

interface GuideFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  languages: string[];
  specializations: string[];
  licenseNumber: string;
  dailyRate: string;
  commission: string;
  rating: string;
  notes: string;
}

const GuideForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GuideFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    languages: [],
    specializations: [],
    licenseNumber: '',
    dailyRate: '',
    commission: '',
    rating: '',
    notes: '',
  });

  const availableLanguages = [
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

  const availableSpecializations = [
    'History',
    'Museums',
    'Nature',
    'Culture',
    'Religious',
    'Adventure',
    'Gastronomy',
    'Photography',
    'Shopping',
    'Nightlife',
  ];

  useEffect(() => {
    if (isEdit) {
      fetchGuide();
    }
  }, [id]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/guides/${id}`);
      const guide = response.data.data;
      setFormData({
        firstName: guide.firstName,
        lastName: guide.lastName,
        phone: guide.phone,
        email: guide.email || '',
        languages: guide.languages || [],
        specializations: guide.specializations || [],
        licenseNumber: guide.licenseNumber || '',
        dailyRate: guide.dailyRate?.toString() || '',
        commission: guide.commission?.toString() || '',
        rating: guide.rating?.toString() || '',
        notes: guide.notes || '',
      });
    } catch (error) {
      console.error('Rehber yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
        commission: formData.commission ? parseFloat(formData.commission) : null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
      };

      if (isEdit) {
        await api.put(`/guides/${id}`, payload);
      } else {
        await api.post('/guides', payload);
      }
      navigate('/resources/guides');
    } catch (error: any) {
      console.error('Rehber kaydedilirken hata:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.includes(lang)
        ? formData.languages.filter((l) => l !== lang)
        : [...formData.languages, lang],
    });
  };

  const toggleSpecialization = (spec: string) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.includes(spec)
        ? formData.specializations.filter((s) => s !== spec)
        : [...formData.specializations, spec],
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
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {isEdit ? 'Rehber Düzenle' : 'Yeni Rehber Ekle'}
                </h1>
              </div>
              <p className="text-slate-600">
                {isEdit ? 'Rehber bilgilerini güncelleyin' : 'Yeni rehber bilgilerini girin'}
              </p>
            </div>
            <button
              onClick={() => navigate('/resources/guides')}
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
            {/* Kişisel Bilgiler */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Kişisel Bilgiler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: Ahmet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: Yılmaz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+90 532 555 00 00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="guide@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Diller */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Languages className="h-5 w-5 text-blue-600" />
                Dil Yetkinlikleri
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.languages.includes(lang.code)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Uzmanlık Alanları */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Uzmanlık Alanları
              </h2>
              <div className="flex flex-wrap gap-3">
                {availableSpecializations.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                      formData.specializations.includes(spec)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Profesyonel Bilgiler */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Profesyonel Bilgiler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    Ruhsat Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: GUIDE-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    Günlük Ücret (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: 150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Komisyon (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    Değerlendirme
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seçiniz</option>
                    <option value="1">⭐ 1 - Zayıf</option>
                    <option value="2">⭐⭐ 2 - Orta</option>
                    <option value="3">⭐⭐⭐ 3 - İyi</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Çok İyi</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Mükemmel</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notlar */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Notlar
              </h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Ek notlar ve özel bilgiler..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/resources/guides')}
                className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default GuideForm;
