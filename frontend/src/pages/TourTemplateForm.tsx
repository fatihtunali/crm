import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import {
  Save,
  X,
  Package,
  Calendar,
  Euro,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';

interface TemplateDay {
  dayNumber: number;
  description: string;
  dayCost: string;
  dayPrice: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  notes: string;
  activities: Activity[];
}

interface Activity {
  activityType: string;
  name: string;
  cost: string;
  price: string;
  notes: string;
}

const ACTIVITY_TYPES = [
  { value: 'ENTRANCE', label: 'Giriş Ücreti' },
  { value: 'MEAL', label: 'Yemek' },
  { value: 'ACTIVITY', label: 'Aktivite' },
  { value: 'TRANSPORT', label: 'Transfer' },
  { value: 'OTHER', label: 'Diğer' },
];

const TourTemplateForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalDays: '7',
    estimatedCost: '0',
    estimatedPrice: '0',
    currency: 'EUR',
    notes: '',
  });

  const [days, setDays] = useState<TemplateDay[]>([
    {
      dayNumber: 1,
      description: '',
      dayCost: '0',
      dayPrice: '0',
      breakfast: false,
      lunch: false,
      dinner: false,
      notes: '',
      activities: [],
    },
  ]);

  useEffect(() => {
    if (isEdit) {
      fetchTemplate();
    }
  }, [id]);

  useEffect(() => {
    // Recalculate total cost and price when days change
    const totalCost = days.reduce((sum, day) => sum + Number(day.dayCost || 0), 0);
    const totalPrice = days.reduce((sum, day) => sum + Number(day.dayPrice || 0), 0);
    setFormData((prev) => ({
      ...prev,
      estimatedCost: totalCost.toFixed(2),
      estimatedPrice: totalPrice.toFixed(2),
    }));
  }, [days]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tour-templates/${id}`);
      const template = response.data.data;

      setFormData({
        name: template.name,
        description: template.description || '',
        totalDays: template.totalDays.toString(),
        estimatedCost: Number(template.estimatedCost).toFixed(2),
        estimatedPrice: Number(template.estimatedPrice).toFixed(2),
        currency: template.currency,
        notes: template.notes || '',
      });

      if (template.days && template.days.length > 0) {
        setDays(
          template.days.map((day: any) => ({
            dayNumber: day.dayNumber,
            description: day.description,
            dayCost: Number(day.dayCost).toFixed(2),
            dayPrice: Number(day.dayPrice).toFixed(2),
            breakfast: day.breakfast,
            lunch: day.lunch,
            dinner: day.dinner,
            notes: day.notes || '',
            activities: day.activities?.map((act: any) => ({
              activityType: act.activityType,
              name: act.name,
              cost: Number(act.cost).toFixed(2),
              price: Number(act.price).toFixed(2),
              notes: act.notes || '',
            })) || [],
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      alert('Şablon yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.totalDays) {
      alert('Lütfen zorunlu alanları doldurun');
      return;
    }

    const payload = {
      ...formData,
      totalDays: parseInt(formData.totalDays),
      estimatedCost: parseFloat(formData.estimatedCost),
      estimatedPrice: parseFloat(formData.estimatedPrice),
      days: days.map((day) => ({
        dayNumber: day.dayNumber,
        description: day.description,
        dayCost: parseFloat(day.dayCost),
        dayPrice: parseFloat(day.dayPrice),
        breakfast: day.breakfast,
        lunch: day.lunch,
        dinner: day.dinner,
        notes: day.notes || null,
        activities: day.activities.map((act) => ({
          activityType: act.activityType,
          name: act.name,
          cost: parseFloat(act.cost),
          price: parseFloat(act.price),
          notes: act.notes || null,
        })),
      })),
    };

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/tour-templates/${id}`, payload);
        alert('Tur şablonu başarıyla güncellendi');
      } else {
        await api.post('/tour-templates', payload);
        alert('Tur şablonu başarıyla oluşturuldu');
      }
      navigate('/tour-templates');
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert(error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addDay = () => {
    setDays([
      ...days,
      {
        dayNumber: days.length + 1,
        description: '',
        dayCost: '0',
        dayPrice: '0',
        breakfast: false,
        lunch: false,
        dinner: false,
        notes: '',
        activities: [],
      },
    ]);
  };

  const removeDay = (index: number) => {
    if (days.length === 1) {
      alert('En az bir gün olmalıdır');
      return;
    }
    const newDays = days.filter((_, i) => i !== index);
    // Renumber days
    newDays.forEach((day, i) => {
      day.dayNumber = i + 1;
    });
    setDays(newDays);
  };

  const updateDay = (index: number, field: keyof TemplateDay, value: any) => {
    const newDays = [...days];
    (newDays[index] as any)[field] = value;
    setDays(newDays);
  };

  const addActivity = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].activities.push({
      activityType: 'ENTRANCE',
      name: '',
      cost: '0',
      price: '0',
      notes: '',
    });
    setDays(newDays);
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter(
      (_, i) => i !== activityIndex
    );
    setDays(newDays);
  };

  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    field: keyof Activity,
    value: any
  ) => {
    const newDays = [...days];
    (newDays[dayIndex].activities[activityIndex] as any)[field] = value;
    setDays(newDays);
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {isEdit ? 'Tur Şablonu Düzenle' : 'Yeni Tur Şablonu'}
        </h1>
        <p className="text-slate-600 mt-1">
          {isEdit
            ? 'Tur şablonunu güncelleyin'
            : 'Sık kullanılan turlar için şablon oluşturun'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            Temel Bilgiler
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Şablon Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="7 Days Istanbul & Cappadocia Classic"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Toplam Gün Sayısı *
                </label>
                <input
                  type="number"
                  value={formData.totalDays}
                  onChange={(e) => setFormData({ ...formData, totalDays: e.target.value })}
                  min="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Tur hakkında genel bilgi..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Para Birimi
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Euro className="inline h-4 w-4 mr-1 text-red-600" />
                  Tahmini Maliyet (Otomatik)
                </label>
                <input
                  type="text"
                  value={formData.estimatedCost}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Euro className="inline h-4 w-4 mr-1 text-blue-600" />
                  Tahmini Satış Fiyatı (Otomatik)
                </label>
                <input
                  type="text"
                  value={formData.estimatedPrice}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Notlar</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Dahili notlar..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Days */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Günlük Program ({days.length} Gün)
            </h2>
            <button
              type="button"
              onClick={addDay}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
            >
              <Plus className="h-4 w-4" />
              Gün Ekle
            </button>
          </div>

          <div className="space-y-6">
            {days.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900">Gün {day.dayNumber}</h3>
                  {days.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDay(dayIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Gün Açıklaması *
                    </label>
                    <input
                      type="text"
                      value={day.description}
                      onChange={(e) => updateDay(dayIndex, 'description', e.target.value)}
                      placeholder="Istanbul Old City - Topkapi, Hagia Sophia"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Meals */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Öğünler
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.breakfast}
                          onChange={(e) =>
                            updateDay(dayIndex, 'breakfast', e.target.checked)
                          }
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm text-slate-700">Kahvaltı</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.lunch}
                          onChange={(e) => updateDay(dayIndex, 'lunch', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm text-slate-700">Öğle</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.dinner}
                          onChange={(e) => updateDay(dayIndex, 'dinner', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm text-slate-700">Akşam</span>
                      </label>
                    </div>
                  </div>

                  {/* Day Cost & Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Gün Maliyeti *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={day.dayCost}
                        onChange={(e) => updateDay(dayIndex, 'dayCost', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Gün Satış Fiyatı *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={day.dayPrice}
                        onChange={(e) => updateDay(dayIndex, 'dayPrice', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-slate-700">
                        Aktiviteler
                      </label>
                      <button
                        type="button"
                        onClick={() => addActivity(dayIndex)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-all"
                      >
                        <Plus className="h-3 w-3" />
                        Aktivite Ekle
                      </button>
                    </div>

                    {day.activities.length === 0 ? (
                      <p className="text-sm text-slate-500 italic text-center py-2">
                        Henüz aktivite eklenmemiş
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {day.activities.map((activity, actIndex) => (
                          <div
                            key={actIndex}
                            className="grid grid-cols-12 gap-2 items-end p-2 bg-slate-50 rounded border border-slate-200"
                          >
                            <div className="col-span-3">
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Tip
                              </label>
                              <select
                                value={activity.activityType}
                                onChange={(e) =>
                                  updateActivity(
                                    dayIndex,
                                    actIndex,
                                    'activityType',
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                              >
                                {ACTIVITY_TYPES.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-4">
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Ad
                              </label>
                              <input
                                type="text"
                                value={activity.name}
                                onChange={(e) =>
                                  updateActivity(dayIndex, actIndex, 'name', e.target.value)
                                }
                                placeholder="Topkapi Palace"
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Maliyet
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={activity.cost}
                                onChange={(e) =>
                                  updateActivity(dayIndex, actIndex, 'cost', e.target.value)
                                }
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Fiyat
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={activity.price}
                                onChange={(e) =>
                                  updateActivity(
                                    dayIndex,
                                    actIndex,
                                    'price',
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                              />
                            </div>
                            <div className="col-span-1">
                              <button
                                type="button"
                                onClick={() => removeActivity(dayIndex, actIndex)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors w-full"
                              >
                                <Trash2 className="h-4 w-4 mx-auto" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Day Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Gün Notları
                    </label>
                    <input
                      type="text"
                      value={day.notes}
                      onChange={(e) => updateDay(dayIndex, 'notes', e.target.value)}
                      placeholder="Özel notlar..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/tour-templates')}
            className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TourTemplateForm;
