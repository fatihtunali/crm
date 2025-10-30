import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../services/api';

const ClientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get('agentId');
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    agentId: agentId || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    address: '',
    city: '',
    country: 'Turkey',
    emergencyContact: '',
    emergencyPhone: '',
    marketingConsent: false,
    notes: '',
  });

  useEffect(() => {
    fetchAgents();
    if (isEdit) {
      fetchCustomer();
    }
  }, [id]);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agents');
      setAgents(response.data.data);
    } catch (error) {
      console.error('Fetch agents error:', error);
    }
  };

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/customers/${id}`);
      const customer = response.data.data;
      setFormData({
        agentId: customer.agentId || '',
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
        nationality: customer.nationality || '',
        passportNumber: customer.passportNumber || '',
        passportExpiry: customer.passportExpiry ? customer.passportExpiry.split('T')[0] : '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || 'Turkey',
        emergencyContact: customer.emergencyContact || '',
        emergencyPhone: customer.emergencyPhone || '',
        marketingConsent: customer.marketingConsent || false,
        notes: customer.notes || '',
      });
    } catch (error) {
      console.error('Fetch customer error:', error);
      alert('Müşteri yüklenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        agentId: formData.agentId ? parseInt(formData.agentId) : null,
      };

      if (isEdit) {
        await api.put(`/customers/${id}`, data);
      } else {
        await api.post('/customers', data);
      }

      if (agentId) {
        navigate(`/customers/agents/${agentId}`);
      } else {
        navigate('/customers/direct');
      }
    } catch (error) {
      console.error('Save customer error:', error);
      alert('Müşteri kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(agentId ? `/customers/agents/${agentId}` : '/customers/direct')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEdit ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
              </h1>
              <p className="text-slate-600 mt-1">Müşteri bilgilerini girin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            {/* Agent Selection (if applicable) */}
            {!agentId && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Acente (Opsiyonel)</h3>
                <select
                  name="agentId"
                  value={formData.agentId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Direkt Müşteri (B2C)</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.companyName} - {agent.contactPerson}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Personal Info */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Kişisel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ad *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Soyad *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefon *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Doğum Tarihi</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Uyruk</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Turkish, German, Russian..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Passport Info */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Pasaport Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pasaport No</label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pasaport Geçerlilik</label>
                  <input
                    type="date"
                    name="passportExpiry"
                    value={formData.passportExpiry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Adres Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Adres</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Şehir</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ülke</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Acil Durum İletişimi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">İletişim Kişisi</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Marketing & Notes */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  name="marketingConsent"
                  checked={formData.marketingConsent}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <label htmlFor="marketingConsent" className="text-sm font-medium text-slate-700">
                  Pazarlama iletişimlerine izin veriyor
                </label>
              </div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notlar</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(agentId ? `/customers/agents/${agentId}` : '/customers/direct')}
                className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
