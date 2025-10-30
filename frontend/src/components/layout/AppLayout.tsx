import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Hotel,
  Car,
  Users,
  DollarSign,
  Settings,
  Menu,
  X,
  LogOut,
  MapPin,
  Building2,
  User,
  Truck,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { cn } from '../../lib/utils';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/reservations', label: 'Rezervasyonlar', icon: Calendar },
    { path: '/resources', label: 'Kaynaklar', icon: Building2, badge: 'Yeni' },
    { path: '/customers', label: 'Müşteriler', icon: Users },
    { path: '/finance', label: 'Finans', icon: DollarSign },
    { path: '/settings', label: 'Ayarlar', icon: Settings },
  ];

  const resourcesSubItems = [
    { path: '/resources/hotels', label: 'Oteller', icon: Hotel },
    { path: '/resources/vehicle-suppliers', label: 'Araç Tedarikçileri', icon: Truck },
    { path: '/resources/vehicles', label: 'Kendi Filomuz', icon: Car },
    { path: '/resources/guides', label: 'Rehberler', icon: User },
    { path: '/resources/suppliers', label: 'Tedarikçiler', icon: MapPin },
    { path: '/entrance-fees', label: 'Giriş Ücretleri', icon: Building2 },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'border-r bg-card transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Toggle */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            {sidebarOpen && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Tour CRM
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 hover:bg-accent transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isResourcesActive = item.path === '/resources' && location.pathname.startsWith('/resources');

                return (
                  <div key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        isActive || isResourcesActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>

                    {/* Resources Submenu */}
                    {item.path === '/resources' && sidebarOpen && isResourcesActive && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
                        {resourcesSubItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = location.pathname === subItem.path;

                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                                isSubActive
                                  ? 'bg-accent font-medium text-foreground'
                                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                              )}
                            >
                              <SubIcon className="h-4 w-4" />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* User Menu */}
          <div className="border-t p-4">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Çıkış Yap"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full rounded-lg p-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="h-5 w-5 mx-auto" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
