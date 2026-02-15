'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Upload, Image, User, Shield, FolderOpen, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'My Gallery', href: '/gallery', icon: Image },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Protection', href: '/protection', icon: Shield },
  { name: 'Collections', href: '/collections', icon: FolderOpen },
  { name: 'Explore', href: '/explore', icon: Globe },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-1 min-h-0 bg-[#0A4D68]/30 backdrop-blur-md border-r border-white/10">
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-cyan-500 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </aside>
  );
}
