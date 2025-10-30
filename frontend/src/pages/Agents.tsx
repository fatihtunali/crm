import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2, MapPin, Phone, Edit, Trash2, DollarSign, Users } from 'lucide-react';
import api from '../services/api';

interface Agent {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city?: string;
  commissionRate?: number;
  creditLimit?: number;
  isActive: boolean;
  _count: {
    customers: number;
  };
}

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agents');
      setAgents(response.data.data);
    } catch (error) {
      console.error('Fetch agents error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu acenteyi silmek istediğinizden emin misiniz?')) return;

    try {
      await api.delete(`/agents/${id}`);
      fetchAgents();
    } catch (error) {
      console.error('Delete agent error:', error);
      alert('Acente silinirken hata oluştu');
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = !selectedCity || agent.city === selectedCity;

    return matchesSearch && matchesCity;
  });

  const cities = Array.from(new Set(agents.map(a => a.city).filter(Boolean)));

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Acenteler (B2B)</h1>
              <p className="text-slate-600 mt-1">Çalıştığınız acenteler ve tur operatörleri</p>
            </div>
            <Link
              to="/customers/agents/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5" />
              Yeni Acente
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
              placeholder="Acente adı, kişi veya email ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tüm Şehirler</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Acenteler yükleniyor...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Henüz acente eklenmemiş</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                        <h3 className="text-xl font-bold text-slate-900">{agent.companyName}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{agent.contactPerson}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{agent.phone}</span>
                        </div>
                        {agent.city && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{agent.city}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{agent._count.customers} müşteri</span>
                        </div>
                      </div>

                      {(agent.commissionRate || agent.creditLimit) && (
                        <div className="flex gap-4 mt-3">
                          {agent.commissionRate && (
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <DollarSign className="h-4 w-4" />
                              <span>Komisyon: %{agent.commissionRate}</span>
                            </div>
                          )}
                          {agent.creditLimit && (
                            <div className="flex items-center gap-1 text-sm text-amber-600">
                              <DollarSign className="h-4 w-4" />
                              <span>Kredi Limiti: €{Number(agent.creditLimit).toFixed(0)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/customers/agents/${agent.id}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Detaylar"
                      >
                        <Users className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/customers/agents/${agent.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(agent.id)}
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

export default Agents;
