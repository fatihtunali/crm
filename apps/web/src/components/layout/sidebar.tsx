'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Map,
  FileText,
  Calendar,
  CreditCard,
  Receipt,
  BarChart3,
  FolderOpen,
  Settings,
  Webhook,
  ShoppingBag,
  Hotel,
  Car,
  Truck,
  UserCheck,
  Activity,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SubNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: UserPlus,
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    title: 'Suppliers',
    icon: ShoppingBag,
    subItems: [
      {
        title: 'All Suppliers',
        href: '/suppliers',
        icon: ShoppingBag,
      },
      {
        title: 'Hotels',
        href: '/suppliers/hotels',
        icon: Hotel,
      },
      {
        title: 'Transfers',
        href: '/suppliers/transfers',
        icon: Truck,
      },
      {
        title: 'Vehicles',
        href: '/suppliers/vehicles',
        icon: Car,
      },
      {
        title: 'Guides',
        href: '/suppliers/guides',
        icon: UserCheck,
      },
      {
        title: 'Activities',
        href: '/suppliers/activities',
        icon: Activity,
      },
    ],
  },
  {
    title: 'Tours',
    href: '/tours',
    icon: Map,
  },
  {
    title: 'Quotations',
    href: '/quotations',
    icon: FileText,
  },
  {
    title: 'Bookings',
    href: '/bookings',
    icon: Calendar,
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Invoices',
    href: '/invoices',
    icon: Receipt,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Files',
    href: '/files',
    icon: FolderOpen,
  },
  {
    title: 'Webhooks',
    href: '/webhooks',
    icon: Webhook,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const [expandedItems, setExpandedItems] = useState<string[]>(['Suppliers']);

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname?.startsWith(`${fullPath}/`);
  };

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-gradient-to-b from-indigo-600 to-purple-700 shadow-xl">
      <nav className="flex h-full flex-col gap-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.title);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          if (hasSubItems) {
            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    'text-white/90 hover:bg-white/20 hover:text-white hover:shadow-md'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const active = isActive(subItem.href);
                      return (
                        <Link
                          key={subItem.href}
                          href={`/${locale}${subItem.href}`}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                            active
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg transform scale-105'
                              : 'text-white/80 hover:bg-white/20 hover:text-white hover:shadow-md'
                          )}
                        >
                          <SubIcon className="h-4 w-4" />
                          {subItem.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = item.href ? isActive(item.href) : false;

          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg transform scale-105'
                  : 'text-white/90 hover:bg-white/20 hover:text-white hover:shadow-md'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
