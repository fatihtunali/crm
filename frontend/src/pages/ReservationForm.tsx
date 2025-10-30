import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ReservationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

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
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-600 text-lg">
              Rezervasyon formu çok yakında...
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Bu sayfa müşteri seçimi, tarih seçimi, günlük itinerary ve fiyat hesaplama içerecek
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
