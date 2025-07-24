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
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
      {isMobile && <AdminBottomNav />}
      {user?.id && <NotificationPopover userId={user.id} />}
    </div>
  );
}
