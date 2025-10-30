import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign, ArrowLeft, Plus, Truck, Calendar, MapPin, X, Save
} from 'lucide-react';
import api from '../services/api';

interface VehicleSupplier {
  id: number;
  name: string;
}

interface TransferPricing {
  id: number;
  vehicleType: string;
  fromCity: string;
  fromLocation: string;
  toCity: string;
  toLocation: string;
  seasonName?: string;
  startDate?: string;
  endDate?: string;
  price: number;
  currency: string;
}

interface AllocationPricing {
  id: number;
  vehicleType: string;
  city: string;
  allocationType: string;
  seasonName?: string;
  startDate?: string;
  endDate?: string;
  basePrice?: number;
  baseHours?: number;
  extraHourPrice?: number;
  packageDays?: number;
  packagePrice?: number;
  extraDayPrice?: number;
  currency: string;
}

const VEHICLE_TYPES = [
  { value: 'VITO', label: 'Vito', capacity: '4 pax' },
  { value: 'SPRINTER', label: 'Sprinter', capacity: '12 pax' },
  { value: 'ISUZU', label: 'Isuzu', capacity: '20 pax' },
  { value: 'COACH', label: 'Coach', capacity: '46 pax' },
  { value: 'CAR', label: 'Araba', capacity: '3-4 pax' },
  { value: 'VAN', label: 'Minivan', capacity: '6-8 pax' },
  { value: 'MINIBUS', label: 'Minibüs', capacity: '14-16 pax' },
  { value: 'MIDIBUS', label: 'Midibüs', capacity: '25-30 pax' },
  { value: 'BUS', label: 'Otobüs', capacity: '45-50 pax' },
  { value: 'LUXURY', label: 'Lüks Araç', capacity: 'VIP' },
];

const ALLOCATION_TYPES = [
  { value: 'FULL_DAY', label: 'Tam Gün', desc: '8 saat' },
  { value: 'HALF_DAY', label: 'Yarım Gün', desc: '4 saat' },
  { value: 'NIGHT_SERVICE', label: 'Gece Hizmeti', desc: '18:00+' },
  { value: 'PACKAGE_TOUR', label: 'Paket Tur', desc: 'Flexible günler' },
];

