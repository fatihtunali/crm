import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Hotel, Car, User as UserIcon, UtensilsCrossed } from 'lucide-react';
import api from '../services/api';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  agent?: {
    id: number;
    companyName: string;
  };
}

interface Agent {
  id: number;
  companyName: string;
  contactPerson: string;
}

interface Hotel {
  id: number;
  name: string;
  city: string;
}

interface Guide {
  id: number;
  firstName: string;
  lastName: string;
}

interface Participant {
  participantType: 'ADULT' | 'CHILD_0_2' | 'CHILD_3_5' | 'CHILD_6_11' | 'STUDENT';
  firstName: string;
  lastName: string;
  age?: number;
}

interface DayItinerary {
  dayNumber: number;
  date: string;
  hotelId: number | '';
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FAMILY' | '';
  transferType: string;
  vehicleType: 'VITO' | 'SPRINTER' | 'ISUZU' | 'COACH' | 'CAR' | 'VAN' | 'MINIBUS' | 'MIDIBUS' | 'BUS' | 'LUXURY' | '';
  guideId: number | '';
  guideService: 'FULL_DAY' | 'HALF_DAY' | 'TRANSFER' | 'NIGHT_SERVICE' | 'PACKAGE_TOUR' | '';
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  description: string;
  notes: string;
  dayCost: number;
  dayPrice: number;
}

const ReservationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [customerType, setCustomerType] = useState<'AGENT' | 'DIRECT'>('DIRECT');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);

  const [formData, setFormData] = useState({
    agentId: '',
    customerId: '',
    startDate: '',
    endDate: '',
    totalDays: 0,
    currency: 'EUR',
    notes: '',
    internalNotes: '',
  });

  const [participants, setParticipants] = useState<Participant[]>([
    { participantType: 'ADULT', firstName: '', lastName: '' },
  ]);

  const [days, setDays] = useState<DayItinerary[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateDays();
  }, [formData.startDate, formData.endDate]);

  const fetchData = async () => {
    try {
      const [agentsRes, customersRes, hotelsRes, guidesRes] = await Promise.all([
        api.get('/agents'),
        api.get('/customers'),
        api.get('/hotels'),
        api.get('/guides'),
      ]);

      setAgents(agentsRes.data.data);
      setCustomers(customersRes.data.data);
      setHotels(hotelsRes.data.data);
      setGuides(guidesRes.data.data);
    } catch (error) {
      console.error('Fetch data error:', error);
    }
  };

  // Filter customers based on selected agent (for B2B) or show only direct customers (for B2C)
  const getFilteredCustomers = () => {
    if (customerType === 'AGENT' && formData.agentId) {
      // Show only customers of selected agent
      return customers.filter(c => c.agent?.id === parseInt(formData.agentId));
    } else if (customerType === 'DIRECT') {
      // Show only direct customers (no agent)
      return customers.filter(c => !c.agent);
    }
    return [];
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    setFormData(prev => ({ ...prev, totalDays: diffDays }));

    // Generate day itineraries
    const newDays: DayItinerary[] = [];
    for (let i = 0; i < diffDays; i++) {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + i);

      newDays.push({
        dayNumber: i + 1,
        date: dayDate.toISOString().split('T')[0],
        hotelId: '',
        roomType: '',
        transferType: '',
        vehicleType: '',
        guideId: '',
        guideService: '',
        breakfast: false,
        lunch: false,
        dinner: false,
        description: '',
        notes: '',
        dayCost: 0,
        dayPrice: 0,
      });
    }
    setDays(newDays);
  };

  const addParticipant = () => {
    setParticipants([...participants, { participantType: 'ADULT', firstName: '', lastName: '' }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: keyof Participant, value: any) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const updateDay = (index: number, field: keyof DayItinerary, value: any) => {
    const updated = [...days];
    updated[index] = { ...updated[index], [field]: value };
    setDays(updated);
  };

  const calculateTotals = () => {
    const totalCost = days.reduce((sum, day) => sum + Number(day.dayCost || 0), 0);
    const totalPrice = days.reduce((sum, day) => sum + Number(day.dayPrice || 0), 0);
    const profit = totalPrice - totalCost;
    return { totalCost, totalPrice, profit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { totalCost, totalPrice, profit } = calculateTotals();

      const adultCount = participants.filter(p => p.participantType === 'ADULT').length;
      const childCount = participants.filter(p => p.participantType !== 'ADULT').length;

      const data = {
        customerId: parseInt(formData.customerId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: formData.totalDays,
        totalCost,
        totalPrice,
        profit,
        currency: formData.currency,
        adultCount,
        childCount,
        notes: formData.notes,
        internalNotes: formData.internalNotes,
        participants: participants.map(p => ({
          participantType: p.participantType,
          firstName: p.firstName,
          lastName: p.lastName,
          age: p.age,
        })),
        days: days.map(d => ({
          dayNumber: d.dayNumber,
          date: d.date,
          hotelId: d.hotelId || null,
          roomType: d.roomType || null,
          transferType: d.transferType || null,
          vehicleType: d.vehicleType || null,
          guideId: d.guideId || null,
          guideService: d.guideService || null,
          breakfast: d.breakfast,
          lunch: d.lunch,
          dinner: d.dinner,
          description: d.description,
          notes: d.notes,
          dayCost: d.dayCost,
          dayPrice: d.dayPrice,
        })),
      };

      if (isEdit) {
        await api.put(`/reservations/${id}`, data);
      } else {
        await api.post('/reservations', data);
      }

      navigate('/reservations');
    } catch (error) {
      console.error('Save reservation error:', error);
      alert('Rezervasyon kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const { totalCost, totalPrice, profit } = calculateTotals();

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reservations')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEdit ? 'Rezervasyon Düzenle' : 'Yeni Rezervasyon'}
              </h1>
              <p className="text-slate-600 mt-1">Rezervasyon detaylarını girin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
          {/* Customer & Dates */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Müşteri ve Tarihler</h2>

            {/* Step 1: Customer Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Rezervasyon Sahibi *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  style={{
                    borderColor: customerType === 'AGENT' ? '#3b82f6' : '#e2e8f0',
                    backgroundColor: customerType === 'AGENT' ? '#eff6ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="customerType"
                    value="AGENT"
                    checked={customerType === 'AGENT'}
                    onChange={(e) => {
                      setCustomerType(e.target.value as 'AGENT' | 'DIRECT');
                      setFormData({ ...formData, agentId: '', customerId: '' });
                    }}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-900">Acente (B2B)</span>
                </label>
                <label className="flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  style={{
                    borderColor: customerType === 'DIRECT' ? '#3b82f6' : '#e2e8f0',
                    backgroundColor: customerType === 'DIRECT' ? '#eff6ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="customerType"
                    value="DIRECT"
                    checked={customerType === 'DIRECT'}
                    onChange={(e) => {
                      setCustomerType(e.target.value as 'AGENT' | 'DIRECT');
                      setFormData({ ...formData, agentId: '', customerId: '' });
                    }}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-900">Direkt Müşteri (B2C)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 2: Agent Selection (only for B2B) */}
              {customerType === 'AGENT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Acente *</label>
                  <select
                    value={formData.agentId}
                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value, customerId: '' })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Acente seçin</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 3: Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {customerType === 'AGENT' ? 'Acentenin Müşterisi *' : 'Müşteri *'}
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                  disabled={customerType === 'AGENT' && !formData.agentId}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {customerType === 'AGENT' && !formData.agentId
                      ? 'Önce acente seçin'
                      : 'Müşteri seçin'}
                  </option>
                  {getFilteredCustomers().map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Başlangıç Tarihi *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bitiş Tarihi *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {formData.totalDays > 0 && (
              <p className="mt-4 text-sm text-blue-600 font-medium">
                Toplam {formData.totalDays} gün
              </p>
            )}
          </div>

          {/* Participants */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Katılımcılar</h2>
              <button
                type="button"
                onClick={addParticipant}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Katılımcı Ekle
              </button>
            </div>

            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <select
                    value={participant.participantType}
                    onChange={(e) => updateParticipant(index, 'participantType', e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ADULT">Yetişkin</option>
                    <option value="CHILD_0_2">Çocuk 0-2</option>
                    <option value="CHILD_3_5">Çocuk 3-5</option>
                    <option value="CHILD_6_11">Çocuk 6-11</option>
                    <option value="STUDENT">Öğrenci</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Ad"
                    value={participant.firstName}
                    onChange={(e) => updateParticipant(index, 'firstName', e.target.value)}
                    required
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Soyad"
                    value={participant.lastName}
                    onChange={(e) => updateParticipant(index, 'lastName', e.target.value)}
                    required
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {participant.participantType !== 'ADULT' && (
                    <input
                      type="number"
                      placeholder="Yaş"
                      value={participant.age || ''}
                      onChange={(e) => updateParticipant(index, 'age', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Itinerary */}
          {days.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Günlük Program</h2>
              <div className="space-y-4">
                {days.map((day, index) => (
                  <div key={index} className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-blue-900">
                        Gün {day.dayNumber} - {new Date(day.date).toLocaleDateString('tr-TR')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Hotel */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Hotel className="h-4 w-4" />
                          Otel
                        </label>
                        <select
                          value={day.hotelId}
                          onChange={(e) => updateDay(index, 'hotelId', parseInt(e.target.value) || '')}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Otel seçin</option>
                          {hotels.map((hotel) => (
                            <option key={hotel.id} value={hotel.id}>
                              {hotel.name} ({hotel.city})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Room Type */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Oda Tipi</label>
                        <select
                          value={day.roomType}
                          onChange={(e) => updateDay(index, 'roomType', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seçin</option>
                          <option value="SINGLE">Single</option>
                          <option value="DOUBLE">Double</option>
                          <option value="TRIPLE">Triple</option>
                          <option value="FAMILY">Family</option>
                        </select>
                      </div>

                      {/* Guide */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Rehber
                        </label>
                        <select
                          value={day.guideId}
                          onChange={(e) => updateDay(index, 'guideId', parseInt(e.target.value) || '')}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Rehber seçin</option>
                          {guides.map((guide) => (
                            <option key={guide.id} value={guide.id}>
                              {guide.firstName} {guide.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Guide Service */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Rehber Hizmeti</label>
                        <select
                          value={day.guideService}
                          onChange={(e) => updateDay(index, 'guideService', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seçin</option>
                          <option value="FULL_DAY">Tam Gün</option>
                          <option value="HALF_DAY">Yarım Gün</option>
                          <option value="TRANSFER">Transfer</option>
                          <option value="NIGHT_SERVICE">Gece Kullanımı</option>
                        </select>
                      </div>

                      {/* Vehicle Type */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Araç Tipi
                        </label>
                        <select
                          value={day.vehicleType}
                          onChange={(e) => updateDay(index, 'vehicleType', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seçin</option>
                          <option value="VITO">Vito (4 pax)</option>
                          <option value="SPRINTER">Sprinter (12 pax)</option>
                          <option value="ISUZU">Isuzu (20 pax)</option>
                          <option value="COACH">Coach (46 pax)</option>
                        </select>
                      </div>

                      {/* Transfer Type */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Transfer Tipi</label>
                        <input
                          type="text"
                          placeholder="Airport Pickup, City Transfer..."
                          value={day.transferType}
                          onChange={(e) => updateDay(index, 'transferType', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Meals */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4" />
                          Yemekler
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={day.breakfast}
                              onChange={(e) => updateDay(index, 'breakfast', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">Kahvaltı</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={day.lunch}
                              onChange={(e) => updateDay(index, 'lunch', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">Öğle Yemeği</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={day.dinner}
                              onChange={(e) => updateDay(index, 'dinner', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">Akşam Yemeği</span>
                          </label>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Program Açıklaması</label>
                        <input
                          type="text"
                          placeholder="Ephesus Ancient City, Pamukkale Tour..."
                          value={day.description}
                          onChange={(e) => updateDay(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Cost & Price */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Maliyet (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={day.dayCost || ''}
                          onChange={(e) => updateDay(index, 'dayCost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Satış Fiyatı (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={day.dayPrice || ''}
                          onChange={(e) => updateDay(index, 'dayPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          {days.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border-2 border-blue-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Fiyat Özeti</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-600 mb-1">Toplam Maliyet</p>
                  <p className="text-2xl font-bold text-red-600">€ {totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-slate-600 mb-1">Satış Fiyatı</p>
                  <p className="text-2xl font-bold text-green-600">€ {totalPrice.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-slate-600 mb-1">Kar</p>
                  <p className="text-2xl font-bold text-purple-600">€ {profit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Notlar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Müşteri Notları</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Müşteriye gönderilecek notlar..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dahili Notlar</label>
                <textarea
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sadece dahili kullanım için..."
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/reservations')}
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !formData.customerId ||
                !formData.startDate ||
                !formData.endDate ||
                (customerType === 'AGENT' && !formData.agentId)
              }
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Rezervasyon Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;
