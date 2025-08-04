'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { clearAdminAuth, getAdminUser } from '~/utils/adminAuth';
import { Button } from '~/components/ui/button';
import { 
  Home, 
  Calendar, 
  PlusCircle, 
  Users, 
  BarChart3, 
  LogOut,
  Settings 
} from 'lucide-react';
import { cn } from '~/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/events/new', label: 'New Event', icon: PlusCircle },
  { href: '/admin/markets', label: 'Markets', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const adminUser = getAdminUser();

  const handleLogout = () => {
    clearAdminAuth();
    router.push('/admin/login');
  };

  return (
    <nav className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold">
              Prediq Admin
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {adminUser?.name || adminUser?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}