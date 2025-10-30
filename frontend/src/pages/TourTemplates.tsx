import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Euro,
  Package,
  Copy,
} from 'lucide-react';

interface TourTemplate {
  id: number;
  name: string;
  description?: string;
  totalDays: number;
  estimatedCost: any;
  estimatedPrice: any;
  currency: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  days: Array<{
    id: number;
    dayNumber: number;
    description: string;
    dayCost: any;
    dayPrice: any;
  }>;
}

const TourTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TourTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tour-templates');
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Error fetching tour templates:', error);
      alert('Tur şablonları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu tur şablonunu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/tour-templates/${id}`);
      alert('Tur şablonu silindi');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Silme işlemi başarısız');
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tur Şablonları</h1>
          <p className="text-slate-600 mt-1">
            Sık kullanılan turlar için hazır şablonlar
          </p>
        </div>
        <button
          onClick={() => navigate('/tour-templates/new')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Yeni Şablon
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <input
          type="text"
          placeholder="Şablon ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">
            {searchTerm ? 'Şablon bulunamadı' : 'Henüz tur şablonu eklenmemiş'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {!searchTerm && 'Yukarıdaki "Yeni Şablon" butonuna tıklayarak başlayın'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                {/* Template Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl text-white">
                      <Package className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-slate-600 mt-1">{template.description}</p>
                      )}

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold">{template.totalDays} Gün</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Euro className="h-4 w-4 text-green-600" />
                          <span>
                            Maliyet: {template.currency === 'EUR' && '€'}
                            {template.currency === 'USD' && '$'}
                            {template.currency === 'TRY' && '₺'}
                            {Number(template.estimatedCost).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Euro className="h-4 w-4 text-blue-600" />
                          <span>
                            Satış: {template.currency === 'EUR' && '€'}
                            {template.currency === 'USD' && '$'}
                            {template.currency === 'TRY' && '₺'}
                            {Number(template.estimatedPrice).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
                          <span>
                            Kar: {template.currency === 'EUR' && '€'}
                            {template.currency === 'USD' && '$'}
                            {template.currency === 'TRY' && '₺'}
                            {(
                              Number(template.estimatedPrice) - Number(template.estimatedCost)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Days Preview */}
                      {template.days && template.days.length > 0 && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-xs font-semibold text-slate-600 mb-2">
                            GÜNLÜK PROGRAM ÖZETİ
                          </p>
                          <div className="space-y-1">
                            {template.days.slice(0, 3).map((day) => (
                              <div
                                key={day.id}
                                className="text-sm text-slate-700 truncate"
                              >
                                <span className="font-semibold">Gün {day.dayNumber}:</span>{' '}
                                {day.description}
                              </div>
                            ))}
                            {template.days.length > 3 && (
                              <p className="text-xs text-slate-500 italic">
                                ... ve {template.days.length - 3} gün daha
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {template.notes && (
                        <p className="text-sm text-slate-500 mt-3 italic">{template.notes}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/tour-templates/${template.id}`)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm"
                    title="Detayları Gör"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden md:inline">Görüntüle</span>
                  </button>
                  <button
                    onClick={() => navigate(`/tour-templates/${template.id}/edit`)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all text-sm"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden md:inline">Düzenle</span>
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/reservations/new?templateId=${template.id}`)
                    }
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all text-sm font-semibold"
                    title="Bu şablonla rezervasyon oluştur"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden md:inline">Kullan</span>
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden md:inline">Sil</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      {filteredTemplates.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 İpucu:</strong> Tur şablonlarını rezervasyon oluştururken kullanarak
            zamandan tasarruf edebilirsiniz. "Kullan" butonuna tıklayarak hızlıca
            rezervasyon oluşturun.
          </p>
        </div>
      )}
    </div>
  );
};

export default TourTemplates;
