'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Map,
  FileText,
  Calendar,
  CreditCard,
  Receipt,
  BarChart3,
  FolderOpen,
  Settings,
  Webhook,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
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
    title: 'Vendors',
    href: '/vendors',
    icon: Building2,
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

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname?.startsWith(`${fullPath}/`);
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-gradient-to-b from-indigo-600 to-purple-700 shadow-xl">
      <nav className="flex h-full flex-col gap-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

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
