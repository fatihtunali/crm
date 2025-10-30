import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, User, MapPin, Phone, Mail, Edit, Trash2, Globe } from 'lucide-react';
import api from '../services/api';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality?: string;
  city?: string;
  isActive: boolean;
  agent?: {
    id: number;
    companyName: string;
  };
}

const DirectClients = () => {
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get('agentId');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNationality, setSelectedNationality] = useState<string>('');

  useEffect(() => {
    fetchCustomers();
  }, [agentId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (agentId) {
        params.agentId = agentId;
      } else {
        params.type = 'b2c'; // B2C = direct clients only
      }
      const response = await api.get('/customers', { params });
      setCustomers(response.data.data);
    } catch (error) {
      console.error('Fetch customers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) return;

    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error('Delete customer error:', error);
      alert('Müşteri silinirken hata oluştu');
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNationality = !selectedNationality || customer.nationality === selectedNationality;

    return matchesSearch && matchesNationality;
  });

  const nationalities = Array.from(new Set(customers.map(c => c.nationality).filter(Boolean)));

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {agentId ? 'Acente Müşterileri' : 'Direkt Müşteriler (B2C)'}
              </h1>
              <p className="text-slate-600 mt-1">
                {agentId ? 'Bu acentenin müşterileri' : 'Direkt sizinle çalışan müşteriler'}
              </p>
            </div>
            <Link
              to={`/customers/direct/new${agentId ? `?agentId=${agentId}` : ''}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5" />
              Yeni Müşteri
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="İsim, email ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={selectedNationality}
            onChange={(e) => setSelectedNationality(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tüm Uyruklular</option>
            {nationalities.map((nationality) => (
              <option key={nationality} value={nationality}>{nationality}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Müşteriler yükleniyor...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Henüz müşteri eklenmemiş</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-6 w-6 text-green-600" />
                        <h3 className="text-xl font-bold text-slate-900">
                          {customer.firstName} {customer.lastName}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                        {customer.nationality && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Globe className="h-4 w-4" />
                            <span className="text-sm">{customer.nationality}</span>
                          </div>
                        )}
                        {customer.city && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{customer.city}</span>
                          </div>
                        )}
                      </div>

                      {customer.agent && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Acente: {customer.agent.companyName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/customers/direct/${customer.id}`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Detaylar"
                      >
                        <User className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/customers/direct/${customer.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectClients;
