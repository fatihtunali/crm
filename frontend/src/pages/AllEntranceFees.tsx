import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Ticket,
  Building2,
  MapPin,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface EntranceFee {
  id: number;
  city: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  adultPrice: any;
  child0to6Price: any;
  child7to12Price: any;
  studentPrice: any;
  currency: string;
  notes?: string;
  isActive: boolean;
  supplier: {
    id: number;
    name: string;
    type: string;
    city?: string;
  };
}

const AGE_CATEGORIES = [
  { key: 'adultPrice', label: 'Yetişkin', description: 'Adult', color: 'blue' },
  { key: 'child0to6Price', label: 'Çocuk 0-6', description: '0-6 yaş', color: 'pink' },
  { key: 'child7to12Price', label: 'Çocuk 7-12', description: '7-12 yaş', color: 'rose' },
  { key: 'studentPrice', label: 'Öğrenci', description: 'Student', color: 'amber' },
];

const AllEntranceFees: React.FC = () => {
  const navigate = useNavigate();
  const [entranceFees, setEntranceFees] = useState<EntranceFee[]>([]);
  const [filteredFees, setFilteredFees] = useState<EntranceFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('');

  useEffect(() => {
    fetchEntranceFees();
  }, []);

  useEffect(() => {
    filterFees();
  }, [entranceFees, searchTerm, cityFilter]);

  const fetchEntranceFees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/entrance-fees');
      setEntranceFees(response.data.data);
    } catch (error) {
      console.error('Error fetching entrance fees:', error);
      alert('Giriş ücretleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filterFees = () => {
    let filtered = entranceFees;

    // City filter
    if (cityFilter) {
      filtered = filtered.filter(f => f.city === cityFilter);
    }

    // Search filter (supplier name, city, season)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        f =>
          f.supplier.name.toLowerCase().includes(term) ||
          f.city.toLowerCase().includes(term) ||
          f.seasonName.toLowerCase().includes(term)
      );
    }

    setFilteredFees(filtered);
  };

  // Group by city + season
  const groupedFees = filteredFees.reduce((acc, fee) => {
    const key = `${fee.city}-${fee.seasonName}`;
    if (!acc[key]) {
      acc[key] = {
        city: fee.city,
        seasonName: fee.seasonName,
        startDate: fee.startDate,
        endDate: fee.endDate,
        items: [],
      };
    }
    acc[key].items.push(fee);
    return acc;
  }, {} as any);

  const groups = Object.values(groupedFees);

  // Get unique cities for filter
  const cities = Array.from(new Set(entranceFees.map(f => f.city))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tüm Giriş Ücretleri</h1>
          <p className="text-slate-600 mt-1">
            Müze ve turistik mekan giriş ücretlerinin tamamı
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">
                {filteredFees.length} Fiyat
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/entrance-fees/new')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Yeni Giriş Ücreti
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tedarikçi, şehir veya sezon ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* City Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Tüm Şehirler</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Entrance Fees List */}
      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Ticket className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Giriş ücreti bulunamadı</p>
          </div>
        ) : (
          groups.map((group: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* Header: City + Season */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                    <MapPin className="h-6 w-6 text-purple-700" />
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

              {/* Suppliers in this city+season */}
              <div className="space-y-3">
                {group.items.map((fee: EntranceFee) => (
                  <div key={fee.id} className="border border-slate-200 rounded-lg p-4">
                    {/* Supplier Name */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => navigate(`/resources/suppliers/${fee.supplier.id}/entrance-fees`)}
                        className="flex items-center gap-3 hover:bg-slate-50 rounded-lg p-2 -ml-2 transition-all group"
                      >
                        <Building2 className="h-5 w-5 text-purple-600" />
                        <div className="text-left">
                          <h4 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                            {fee.supplier.name}
                          </h4>
                          <p className="text-xs text-slate-500">{fee.supplier.city}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    {/* Prices Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            {AGE_CATEGORIES.map(cat => (
                              <th key={cat.key} className="px-4 py-2 text-left">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">{cat.label}</div>
                                  <div className="text-xs text-slate-600 font-normal">{cat.description}</div>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {AGE_CATEGORIES.map(cat => (
                              <td key={cat.key} className="px-4 py-3 border-r border-slate-100 last:border-r-0">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-lg font-bold text-green-700">
                                    €{Number(fee[cat.key as keyof EntranceFee])}
                                  </span>
                                  <span className="text-xs text-green-600">{fee.currency}</span>
                                </div>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Notes */}
                    {fee.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-sm text-slate-600">{fee.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllEntranceFees;
