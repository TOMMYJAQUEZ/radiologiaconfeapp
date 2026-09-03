'use client';

import Link from 'next/link';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './NotificationCenter';
import RoleSwitcher from './RoleSwitcher';

export default function Header({ 
  userName = 'Usuario', 
  role = 'STUDENT',
  actualRole = 'STUDENT',
  isSimulating = false,
  avatarUrl = null
}: { 
  userName?: string
  role?: string
  actualRole?: string
  isSimulating?: boolean
  avatarUrl?: string | null
}) {
  const roleDisplay = role === 'TEACHER' ? 'Maestro' : role === 'ADMIN' ? 'Director General' : 'Estudiante';

  return (
    <header className="h-20 bg-[#0a1122] border-b border-[#1e293b] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Component */}
      <GlobalSearch />

      {/* Spacer for mobile */}
      <div className="md:hidden"></div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Role Switcher (Visible para Director) */}
        {actualRole === 'ADMIN' && (
          <RoleSwitcher
            actualRole={actualRole}
            currentRole={role}
            isSimulating={isSimulating}
          />
        )}

        {/* Notification Center */}
        <NotificationCenter />

        {/* Profile Link */}
        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-brand-border hover:opacity-90 transition-opacity"
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-white">{userName}</span>
            <span className="text-xs text-brand-accent font-medium">{roleDisplay}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent overflow-hidden font-bold">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span>{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}


