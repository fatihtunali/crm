import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Truck, MapPin, Phone, Edit, Trash2, DollarSign } from 'lucide-react';
import api from '../services/api';

interface VehicleSupplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  taxNumber?: string;
  isActive: boolean;
  transferPricings?: any[];
  allocationPricings?: any[];
}

const VehicleSuppliers = () => {
  const [suppliers, setSuppliers] = useState<VehicleSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicle-suppliers');
      setSuppliers(response.data.data);
    } catch (error) {
      console.error('Tedarikçiler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.city && supplier.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getVehicleTypeLabel = (type: string) => {
    const types: any = {
      VITO: 'Vito (4 pax)',
      SPRINTER: 'Sprinter (12 pax)',
      ISUZU: 'Isuzu (20 pax)',
      COACH: 'Coach (46 pax)',
      CAR: 'Araba (3-4)',
      VAN: 'Minivan (6-8)',
      MINIBUS: 'Minibüs (14-16)',
      MIDIBUS: 'Midibüs (25-30)',
      BUS: 'Otobüs (45-50)',
      LUXURY: 'Lüks'
    };
    return types[type] || type;
  };

  const getAllocationTypeLabel = (type: string) => {
    const types: any = {
      FULL_DAY: 'Tam Gün',
      HALF_DAY: 'Yarım Gün',
      NIGHT_SERVICE: 'Gece',
      PACKAGE_TOUR: 'Paket Tur'
    };
    return types[type] || type;
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
                <h1 className="text-3xl font-bold text-slate-900">Araç Tedarikçileri</h1>
              </div>
              <p className="text-slate-600">
                Transfer ve tahsis fiyatlandırması yapın
              </p>
            </div>
            <Link
              to="/resources/vehicle-suppliers/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Yeni Tedarikçi
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
                placeholder="Tedarikçi veya şehir ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Suppliers Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Tedarikçiler yükleniyor...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <Truck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz tedarikçi yok</h3>
              <p className="text-slate-600 mb-6">İlk tedarikçiyi ekleyerek başla</p>
              <Link
                to="/resources/vehicle-suppliers/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold"
              >
                <Plus className="h-5 w-5" />
                Yeni Tedarikçi Ekle
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Supplier Header */}
                  <div className="px-5 py-3 bg-gradient-to-r from-teal-50 to-white border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{supplier.name}</h3>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          {supplier.city && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-teal-600" />
                              <span>{supplier.city}</span>
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-teal-600" />
                              <span>{supplier.phone}</span>
                            </div>
                          )}
                          {supplier.contactPerson && (
                            <span className="text-slate-500">{supplier.contactPerson}</span>
                          )}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              supplier.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {supplier.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <Link
                          to={`/resources/vehicle-suppliers/${supplier.id}/pricing`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Fiyat
                        </Link>
                        <Link
                          to={`/resources/vehicle-suppliers/${supplier.id}/edit`}
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

                  {/* Transfer Pricing Section */}
                  {supplier.transferPricings && supplier.transferPricings.length > 0 && (
                    <div className="px-5 py-3 bg-blue-50/30">
                      <h4 className="text-xs font-semibold text-blue-900 mb-2 uppercase tracking-wide">Transferler</h4>
                      <div className="space-y-2">
                        {supplier.transferPricings.map((pricing: any) => (
                          <div
                            key={pricing.id}
                            className="flex items-center gap-4 p-3 bg-white rounded-lg border border-blue-200"
                          >
                            <div className="min-w-[120px]">
                              <span className="text-xs font-semibold text-blue-900">{getVehicleTypeLabel(pricing.vehicleType)}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-sm text-slate-700">{pricing.fromCity}</span>
                              <span className="text-xs text-slate-400">({pricing.fromLocation})</span>
                              <span className="text-slate-400">→</span>
                              <span className="text-sm text-slate-700">{pricing.toCity}</span>
                              <span className="text-xs text-slate-400">({pricing.toLocation})</span>
                            </div>
                            <div className="bg-blue-100 rounded px-4 py-2 min-w-[100px] text-right">
                              <p className="text-lg font-bold text-blue-900">{pricing.currency} {parseFloat(pricing.price).toFixed(0)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allocation Pricing Section */}
                  {supplier.allocationPricings && supplier.allocationPricings.length > 0 && (
                    <div className="px-5 py-3 bg-green-50/30">
                      <h4 className="text-xs font-semibold text-green-900 mb-2 uppercase tracking-wide">Tahsis / Disposal</h4>
                      <div className="space-y-2">
                        {supplier.allocationPricings.map((pricing: any) => (
                          <div
                            key={pricing.id}
                            className="flex items-center gap-4 p-3 bg-white rounded-lg border border-green-200"
                          >
                            <div className="min-w-[120px]">
                              <span className="text-xs font-semibold text-green-900">{getVehicleTypeLabel(pricing.vehicleType)}</span>
                            </div>
                            <div className="min-w-[100px]">
                              <span className="text-sm text-slate-700">{pricing.city}</span>
                            </div>
                            <div className="min-w-[100px]">
                              <span className="text-xs font-semibold text-green-800 bg-green-100 px-2 py-1 rounded">
                                {getAllocationTypeLabel(pricing.allocationType)}
                              </span>
                            </div>
                            <div className="flex gap-2 flex-1">
                              {pricing.allocationType === 'PACKAGE_TOUR' ? (
                                <>
                                  <div className="bg-green-100 rounded px-4 py-2">
                                    <p className="text-xs text-green-700 font-medium">Paket ({pricing.packageDays} gün)</p>
                                    <p className="text-base font-bold text-green-900">{pricing.currency} {parseFloat(pricing.packagePrice).toFixed(0)}</p>
                                  </div>
                                  {pricing.extraDayPrice > 0 && (
                                    <div className="bg-green-50 rounded px-4 py-2">
                                      <p className="text-xs text-green-700 font-medium">Ekstra Gün</p>
                                      <p className="text-base font-bold text-green-900">{pricing.currency} {parseFloat(pricing.extraDayPrice).toFixed(0)}</p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="bg-green-100 rounded px-4 py-2">
                                    <p className="text-xs text-green-700 font-medium">Baz ({pricing.baseHours}h)</p>
                                    <p className="text-base font-bold text-green-900">{pricing.currency} {parseFloat(pricing.basePrice).toFixed(0)}</p>
                                  </div>
                                  {pricing.extraHourPrice > 0 && (
                                    <div className="bg-green-50 rounded px-4 py-2">
                                      <p className="text-xs text-green-700 font-medium">Ekstra Saat</p>
                                      <p className="text-base font-bold text-green-900">{pricing.currency} {parseFloat(pricing.extraHourPrice).toFixed(0)}</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Pricing Yet */}
                  {(!supplier.transferPricings || supplier.transferPricings.length === 0) &&
                   (!supplier.allocationPricings || supplier.allocationPricings.length === 0) && (
                    <div className="px-5 py-3 text-center">
                      <Link
                        to={`/resources/vehicle-suppliers/${supplier.id}/pricing`}
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

export default VehicleSuppliers;
