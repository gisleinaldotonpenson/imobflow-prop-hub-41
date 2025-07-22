import { Activity, CreditCard, DollarSign, Download, Users, Building, TrendingUp } from 'lucide-react';
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
import { useProperties } from '@/hooks/useProperties';
import { useLeads } from '@/hooks/useLeads';


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
  const { properties } = useProperties();
  const { leads } = useLeads();

  // Calculate total property value
  const totalPropertyValue = properties.reduce((total, property) => total + property.price, 0);
  
  // Calculate leads in negotiation (using 'negotiation' status)
  const leadsInNegotiation = leads.filter(lead => lead.status === 'negotiation').length;
  
  // Get recent leads (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentLeads = leads.filter(lead => 
    new Date(lead.created_at || '') > thirtyDaysAgo
  ).slice(0, 5);

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
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-md border-primary/10">
                  <CardHeader className="pb-2 bg-primary/5">
                    <CardTitle className="text-sm font-medium text-primary flex items-center">
                      <Building className="w-4 h-4 mr-1" /> Valor Total dos Imóveis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(totalPropertyValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {properties.length} imóveis ativos
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-md border-primary/10">
                  <CardHeader className="pb-2 bg-primary/5">
                    <CardTitle className="text-sm font-medium text-primary flex items-center">
                      <Users className="w-4 h-4 mr-1" /> Novos Clientes (CRM)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+{recentLeads.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Últimos 30 dias
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-md border-primary/10">
                  <CardHeader className="pb-2 bg-primary/5">
                    <CardTitle className="text-sm font-medium text-primary flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" /> Leads em Negociação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{leadsInNegotiation}</div>
                    <p className="text-xs text-muted-foreground">
                      Status: Negociação
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
                    <CardTitle>Leads Recentes</CardTitle>
                    <CardDescription>
                      Novos leads que entraram no sistema.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentLeads.length > 0 ? recentLeads.map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                          <div className="text-xs text-right">
                            <p className="font-medium">{lead.status}</p>
                            <p className="text-muted-foreground">
                              {new Date(lead.created_at || '').toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>Nenhum lead recente</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {isMobile && <AdminBottomNav />}
    </>
  );
}
