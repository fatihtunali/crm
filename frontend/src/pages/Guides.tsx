import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Phone, Mail, Edit, Trash2, Star, Languages, DollarSign, Award } from 'lucide-react';
import api from '../services/api';

interface Guide {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  languages: string[];
  specializations: string[];
  licenseNumber?: string;
  dailyRate?: number;
  commission?: number;
  rating?: number;
  isActive: boolean;
}

const Guides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/guides');
      setGuides(response.data.data);
    } catch (error) {
      console.error('Rehberler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = guides.filter(guide =>
    `${guide.firstName} ${guide.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLanguageFlag = (lang: string) => {
    const flags: any = {
      TR: '🇹🇷',
      EN: '🇬🇧',
      DE: '🇩🇪',
      RU: '🇷🇺',
      AR: '🇸🇦',
      FR: '🇫🇷',
      ES: '🇪🇸',
      IT: '🇮🇹',
      JP: '🇯🇵',
      CN: '🇨🇳',
    };
    return flags[lang] || '🌐';
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
                <h1 className="text-3xl font-bold text-slate-900">Rehberler</h1>
              </div>
              <p className="text-slate-600">
                Rehber kadrosunu yönetin
              </p>
            </div>
            <Link
              to="/resources/guides/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Yeni Rehber
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rehber ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Guides List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Rehberler yükleniyor...</p>
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz rehber yok</h3>
              <p className="text-slate-600 mb-6">İlk rehberi ekleyerek başla</p>
              <Link
                to="/resources/guides/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold"
              >
                <Plus className="h-5 w-5" />
                Yeni Rehber Ekle
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Guide Header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {guide.firstName.charAt(0)}{guide.lastName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {guide.firstName} {guide.lastName}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-blue-600" />
                                <span>{guide.phone}</span>
                              </div>
                              {guide.email && (
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                                  <span>{guide.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Languages */}
                        {guide.languages.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4 text-blue-600" />
                            <div className="flex gap-1">
                              {guide.languages.map((lang) => (
                                <span
                                  key={lang}
                                  className="text-xl"
                                  title={lang}
                                >
                                  {getLanguageFlag(lang)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rating */}
                        {guide.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Number(guide.rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm font-semibold text-slate-700 ml-1">
                              {Number(guide.rating).toFixed(1)}
                            </span>
                          </div>
                        )}

                        {/* Daily Rate */}
                        {guide.dailyRate && (
                          <div className="bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-base font-bold text-green-700">
                                €{Number(guide.dailyRate)}
                              </span>
                              <span className="text-xs text-green-600">/gün</span>
                            </div>
                          </div>
                        )}

                        {/* License */}
                        {guide.licenseNumber && (
                          <div className="flex items-center gap-1.5 text-xs bg-blue-50 px-3 py-1.5 rounded-lg">
                            <Award className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-blue-700 font-medium">{guide.licenseNumber}</span>
                          </div>
                        )}

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            guide.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {guide.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        <Link
                          to={`/resources/guides/${guide.id}/pricing`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Fiyat
                        </Link>
                        <Link
                          to={`/resources/guides/${guide.id}/edit`}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4 text-slate-600" />
                        </Link>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  {guide.specializations.length > 0 && (
                    <div className="px-5 py-3 bg-slate-50/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-600 uppercase">Uzmanlık:</span>
                        {guide.specializations.map((spec) => (
                          <span
                            key={spec}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
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

export default Guides;
