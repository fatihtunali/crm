import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  Filter,
  Tag,
  Ticket,
  Utensils,
} from 'lucide-react';

interface Supplier {
  id: number;
  name: string;
  type: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  taxNumber?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

const SUPPLIER_TYPES = [
  { value: 'RESTAURANT', label: 'Restoran', icon: Utensils, color: 'blue' },
  { value: 'ACTIVITY', label: 'Aktivite', icon: Tag, color: 'green' },
  { value: 'OTHER', label: 'Diğer', icon: FileText, color: 'slate' },
];

const Suppliers: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('active');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, typeFilter, activeFilter]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = suppliers;

    // MUSEUM tipini hiç gösterme (Giriş Ücretleri'nde ayrı sayfa var)
    filtered = filtered.filter(s => s.type !== 'MUSEUM');

    // Active filter
    if (activeFilter === 'active') {
      filtered = filtered.filter(s => s.isActive);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter(s => !s.isActive);
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(s => s.type === typeFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(term) ||
          s.city?.toLowerCase().includes(term) ||
          s.contactPerson?.toLowerCase().includes(term) ||
          s.phone?.toLowerCase().includes(term)
      );
    }

    setFilteredSuppliers(filtered);
  };

  const getTypeInfo = (type: string) => {
    return SUPPLIER_TYPES.find(t => t.value === type) || SUPPLIER_TYPES[4];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tedarikçiler</h1>
          <p className="text-slate-600 mt-1">
            Restoran, müze, aktivite ve diğer tedarikçileri yönetin
          </p>
        </div>
        <button
          onClick={() => navigate('/resources/suppliers/new')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Yeni Tedarikçi
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Ad, şehir, telefon ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Tüm Tipler</option>
              {SUPPLIER_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filter */}
          <div>
            <select
              value={activeFilter}
              onChange={e => setActiveFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {SUPPLIER_TYPES.map(type => {
          const count = suppliers.filter(s => s.type === type.value && s.isActive).length;
          const Icon = type.icon;
          return (
            <div
              key={type.value}
              className={`bg-gradient-to-br from-${type.color}-50 to-${type.color}-100 rounded-lg p-4 border border-${type.color}-200`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${type.color}-200 rounded-lg`}>
                  <Icon className={`h-5 w-5 text-${type.color}-700`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold text-${type.color}-700`}>{count}</p>
                  <p className={`text-xs text-${type.color}-600`}>{type.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suppliers List */}
      <div className="space-y-4">
        {filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Tedarikçi bulunamadı</p>
          </div>
        ) : (
          filteredSuppliers.map(supplier => {
            const typeInfo = getTypeInfo(supplier.type);
            const Icon = typeInfo.icon;

            return (
              <div
                key={supplier.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Left: Name & Type */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-gradient-to-br from-${typeInfo.color}-100 to-${typeInfo.color}-200 rounded-xl`}>
                      <Icon className={`h-6 w-6 text-${typeInfo.color}-700`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{supplier.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 bg-${typeInfo.color}-100 text-${typeInfo.color}-700 text-xs font-semibold rounded-full`}>
                          {typeInfo.label}
                        </span>
                        {!supplier.isActive && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            Pasif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/resources/suppliers/${supplier.id}/entrance-fees`)}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all"
                    >
                      <Ticket className="h-4 w-4" />
                      Giriş Ücretleri
                    </button>
                    <button
                      onClick={() => navigate(`/resources/suppliers/${supplier.id}/service-pricing`)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                    >
                      <DollarSign className="h-4 w-4" />
                      Hizmet Fiyatları
                    </button>
                    <button
                      onClick={() => navigate(`/resources/suppliers/${supplier.id}/edit`)}
                      className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {supplier.city && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{supplier.city}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.contactPerson && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4 text-slate-400" />
                      <span>{supplier.contactPerson}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {supplier.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-600">{supplier.notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Suppliers;
