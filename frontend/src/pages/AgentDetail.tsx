import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, Phone, Mail, MapPin, DollarSign, Calendar, Users, Plus, User } from 'lucide-react';
import api from '../services/api';

interface Agent {
  id: number;
  companyName: string;
  taxNumber?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: string;
  creditLimit?: number;
  commissionRate?: number;
  contractStart?: string;
  contractEnd?: string;
  notes?: string;
  customers: Customer[];
  contactHistory: ContactHistory[];
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality?: string;
}

interface ContactHistory {
  id: number;
  contactType: string;
  subject: string;
  notes: string;
  contactDate: string;
}

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgent();
  }, [id]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/agents/${id}`);
      setAgent(response.data.data);
    } catch (error) {
      console.error('Fetch agent error:', error);
      alert('Acente yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600">Acente bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/customers/agents')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{agent.companyName}</h1>
                <p className="text-slate-600 mt-1">{agent.contactPerson}</p>
              </div>
            </div>
            <Link
              to={`/customers/agents/${id}/edit`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Edit className="h-5 w-5" />
              Düzenle
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Şirket Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Şirket Adı</p>
                  <p className="font-semibold text-slate-900">{agent.companyName}</p>
                </div>
              </div>
              {agent.taxNumber && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Vergi No</p>
                    <p className="font-semibold text-slate-900">{agent.taxNumber}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Telefon</p>
                  <p className="font-semibold text-slate-900">{agent.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold text-slate-900">{agent.email}</p>
                </div>
              </div>
              {agent.city && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Şehir</p>
                    <p className="font-semibold text-slate-900">{agent.city}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Terms */}
          {(agent.paymentTerms || agent.creditLimit || agent.commissionRate) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">İş Koşulları</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {agent.paymentTerms && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600">Ödeme Koşulları</p>
                      <p className="font-semibold text-slate-900">{agent.paymentTerms}</p>
                    </div>
                  </div>
                )}
                {agent.creditLimit && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600">Kredi Limiti</p>
                      <p className="font-semibold text-slate-900">€{Number(agent.creditLimit).toFixed(2)}</p>
                    </div>
                  </div>
                )}
                {agent.commissionRate && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600">Komisyon Oranı</p>
                      <p className="font-semibold text-slate-900">%{agent.commissionRate}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Müşteriler ({agent.customers.length})</h2>
              <Link
                to={`/customers/direct/new?agentId=${id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                Yeni Müşteri
              </Link>
            </div>
            {agent.customers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">Henüz müşteri eklenmemiş</p>
              </div>
            ) : (
              <div className="space-y-2">
                {agent.customers.map((customer) => (
                  <Link
                    key={customer.id}
                    to={`/customers/direct/${customer.id}`}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-slate-600">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      {customer.nationality || 'N/A'}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {agent.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Notlar</h2>
              <p className="text-slate-700 whitespace-pre-wrap">{agent.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
