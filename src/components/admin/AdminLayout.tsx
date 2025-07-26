import { NotificationPopover } from '@/components/admin/NotificationPopover';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '@/components/AdminHeader';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout() {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AdminHeader />
      <div className="flex flex-col gap-2 sm:gap-4 py-2 sm:py-4">
        <main className="flex-1 px-3 sm:px-6 pb-20 md:pb-4">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      {isMobile && <AdminBottomNav />}
      {user?.id && <NotificationPopover userId={user.id} />}
    </div>
  );
}
