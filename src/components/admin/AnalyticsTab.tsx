import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sankey, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useLeadStatuses } from '@/hooks/useLeadStatuses';
import { Tables } from '@/integrations/supabase/types';

type Lead = Tables<'leads'>;

interface SankeyData {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
}

const AnalyticsTab = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { statuses } = useLeadStatuses();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('leads').select('*');
      if (error) {
        console.error('Error fetching leads:', error);
      } else {
        setLeads(data || []);
      }
      setLoading(false);
    };

    fetchLeads();
  }, []);

  const sankeyData: SankeyData = useMemo(() => {
    if (!leads.length || !statuses.length) return { nodes: [], links: [] };

    // A coluna 'source' não existe na tabela. Usaremos um placeholder por enquanto.
    // TODO: Adicionar a coluna 'source' na tabela 'leads' do Supabase.
    const sources = ['Origem Desconhecida'];
    const statusNames = statuses.map(s => s.name);

    const nodes = [...sources.map(name => ({ name })), ...statusNames.map(name => ({ name }))];

    const links: { source: number; target: number; value: number }[] = [];
    const linkMap: { [key: string]: number } = {};

    leads.forEach(lead => {
      const sourceName = 'Origem Desconhecida'; // Placeholder
      const statusInfo = statuses.find(s => s.id === lead.status_id);
      if (!statusInfo) return;

      const sourceIndex = sources.indexOf(sourceName);
      const targetIndex = statuses.findIndex(s => s.id === lead.status_id) + sources.length;

      if (sourceIndex === -1 || targetIndex < sources.length) return;

      const key = `${sourceIndex}-${targetIndex}`;
      if (linkMap[key]) {
        linkMap[key]++;
      } else {
        linkMap[key] = 1;
      }
    });

    Object.keys(linkMap).forEach(key => {
      const [source, target] = key.split('-').map(Number);
      links.push({ source, target, value: linkMap[key] });
    });

    return { nodes, links };
  }, [leads, statuses]);

  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    statuses.forEach(s => (counts[s.name] = 0));
    leads.forEach(lead => {
      const statusInfo = statuses.find(s => s.id === lead.status_id);
      if (statusInfo) {
        counts[statusInfo.name]++;
      }
    });
    return counts;
  }, [leads, statuses]);

  if (loading) {
    return <div className="text-center py-8">Carregando dados de analytics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(statusCounts).map(([statusName, count]) => (
          <Card key={statusName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{statusName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão por Origem</CardTitle>
        </CardHeader>
        <CardContent style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <Sankey
              data={sankeyData}
              nodePadding={50}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <Tooltip />
            </Sankey>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
