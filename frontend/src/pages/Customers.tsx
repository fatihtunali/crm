import { Link } from 'react-router-dom';
import { Building2, Users, ArrowRight, UserCheck, Briefcase } from 'lucide-react';

const Customers = () => {
  const customerTypes = [
    {
      title: 'Acenteler (B2B)',
      description: 'Çalıştığınız acenteler ve tur operatörleri',
      icon: Building2,
      link: '/customers/agents',
      gradient: 'from-indigo-500 via-indigo-600 to-purple-600',
      lightGradient: 'from-indigo-50 via-indigo-50 to-purple-100',
      borderColor: 'border-indigo-200/50',
      shadowColor: 'shadow-indigo-500/20 hover:shadow-indigo-500/40',
      stats: [
        { label: 'Aktif Acenteler', value: '0', icon: Briefcase },
        { label: 'Toplam Müşteri', value: '0', icon: UserCheck },
      ],
    },
    {
      title: 'Direkt Müşteriler (B2C)',
      description: 'Direkt sizinle çalışan bireysel müşteriler',
      icon: Users,
      link: '/customers/direct',
      gradient: 'from-green-500 via-green-600 to-emerald-600',
      lightGradient: 'from-green-50 via-green-50 to-emerald-100',
      borderColor: 'border-green-200/50',
      shadowColor: 'shadow-green-500/20 hover:shadow-green-500/40',
      stats: [
        { label: 'Aktif Müşteriler', value: '0', icon: Users },
        { label: 'Sadakat Puanı', value: '0', icon: UserCheck },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="relative px-8 py-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Müşteri Yönetimi
            </h1>
            <p className="text-slate-600 text-lg mt-2">
              B2B (Acenteler) ve B2C (Direkt Müşteriler) yönetimi
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {customerTypes.map((type) => {
              const Icon = type.icon;

              return (
                <Link
                  key={type.title}
                  to={type.link}
                  className={`group relative bg-gradient-to-br rounded-3xl p-8 border backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 overflow-hidden ${type.lightGradient} ${type.borderColor} shadow-xl hover:shadow-2xl ${type.shadowColor}`}
                >
                  {/* Decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none"></div>
                  <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/20 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="relative space-y-6">
                    {/* Icon and Arrow */}
                    <div className="flex items-start justify-between">
                      <div className={`p-6 rounded-2xl shadow-2xl bg-gradient-to-br group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${type.gradient}`}>
                        <Icon className="h-12 w-12 text-white" />
                      </div>
                      <div className="p-3 rounded-xl bg-white/50 group-hover:bg-white/80 transition-colors">
                        <ArrowRight className="h-6 w-6 text-slate-600 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-3xl font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                        {type.title}
                      </h3>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        {type.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      {type.stats.map((stat) => {
                        const StatIcon = stat.icon;
                        return (
                          <div key={stat.label} className="bg-white/50 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <StatIcon className="h-4 w-4 text-slate-600" />
                              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                                {stat.label}
                              </p>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* CTA Button */}
                    <div className={`inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl bg-gradient-to-r text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ${type.gradient}`}>
                      <span>Yönet</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Müşteri Tipleri</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                <strong>B2B (Acenteler):</strong> Sizinle çalışan acenteler ve tur operatörleri. Her acentenin kendi müşterileri olabilir.
              </li>
              <li>
                <strong>B2C (Direkt Müşteriler):</strong> Doğrudan sizinle çalışan bireysel müşteriler.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
