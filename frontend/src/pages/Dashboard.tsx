import { Link } from 'react-router-dom';
import {
  Calendar,
  Hotel,
  Car,
  Users,
  TrendingUp,
  ArrowRight,
  MapPin,
  User as UserIcon,
  Sparkles,
  Clock,
  Zap,
  BarChart3,
  Activity,
  Truck,
  Ticket,
  Building2,
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { cn } from '../lib/utils';

const Dashboard = () => {
  const user = authService.getCurrentUser();

  const stats = [
    {
      title: 'Toplam Rezervasyon',
      value: '0',
      change: '+0%',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Aktif Oteller',
      value: '0',
      change: '+0%',
      icon: Hotel,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Araç Filosu',
      value: '0',
      change: '+0%',
      icon: Car,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Toplam Müşteri',
      value: '0',
      change: '+0%',
      icon: Users,
      gradient: 'from-orange-500 to-amber-500',
    },
  ];

  const quickActions = [
    {
      title: 'Oteller',
      description: 'Otel havuzunu yönet',
      icon: Hotel,
      link: '/resources/hotels',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Araç Tedarikçileri',
      description: 'Transfer ve tahsis fiyatları',
      icon: Truck,
      link: '/resources/vehicle-suppliers',
      gradient: 'from-teal-500 to-teal-600',
    },
    {
      title: 'Araçlar',
      description: 'Araç filosunu yönet',
      icon: Car,
      link: '/resources/vehicles',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Rehberler',
      description: 'Rehber kadrosunu yönet',
      icon: UserIcon,
      link: '/resources/guides',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Tedarikçiler',
      description: 'Tedarikçileri yönet',
      icon: MapPin,
      link: '/resources/suppliers',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Giriş Ücretleri',
      description: 'Müze ve turistik mekan fiyatları',
      icon: Ticket,
      link: '/entrance-fees',
      gradient: 'from-rose-500 to-rose-600',
    },
    {
      title: 'Acenteler (B2B)',
      description: 'Acente ve tur operatörleri',
      icon: Building2,
      link: '/customers/agents',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Direkt Müşteriler',
      description: 'Bireysel müşteriler (B2C)',
      icon: Users,
      link: '/customers/direct',
      gradient: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header with Glass Morphism */}
      <div className="relative bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="relative px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Hoş Geldiniz, {user?.firstName}!
                </h1>
                <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
              </div>
              <p className="text-slate-600 text-lg">
                İşte bugünün özeti ve hızlı erişim menüsü
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <span className="text-sm font-semibold text-emerald-700">Sistem Aktif</span>
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl shadow-sm">
                <Clock className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1800px] mx-auto space-y-10">
          {/* Stats Grid - 4 large cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colors = [
                {
                  bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600',
                  light: 'bg-gradient-to-br from-blue-50 to-cyan-50',
                  border: 'border-blue-200/50',
                  shadow: 'shadow-blue-500/20',
                  glow: 'group-hover:shadow-blue-500/40'
                },
                {
                  bg: 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600',
                  light: 'bg-gradient-to-br from-purple-50 to-pink-50',
                  border: 'border-purple-200/50',
                  shadow: 'shadow-purple-500/20',
                  glow: 'group-hover:shadow-purple-500/40'
                },
                {
                  bg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600',
                  light: 'bg-gradient-to-br from-emerald-50 to-teal-50',
                  border: 'border-emerald-200/50',
                  shadow: 'shadow-emerald-500/20',
                  glow: 'group-hover:shadow-emerald-500/40'
                },
                {
                  bg: 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600',
                  light: 'bg-gradient-to-br from-orange-50 to-amber-50',
                  border: 'border-orange-200/50',
                  shadow: 'shadow-orange-500/20',
                  glow: 'group-hover:shadow-orange-500/40'
                },
              ];
              const color = colors[index];

              return (
                <div
                  key={stat.title}
                  className={cn(
                    'group relative rounded-3xl p-8 border backdrop-blur-sm',
                    'shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2',
                    'overflow-hidden',
                    color.light,
                    color.border,
                    color.shadow,
                    color.glow
                  )}
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none"></div>

                  {/* Animated background pattern */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className={cn(
                        'p-5 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500',
                        color.bg
                      )}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <BarChart3 className="h-6 w-6 text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">{stat.title}</p>
                      <p className="text-6xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-bold text-emerald-700">{stat.change}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">bu ay</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Hızlı Erişim
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const colors = [
                  {
                    bg: 'from-purple-500 via-purple-600 to-purple-700',
                    light: 'from-purple-50 via-purple-50 to-purple-100',
                    border: 'border-purple-200/50',
                    shadow: 'shadow-purple-500/20 hover:shadow-purple-500/40',
                    glow: 'group-hover:shadow-2xl'
                  },
                  {
                    bg: 'from-teal-500 via-teal-600 to-teal-700',
                    light: 'from-teal-50 via-teal-50 to-teal-100',
                    border: 'border-teal-200/50',
                    shadow: 'shadow-teal-500/20 hover:shadow-teal-500/40',
                    glow: 'group-hover:shadow-2xl'
                  },
                  {
                    bg: 'from-emerald-500 via-emerald-600 to-emerald-700',
                    light: 'from-emerald-50 via-emerald-50 to-emerald-100',
                    border: 'border-emerald-200/50',
                    shadow: 'shadow-emerald-500/20 hover:shadow-emerald-500/40',
                    glow: 'group-hover:shadow-2xl'
                  },
                  {
                    bg: 'from-blue-500 via-blue-600 to-blue-700',
                    light: 'from-blue-50 via-blue-50 to-blue-100',
                    border: 'border-blue-200/50',
                    shadow: 'shadow-blue-500/20 hover:shadow-blue-500/40',
                    glow: 'group-hover:shadow-2xl'
                  },
                  {
                    bg: 'from-orange-500 via-orange-600 to-orange-700',
                    light: 'from-orange-50 via-orange-50 to-orange-100',
                    border: 'border-orange-200/50',
                    shadow: 'shadow-orange-500/20 hover:shadow-orange-500/40',
                    glow: 'group-hover:shadow-2xl'
                  },
                  {
                    bg: 'from-rose-500 via-rose-600 to-rose-700',
                    light: 'from-rose-50 via-rose-50 to-rose-100',
                    border: 'border-rose-200/50',
                    shadow: 'shadow-rose-500/20 hover:shadow-rose-500/40',
                    glow: 'group-hover:shadow-2xl'
                  },
                  {
                    bg: 'from-indigo-500 via-indigo-600 to-indigo-700',
                    light: 'from-indigo-50 via-indigo-50 to-indigo-100',
                    border: 'border-indigo-200/50',
                    shadow: 'shadow-indigo-500/20 hover:shadow-indigo-500/40',
                    glow: 'group-hover:shadow-2xl'
                  },
                  {
                    bg: 'from-green-500 via-green-600 to-green-700',
                    light: 'from-green-50 via-green-50 to-green-100',
                    border: 'border-green-200/50',
                    shadow: 'shadow-green-500/20 hover:shadow-green-500/40',
                    glow: 'group-hover:shadow-2xl'
                  },
                ];
                const color = colors[index % colors.length];

                return (
                  <Link
                    key={action.title}
                    to={action.link}
                    className={cn(
                      'group relative bg-gradient-to-br rounded-3xl p-8 border backdrop-blur-sm',
                      'transition-all duration-500 hover:-translate-y-2',
                      'overflow-hidden',
                      color.light,
                      color.border,
                      color.shadow,
                      color.glow
                    )}
                  >
                    {/* Decorative elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none"></div>
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/20 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="relative space-y-8">
                      {/* Icon and Arrow */}
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          'p-5 rounded-2xl shadow-2xl bg-gradient-to-br group-hover:scale-110 group-hover:rotate-6 transition-all duration-500',
                          color.bg
                        )}>
                          <Icon className="h-9 w-9 text-white" />
                        </div>
                        <div className="p-3 rounded-xl bg-white/50 group-hover:bg-white/80 transition-colors">
                          <ArrowRight className="h-5 w-5 text-slate-600 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-slate-600 text-base leading-relaxed">
                          {action.description}
                        </p>
                      </div>

                      {/* CTA Button */}
                      <div className={cn(
                        'inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl bg-gradient-to-r text-white shadow-lg',
                        'group-hover:shadow-xl group-hover:scale-105 transition-all duration-300',
                        color.bg
                      )}>
                        <span>Yönet</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
