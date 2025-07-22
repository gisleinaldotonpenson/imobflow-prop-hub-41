import { Activity, CreditCard, DollarSign, Download, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { NotificationPopover } from '@/components/admin/NotificationPopover';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';


export default function AdminDashboard() {
  const isMobile = useIsMobile();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const { notifications, markAsRead } = useNotifications(userId);

  return (
    <>

      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 p-8 pt-6 bg-gradient-to-br from-primary/5 to-background">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center">
              <Activity className="w-8 h-8 mr-2 text-primary" /> Dashboard
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <DateRangePicker date={date} onDateChange={setDate} />
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>

            </div>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-primary/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-foreground hover:text-foreground">Visão Geral</TabsTrigger>
              <TabsTrigger value="analytics" className="hover:text-foreground">Analytics</TabsTrigger>
              <TabsTrigger value="reports" className="hover:text-foreground">Relatórios</TabsTrigger>
              <TabsTrigger value="notifications" className="hover:text-foreground">Notificações ({notifications.filter(n => !n.is_read).length})</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-md border-primary/10">
                  <CardHeader className="pb-2 bg-primary/5">
                    <CardTitle className="text-sm font-medium text-primary flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" /> Receita Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 45.231,89</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% do último mês
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-md border-primary/10">
                  <CardHeader className="pb-2 bg-primary/5">
                    <CardTitle className="text-sm font-medium text-primary flex items-center">
                      <Users className="w-4 h-4 mr-1" /> Novos Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground">
                      +180.1% do último mês
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-md border-primary/10">
                  <CardHeader className="pb-2 bg-primary/5">
                    <CardTitle className="text-sm font-medium text-primary flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" /> Vendas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-muted-foreground">
                      +19% do último mês
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-md border-primary/10">
                  <CardHeader className="pb-2 bg-primary/5">
                    <CardTitle className="text-sm font-medium text-primary flex items-center">
                      <Activity className="w-4 h-4 mr-1" /> Ativos Agora
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">
                      +201 desde a última hora
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Resumo</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Gráfico de resumo em desenvolvimento</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Vendas Recentes</CardTitle>
                    <CardDescription>
                      Você fez 265 vendas este mês.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Lista de vendas em desenvolvimento</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <AnalyticsTab />
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>Relatórios em desenvolvimento</p>
              </div>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notificações</CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b ${notif.is_read ? 'bg-muted/50' : ''}`}>
                      <h4>{notif.title}</h4>
                      <p>{notif.description}</p>
                      {!notif.is_read && <Button onClick={() => markAsRead(notif.id)}>Marcar como lido</Button>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {isMobile && <AdminBottomNav />}
    </>
  );
}
