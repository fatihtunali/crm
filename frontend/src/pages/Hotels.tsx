import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Hotel as HotelIcon, MapPin, Star, Phone, Mail, Edit, Trash2, DollarSign } from 'lucide-react';
import api from '../services/api';

interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  stars?: number;
  contactPerson?: string;
  isActive: boolean;
  pricings?: any[];
}

const Hotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hotels');
      setHotels(response.data.data);
    } catch (error) {
      console.error('Oteller yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-3xl font-bold text-slate-900">Oteller</h1>
              </div>
              <p className="text-slate-600">
                Otel havuzunu yönetin ve fiyatlandırma yapın
              </p>
            </div>
            <Link
              to="/resources/hotels/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Yeni Otel
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
                placeholder="Otel veya şehir ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Hotels Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Oteller yükleniyor...</p>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <HotelIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz otel yok</h3>
              <p className="text-slate-600 mb-6">İlk otelini ekleyerek başla</p>
              <Link
                to="/resources/hotels/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold"
              >
                <Plus className="h-5 w-5" />
                Yeni Otel Ekle
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Hotel Header */}
                  <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{hotel.name}</h3>
                          {hotel.stars && (
                            <div className="flex items-center gap-0.5">
                              {[...Array(hotel.stars)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-purple-600" />
                            <span>{hotel.city}</span>
                          </div>
                          {hotel.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-purple-600" />
                              <span>{hotel.phone}</span>
                            </div>
                          )}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              hotel.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {hotel.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <Link
                          to={`/resources/hotels/${hotel.id}/pricing`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Fiyat
                        </Link>
                        <Link
                          to={`/resources/hotels/${hotel.id}/edit`}
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

                  {/* Pricing Section */}
                  {hotel.pricings && hotel.pricings.length > 0 ? (
                    <div className="px-5 py-3">
                      <div className="space-y-2">
                        {hotel.pricings.map((pricing: any) => (
                          <div
                            key={pricing.id}
                            className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <div className="min-w-[180px]">
                              <span className="font-semibold text-sm text-slate-900">{pricing.seasonName}</span>
                              <span className="text-xs text-slate-500 ml-2">
                                {new Date(pricing.startDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })} - {new Date(pricing.endDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex gap-2 flex-1">
                              <div className="bg-white rounded px-3 py-2 border border-blue-200 min-w-[110px]">
                                <p className="text-xs text-blue-600 font-medium mb-0.5">Per Person in DBL</p>
                                <p className="text-base font-bold text-blue-900">€{parseFloat(pricing.doubleRoomPrice).toFixed(0)}</p>
                              </div>
                              <div className="bg-white rounded px-3 py-2 border border-purple-200 min-w-[110px]">
                                <p className="text-xs text-purple-600 font-medium mb-0.5">Single Supplement</p>
                                <p className="text-base font-bold text-purple-900">€{parseFloat(pricing.singleSupplement).toFixed(0)}</p>
                              </div>
                              <div className="bg-white rounded px-3 py-2 border border-indigo-200 min-w-[110px]">
                                <p className="text-xs text-indigo-600 font-medium mb-0.5">Per Person in TRP</p>
                                <p className="text-base font-bold text-indigo-900">€{parseFloat(pricing.tripleRoomPrice).toFixed(0)}</p>
                              </div>
                              <div className="bg-white rounded px-3 py-2 border border-pink-200 min-w-[85px]">
                                <p className="text-xs text-pink-600 font-medium mb-0.5">CHD 0-2</p>
                                <p className="text-base font-bold text-pink-900">€{parseFloat(pricing.child0to2Price).toFixed(0)}</p>
                              </div>
                              <div className="bg-white rounded px-3 py-2 border border-rose-200 min-w-[85px]">
                                <p className="text-xs text-rose-600 font-medium mb-0.5">CHD 3-5</p>
                                <p className="text-base font-bold text-rose-900">€{parseFloat(pricing.child3to5Price).toFixed(0)}</p>
                              </div>
                              <div className="bg-white rounded px-3 py-2 border border-amber-200 min-w-[85px]">
                                <p className="text-xs text-amber-600 font-medium mb-0.5">CHD 6-11</p>
                                <p className="text-base font-bold text-amber-900">€{parseFloat(pricing.child6to11Price).toFixed(0)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-3 text-center">
                      <Link
                        to={`/resources/hotels/${hotel.id}/pricing`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Fiyat Ekle
                      </Link>
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

export default Hotels;
