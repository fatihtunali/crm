import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../services/api';

const AgentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    taxNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Turkey',
    paymentTerms: '',
    creditLimit: '',
    commissionRate: '',
    contractStart: '',
    contractEnd: '',
    notes: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchAgent();
    }
  }, [id]);

  const fetchAgent = async () => {
    try {
      const response = await api.get(`/agents/${id}`);
      const agent = response.data.data;
      setFormData({
        companyName: agent.companyName || '',
        taxNumber: agent.taxNumber || '',
        contactPerson: agent.contactPerson || '',
        email: agent.email || '',
        phone: agent.phone || '',
        address: agent.address || '',
        city: agent.city || '',
        country: agent.country || 'Turkey',
        paymentTerms: agent.paymentTerms || '',
        creditLimit: agent.creditLimit || '',
        commissionRate: agent.commissionRate || '',
        contractStart: agent.contractStart ? agent.contractStart.split('T')[0] : '',
        contractEnd: agent.contractEnd ? agent.contractEnd.split('T')[0] : '',
        notes: agent.notes || '',
      });
    } catch (error) {
      console.error('Fetch agent error:', error);
      alert('Acente yüklenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/agents/${id}`, formData);
      } else {
        await api.post('/agents', formData);
      }
      navigate('/customers/agents');
    } catch (error) {
      console.error('Save agent error:', error);
      alert('Acente kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/customers/agents')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEdit ? 'Acente Düzenle' : 'Yeni Acente'}
              </h1>
              <p className="text-slate-600 mt-1">Acente bilgilerini girin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {/* Şirket Bilgileri */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Şirket Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Şirket Adı *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vergi Numarası
                  </label>
                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">İletişim Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    İletişim Kişisi *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Şehir
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Adres
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* İş Koşulları */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">İş Koşulları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ödeme Koşulları
                  </label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Prepaid">Peşin</option>
                    <option value="30 days">30 Gün</option>
                    <option value="60 days">60 Gün</option>
                    <option value="90 days">90 Gün</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kredi Limiti (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Komisyon Oranı (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="commissionRate"
                    value={formData.commissionRate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sözleşme Başlangıç
                  </label>
                  <input
                    type="date"
                    name="contractStart"
                    value={formData.contractStart}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sözleşme Bitiş
                  </label>
                  <input
                    type="date"
                    name="contractEnd"
                    value={formData.contractEnd}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Notlar */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notlar
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/customers/agents')}
                className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
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

export default AgentForm;