const VehiclePricing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<VehicleSupplier | null>(null);
  const [transfers, setTransfers] = useState<TransferPricing[]>([]);
  const [allocations, setAllocations] = useState<AllocationPricing[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'transfers' | 'allocations'>('transfers');
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);

  // Transfer Bulk Form
  const [fromCity, setFromCity] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toCity, setToCity] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [transferSeason, setTransferSeason] = useState('');
  const [transferStartDate, setTransferStartDate] = useState('');
  const [transferEndDate, setTransferEndDate] = useState('');
  const [transferPriceMatrix, setTransferPriceMatrix] = useState<Record<string, string>>({});

  // Allocation Bulk Form
  const [allocationCity, setAllocationCity] = useState('');
  const [allocationType, setAllocationType] = useState('');
  const [allocationSeason, setAllocationSeason] = useState('');
  const [allocationStartDate, setAllocationStartDate] = useState('');
  const [allocationEndDate, setAllocationEndDate] = useState('');
  const [allocationPriceMatrix, setAllocationPriceMatrix] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSupplier();
    fetchCities();
    fetchTransfers();
    fetchAllocations();
  }, [id]);

  const fetchSupplier = async () => {
    try {
      const response = await api.get(`/vehicle-suppliers/${id}`);
      setSupplier(response.data.data);
    } catch (error) {
      console.error('Tedarikçi yüklenirken hata:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await api.get('/vehicle-suppliers/cities');
      setCities(response.data.data);
    } catch (error) {
      console.error('Şehirler yüklenirken hata:', error);
    }
  };

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vehicle-suppliers/${id}/transfers`);
      setTransfers(response.data.data);
    } catch (error) {
      console.error('Transfer fiyatları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await api.get(`/vehicle-suppliers/${id}/allocations`);
      setAllocations(response.data.data);
    } catch (error) {
      console.error('Tahsis fiyatları yüklenirken hata:', error);
    }
  };

  const handleTransferBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromCity || !fromLocation || !toCity || !toLocation) {
      alert('Başlangıç ve varış bilgileri zorunludur');
      return;
    }

    const entries = Object.entries(transferPriceMatrix)
      .filter(([_, price]) => price && parseFloat(price) > 0)
      .map(([vehicleType, price]) => ({
        vehicleType,
        fromCity,
        fromLocation,
        toCity,
        toLocation,
        seasonName: transferSeason || null,
        startDate: transferStartDate || null,
        endDate: transferEndDate || null,
        price: parseFloat(price),
        currency: 'EUR',
      }));

    if (entries.length === 0) {
      alert('En az bir araç tipi için fiyat girmelisiniz');
      return;
    }

    try {
      setLoading(true);
      const promises = entries.map(entry =>
        api.post(`/vehicle-suppliers/${id}/transfers`, entry)
      );
      await Promise.all(promises);

      setFromCity('');
      setFromLocation('');
      setToCity('');
      setToLocation('');
      setTransferSeason('');
      setTransferStartDate('');
      setTransferEndDate('');
      setTransferPriceMatrix({});
      setShowTransferForm(false);
      fetchTransfers();
    } catch (error: any) {
      console.error('Transfer fiyatları eklenirken hata:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allocationCity || !allocationType) {
      alert('Şehir ve tahsis tipi zorunludur');
      return;
    }

    const entries = Object.entries(allocationPriceMatrix)
      .filter(([_, data]) => {
        if (allocationType === 'PACKAGE_TOUR') {
          return data.packageDays && data.packagePrice && parseFloat(data.packagePrice) > 0;
        } else {
          return data.basePrice && parseFloat(data.basePrice) > 0 && data.baseHours;
        }
      })
      .map(([vehicleType, data]) => ({
        vehicleType,
        city: allocationCity,
        allocationType,
        seasonName: allocationSeason || null,
        startDate: allocationStartDate || null,
        endDate: allocationEndDate || null,
        ...(allocationType === 'PACKAGE_TOUR'
          ? {
              packageDays: parseInt(data.packageDays),
              packagePrice: parseFloat(data.packagePrice),
              extraDayPrice: data.extraDayPrice ? parseFloat(data.extraDayPrice) : null,
            }
          : {
              baseHours: parseInt(data.baseHours),
              basePrice: parseFloat(data.basePrice),
              extraHourPrice: data.extraHourPrice ? parseFloat(data.extraHourPrice) : null,
            }),
        currency: 'EUR',
      }));

    if (entries.length === 0) {
      alert('En az bir araç tipi için fiyat girmelisiniz');
      return;
    }

    try {
      setLoading(true);
      const promises = entries.map(entry =>
        api.post(`/vehicle-suppliers/${id}/allocations`, entry)
      );
      await Promise.all(promises);

      setAllocationCity('');
      setAllocationType('');
      setAllocationSeason('');
      setAllocationStartDate('');
      setAllocationEndDate('');
      setAllocationPriceMatrix({});
      setShowAllocationForm(false);
      fetchAllocations();
    } catch (error: any) {
      console.error('Tahsis fiyatları eklenirken hata:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransfer = async (transferId: number) => {
    if (!confirm('Bu transfer fiyatını silmek istediğinizden emin misiniz?')) return;
    try {
      await api.delete(`/vehicle-suppliers/transfers/${transferId}`);
      fetchTransfers();
    } catch (error) {
      alert('Fiyat silinirken bir hata oluştu');
    }
  };

  const handleDeleteAllocation = async (allocationId: number) => {
    if (!confirm('Bu tahsis fiyatını silmek istediğinizden emin misiniz?')) return;
    try {
      await api.delete(`/vehicle-suppliers/allocations/${allocationId}`);
      fetchAllocations();
    } catch (error) {
      alert('Fiyat silinirken bir hata oluştu');
    }
  };

  // Group transfers by route and season
  const groupedTransfers = transfers.reduce((acc, transfer) => {
    const key = `${transfer.fromCity}|${transfer.fromLocation}|${transfer.toCity}|${transfer.toLocation}|${transfer.seasonName || 'no-season'}`;
    if (!acc[key]) {
      acc[key] = {
        fromCity: transfer.fromCity,
        fromLocation: transfer.fromLocation,
        toCity: transfer.toCity,
        toLocation: transfer.toLocation,
        seasonName: transfer.seasonName,
        startDate: transfer.startDate,
        endDate: transfer.endDate,
        prices: [],
      };
    }
    acc[key].prices.push(transfer);
    return acc;
  }, {} as Record<string, any>);

  // Group allocations by city, type, and season
  const groupedAllocations = allocations.reduce((acc, allocation) => {
    const key = `${allocation.city}|${allocation.allocationType}|${allocation.seasonName || 'no-season'}`;
    if (!acc[key]) {
      acc[key] = {
        city: allocation.city,
        allocationType: allocation.allocationType,
        seasonName: allocation.seasonName,
        startDate: allocation.startDate,
        endDate: allocation.endDate,
        prices: [],
      };
    }
    acc[key].prices.push(allocation);
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/resources/vehicle-suppliers')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{supplier?.name}</h1>
                    <p className="text-slate-600 text-sm">Araç Fiyatlandırması - Toplu Giriş</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'transfers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Transfer Fiyatları
            </button>
            <button
              onClick={() => setActiveTab('allocations')}
              className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'allocations'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Tahsis / Disposal Fiyatları
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {activeTab === 'transfers' ? (
            <>
              {/* Transfer Bulk Form */}
              {showTransferForm && (
                <form onSubmit={handleTransferBulkSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-blue-200 space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Toplu Transfer Fiyatı Girişi
                  </h2>

                  {/* Route Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <MapPin className="inline h-4 w-4 text-blue-600 mr-1" />
                        Başlangıç Şehri *
                      </label>
                      <select
                        required
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seçiniz</option>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Başlangıç Noktası *
                      </label>
                      <input
                        type="text"
                        required
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        placeholder="Örn: Airport"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Varış Şehri *
                      </label>
                      <select
                        required
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seçiniz</option>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Varış Noktası *
                      </label>
                      <input
                        type="text"
                        required
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        placeholder="Örn: Hotel"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Season Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Sezon Adı
                      </label>
                      <input
                        type="text"
                        value={transferSeason}
                        onChange={(e) => setTransferSeason(e.target.value)}
                        placeholder="Örn: Yaz Sezonu"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Calendar className="inline h-4 w-4 text-blue-600 mr-1" />
                        Başlangıç
                      </label>
                      <input
                        type="date"
                        value={transferStartDate}
                        onChange={(e) => setTransferStartDate(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Calendar className="inline h-4 w-4 text-blue-600 mr-1" />
                        Bitiş
                      </label>
                      <input
                        type="date"
                        value={transferEndDate}
                        onChange={(e) => setTransferEndDate(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Price Table */}
                  <div className="overflow-x-auto">
                    <p className="text-sm text-slate-600 mb-3">
                      Her araç tipi için fiyat girin. Boş bırakılan alanlar kaydedilmez.
                    </p>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-slate-300 bg-slate-100 p-3 text-left font-bold text-slate-700">
                            Araç Tipi
                          </th>
                          <th className="border border-slate-300 bg-blue-50 p-3 text-center font-bold text-slate-700">
                            Fiyat (EUR)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {VEHICLE_TYPES.map(vehicle => (
                          <tr key={vehicle.value}>
                            <td className="border border-slate-300 bg-slate-50 p-3">
                              <div>
                                <div className="font-semibold text-slate-900">{vehicle.label}</div>
                                <div className="text-xs text-slate-600">{vehicle.capacity}</div>
                              </div>
                            </td>
                            <td className="border border-slate-300 p-2 bg-white">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={transferPriceMatrix[vehicle.value] || ''}
                                onChange={(e) => setTransferPriceMatrix({
                                  ...transferPriceMatrix,
                                  [vehicle.value]: e.target.value
                                })}
                                placeholder="€"
                                className="w-full px-3 py-2 text-center border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowTransferForm(false)}
                      className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      {loading ? 'Kaydediliyor...' : 'Fiyatları Kaydet'}
                    </button>
                  </div>
                </form>
              )}

              {/* Add Button */}
              {!showTransferForm && (
                <button
                  onClick={() => setShowTransferForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Toplu Transfer Fiyatı Ekle
                </button>
              )}

              {/* Grouped Transfer List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-4 text-slate-600">Yükleniyor...</p>
                </div>
              ) : Object.keys(groupedTransfers).length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <Truck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz transfer fiyatı yok</h3>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.values(groupedTransfers).map((group: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {group.fromCity} ({group.fromLocation}) → {group.toCity} ({group.toLocation})
                            </h3>
                            {group.seasonName && (
                              <p className="text-sm text-slate-600 mt-1">
                                {group.seasonName} • {new Date(group.startDate).toLocaleDateString('tr-TR')} - {new Date(group.endDate).toLocaleDateString('tr-TR')}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                            {group.prices.length} araç
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {group.prices.map((pricing: TransferPricing) => {
                            const vehicle = VEHICLE_TYPES.find(v => v.value === pricing.vehicleType);
                            return (
                              <div key={pricing.id} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 relative group">
                                <button
                                  onClick={() => handleDeleteTransfer(pricing.id)}
                                  className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3 text-red-600" />
                                </button>
                                <div className="flex items-center gap-2 mb-2">
                                  <Truck className="h-4 w-4 text-blue-600" />
                                  <span className="font-semibold text-slate-900 text-sm">{vehicle?.label}</span>
                                </div>
                                <div className="text-xs text-slate-600 mb-2">{vehicle?.capacity}</div>
                                <div className="text-2xl font-bold text-blue-700">
                                  {pricing.currency} {pricing.price}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Allocation Bulk Form */}
              {showAllocationForm && (
                <form onSubmit={handleAllocationBulkSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-green-200 space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Toplu Tahsis Fiyatı Girişi
                  </h2>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <MapPin className="inline h-4 w-4 text-green-600 mr-1" />
                        Şehir *
                      </label>
                      <select
                        required
                        value={allocationCity}
                        onChange={(e) => setAllocationCity(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Seçiniz</option>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Tahsis Tipi *
                      </label>
                      <select
                        required
                        value={allocationType}
                        onChange={(e) => {
                          setAllocationType(e.target.value);
                          setAllocationPriceMatrix({});
                        }}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Seçiniz</option>
                        {ALLOCATION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label} ({type.desc})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Season Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Sezon Adı
                      </label>
                      <input
                        type="text"
                        value={allocationSeason}
                        onChange={(e) => setAllocationSeason(e.target.value)}
                        placeholder="Örn: Yaz Sezonu"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Calendar className="inline h-4 w-4 text-green-600 mr-1" />
                        Başlangıç
                      </label>
                      <input
                        type="date"
                        value={allocationStartDate}
                        onChange={(e) => setAllocationStartDate(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Calendar className="inline h-4 w-4 text-green-600 mr-1" />
                        Bitiş
                      </label>
                      <input
                        type="date"
                        value={allocationEndDate}
                        onChange={(e) => setAllocationEndDate(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Price Table */}
                  {allocationType && (
                    <div className="overflow-x-auto">
                      <p className="text-sm text-slate-600 mb-3">
                        Her araç tipi için fiyat girin. Boş bırakılan alanlar kaydedilmez.
                      </p>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border border-slate-300 bg-slate-100 p-3 text-left font-bold text-slate-700">
                              Araç Tipi
                            </th>
                            {allocationType === 'PACKAGE_TOUR' ? (
                              <>
                                <th className="border border-slate-300 bg-green-50 p-3 text-center font-bold text-slate-700">
                                  Gün Sayısı
                                </th>
                                <th className="border border-slate-300 bg-green-50 p-3 text-center font-bold text-slate-700">
                                  Paket Fiyatı (EUR)
                                </th>
                                <th className="border border-slate-300 bg-green-50 p-3 text-center font-bold text-slate-700">
                                  Ekstra Gün (EUR)
                                </th>
                              </>
                            ) : (
                              <>
                                <th className="border border-slate-300 bg-green-50 p-3 text-center font-bold text-slate-700">
                                  Baz Saat
                                </th>
                                <th className="border border-slate-300 bg-green-50 p-3 text-center font-bold text-slate-700">
                                  Baz Fiyat (EUR)
                                </th>
                                <th className="border border-slate-300 bg-green-50 p-3 text-center font-bold text-slate-700">
                                  Ekstra Saat (EUR)
                                </th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {VEHICLE_TYPES.map(vehicle => {
                            const data = allocationPriceMatrix[vehicle.value] || {};
                            return (
                              <tr key={vehicle.value}>
                                <td className="border border-slate-300 bg-slate-50 p-3">
                                  <div>
                                    <div className="font-semibold text-slate-900">{vehicle.label}</div>
                                    <div className="text-xs text-slate-600">{vehicle.capacity}</div>
                                  </div>
                                </td>
                                {allocationType === 'PACKAGE_TOUR' ? (
                                  <>
                                    <td className="border border-slate-300 p-2 bg-white">
                                      <input
                                        type="number"
                                        min="1"
                                        value={data.packageDays || ''}
                                        onChange={(e) => setAllocationPriceMatrix({
                                          ...allocationPriceMatrix,
                                          [vehicle.value]: { ...data, packageDays: e.target.value }
                                        })}
                                        placeholder="Gün"
                                        className="w-full px-2 py-2 text-center border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                      />
                                    </td>
                                    <td className="border border-slate-300 p-2 bg-white">
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.packagePrice || ''}
                                        onChange={(e) => setAllocationPriceMatrix({
                                          ...allocationPriceMatrix,
                                          [vehicle.value]: { ...data, packagePrice: e.target.value }
                                        })}
                                        placeholder="€"
                                        className="w-full px-2 py-2 text-center border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                      />
                                    </td>
                                    <td className="border border-slate-300 p-2 bg-white">
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.extraDayPrice || ''}
                                        onChange={(e) => setAllocationPriceMatrix({
                                          ...allocationPriceMatrix,
                                          [vehicle.value]: { ...data, extraDayPrice: e.target.value }
                                        })}
                                        placeholder="€"
                                        className="w-full px-2 py-2 text-center border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                      />
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="border border-slate-300 p-2 bg-white">
                                      <input
                                        type="number"
                                        min="1"
                                        value={data.baseHours || ''}
                                        onChange={(e) => setAllocationPriceMatrix({
                                          ...allocationPriceMatrix,
                                          [vehicle.value]: { ...data, baseHours: e.target.value }
                                        })}
                                        placeholder="Saat"
                                        className="w-full px-2 py-2 text-center border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                      />
                                    </td>
                                    <td className="border border-slate-300 p-2 bg-white">
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.basePrice || ''}
                                        onChange={(e) => setAllocationPriceMatrix({
                                          ...allocationPriceMatrix,
                                          [vehicle.value]: { ...data, basePrice: e.target.value }
                                        })}
                                        placeholder="€"
                                        className="w-full px-2 py-2 text-center border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                      />
                                    </td>
                                    <td className="border border-slate-300 p-2 bg-white">
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.extraHourPrice || ''}
                                        onChange={(e) => setAllocationPriceMatrix({
                                          ...allocationPriceMatrix,
                                          [vehicle.value]: { ...data, extraHourPrice: e.target.value }
                                        })}
                                        placeholder="€"
                                        className="w-full px-2 py-2 text-center border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                      />
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAllocationForm(false)}
                      className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      {loading ? 'Kaydediliyor...' : 'Fiyatları Kaydet'}
                    </button>
                  </div>
                </form>
              )}

              {/* Add Button */}
              {!showAllocationForm && (
                <button
                  onClick={() => setShowAllocationForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Toplu Tahsis Fiyatı Ekle
                </button>
              )}

              {/* Grouped Allocation List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
                  <p className="mt-4 text-slate-600">Yükleniyor...</p>
                </div>
              ) : Object.keys(groupedAllocations).length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <Truck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz tahsis fiyatı yok</h3>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.values(groupedAllocations).map((group: any, idx: number) => {
                    const allocType = ALLOCATION_TYPES.find(t => t.value === group.allocationType);
                    return (
                      <div key={idx} className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">
                                {group.city} - {allocType?.label}
                              </h3>
                              {group.seasonName && (
                                <p className="text-sm text-slate-600 mt-1">
                                  {group.seasonName} • {new Date(group.startDate).toLocaleDateString('tr-TR')} - {new Date(group.endDate).toLocaleDateString('tr-TR')}
                                </p>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                              {group.prices.length} araç
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.prices.map((pricing: AllocationPricing) => {
                              const vehicle = VEHICLE_TYPES.find(v => v.value === pricing.vehicleType);
                              return (
                                <div key={pricing.id} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 relative group">
                                  <button
                                    onClick={() => handleDeleteAllocation(pricing.id)}
                                    className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3 text-red-600" />
                                  </button>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Truck className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold text-slate-900 text-sm">{vehicle?.label}</span>
                                  </div>
                                  <div className="text-xs text-slate-600 mb-3">{vehicle?.capacity}</div>
                                  {pricing.allocationType === 'PACKAGE_TOUR' ? (
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-green-700 font-medium">Paket ({pricing.packageDays} gün)</span>
                                        <span className="text-lg font-bold text-green-700">{pricing.currency} {pricing.packagePrice}</span>
                                      </div>
                                      {pricing.extraDayPrice && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs text-green-700 font-medium">Ekstra Gün</span>
                                          <span className="text-base font-bold text-green-700">{pricing.currency} {pricing.extraDayPrice}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-green-700 font-medium">Baz ({pricing.baseHours}h)</span>
                                        <span className="text-lg font-bold text-green-700">{pricing.currency} {pricing.basePrice}</span>
                                      </div>
                                      {pricing.extraHourPrice && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs text-green-700 font-medium">Ekstra Saat</span>
                                          <span className="text-base font-bold text-green-700">{pricing.currency} {pricing.extraHourPrice}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclePricing;
