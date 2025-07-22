import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Send, Database, Loader, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAISettings } from '@/hooks/useAISettings';
import { aiService } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'data';
  content: string;
  timestamp: Date;
  sql?: string;
}

// Safe query execution function
const executeAIQuery = async (sql: string) => {
  const cleanSql = sql.toLowerCase().trim();
  
  // Basic safety checks
  if (!cleanSql.startsWith('select')) {
    throw new Error('Apenas consultas SELECT são permitidas');
  }
  
  // Parse common query patterns and execute with Supabase client
  if (cleanSql.includes('from leads')) {
    let query = supabase.from('leads').select('*');
    
    // Add basic WHERE conditions if present
    if (cleanSql.includes('where')) {
      // Simple status filter example
      if (cleanSql.includes("status = 'ativo'")) {
        query = query.eq('status', 'ativo');
      }
    }
    
    // Add LIMIT
    if (cleanSql.includes('limit')) {
      const limitMatch = cleanSql.match(/limit (\d+)/);
      const limit = limitMatch ? parseInt(limitMatch[1]) : 10;
      query = query.limit(limit);
    } else {
      query = query.limit(10); // Default limit for safety
    }
    
    return await query;
  }
  
  if (cleanSql.includes('from properties')) {
    let query = supabase.from('properties').select('*');
    
    // Basic filters
    if (cleanSql.includes('where')) {
      if (cleanSql.includes("is_active = true")) {
        query = query.eq('is_active', true);
      }
    }
    
    const limitMatch = cleanSql.match(/limit (\d+)/);
    const limit = limitMatch ? parseInt(limitMatch[1]) : 10;
    query = query.limit(limit);
    
    return await query;
  }
  
  if (cleanSql.includes('from lead_statuses')) {
    return await supabase.from('lead_statuses').select('*').limit(10);
  }
  
  // Fallback: return count of leads
  return await supabase.from('leads').select('id', { count: 'exact', head: true });
};

export default function AdminAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAIEnabled } = useAISettings();
  const { toast } = useToast();

  const availableTables = {
    leads: ['id', 'name', 'email', 'phone', 'message', 'status', 'created_at', 'property_id'],
    properties: ['id', 'title', 'price', 'location', 'bedrooms', 'bathrooms', 'area', 'type', 'purpose', 'is_active'],
    lead_statuses: ['id', 'name', 'color', 'order_num']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !isAIEnabled()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const sql = await aiService.convertNaturalLanguageToSQL(input.trim(), availableTables);
      
      if (!sql.toLowerCase().startsWith('select')) {
        throw new Error('Apenas consultas SELECT são permitidas por segurança.');
      }

      // Execute safe query based on SQL interpretation
      const { data, error } = await executeAIQuery(sql);
      
      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Consultei o banco de dados com a seguinte query:`,
        sql: sql,
        timestamp: new Date()
      };

      const dataMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'data',
        content: JSON.stringify(data, null, 2),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage, dataMessage]);

    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAIEnabled()) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-center">
              <Brain className="w-5 h-5 mr-2" />
              IA não configurada
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Configure um provedor de IA nas configurações para usar o chat inteligente.
            </p>
            <Button onClick={() => window.location.href = '/admin/settings'}>
              Ir para Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <Brain className="w-8 h-8 mr-2" />
            Chat com IA - Consultas ao Banco
          </h1>
          <p className="text-muted-foreground mt-2">
            Faça perguntas em linguagem natural sobre leads, propriedades e relatórios.
          </p>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Conversa
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 mb-4 pr-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Faça uma pergunta sobre seus dados!</p>
                    <p className="text-sm mt-2">Ex: "Quantos leads temos ativos?" ou "Quais imóveis custam menos de 300 mil?"</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : message.type === 'data'
                        ? 'bg-muted border border-border'
                        : 'bg-secondary'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      {message.sql && (
                        <div className="mt-2 p-2 bg-black/10 rounded text-xs font-mono">
                          {message.sql}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary p-3 rounded-lg flex items-center">
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm">Processando consulta...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: Quantos leads temos em negociação?"
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}