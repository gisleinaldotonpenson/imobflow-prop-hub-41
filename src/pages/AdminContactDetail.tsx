import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader, Mail, Phone, User, Tag, Calendar, Plus, MessageSquare, PhoneCall, Calendar as CalendarIcon, FileText, MessageCircle, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { type LeadData } from '@/hooks/useLeads';
import { useLeadStatuses, type LeadStatus } from '@/hooks/useLeadStatuses';
import { useLeadInteractions, type InteractionType } from '@/hooks/useLeadInteractions';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { useAISettings } from '@/hooks/useAISettings';
import { aiService } from '@/services/aiService';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente para exibir uma única interação
const InteractionItem = ({ interaction, formatDate }: { 
  interaction: any, 
  formatDate: (date: string) => string,
}) => {
  const interactionIcons: { [key in InteractionType]: React.ReactNode } = {
    note: <FileText className="h-4 w-4" />,
    call: <PhoneCall className="h-4 w-4" />,
    meeting: <CalendarIcon className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    other: <MessageSquare className="h-4 w-4" />
  };

  const interactionTitles: { [key in InteractionType]: string } = {
    note: 'Nota',
    call: 'Chamada',
    meeting: 'Reunião',
    email: 'E-mail',
    other: 'Outro'
  };

  return (
    <div className="space-y-2 p-4 hover:bg-muted/50 rounded-md transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            {interactionIcons[interaction.type as InteractionType] || interactionIcons.other}
          </div>
          <div>
            <h4 className="font-medium">{interactionTitles[interaction.type as InteractionType] || 'Interação'}</h4>
            <p className="text-xs text-muted-foreground">
              {formatDate(interaction.created_at)} • {interaction.created_by}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(interaction.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          })}
        </span>
      </div>
      <p className="text-sm whitespace-pre-line">{interaction.content}</p>
    </div>
  );
};

// Componente para adicionar uma nova interação
const AddInteractionForm = ({ 
  onAddInteraction, 
  isAdding 
}: { 
  onAddInteraction: (type: InteractionType, content: string) => Promise<void>,
  isAdding: boolean
}) => {
  const [type, setType] = useState<InteractionType>('note');
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    try {
      await onAddInteraction(type, content);
      setContent('');
      setType('note');
      setIsExpanded(false);
    } catch (error) {
      console.error('Erro ao adicionar interação:', error);
    }
  };

  if (!isExpanded) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-4"
        onClick={() => setIsExpanded(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar interação
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="interaction-type" className="text-sm font-medium">Tipo de Interação</label>
            <Select onValueChange={(value) => setType(value as InteractionType)} value={type}>
              <SelectTrigger id="interaction-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Nota</SelectItem>
                <SelectItem value="call">Chamada</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="interaction-content" className="text-sm font-medium">Detalhes</label>
            <Textarea
              id="interaction-content"
              placeholder="Adicione detalhes sobre a interação..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsExpanded(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding && <Loader className="h-4 w-4 mr-2 animate-spin" />} 
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

type EnrichedLead = Omit<LeadData, 'status'> & { status: LeadStatus };

function AdminContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { createWhatsAppUrl } = useWhatsAppSettings();
  const { isAIEnabled } = useAISettings();
  const [lead, setLead] = useState<EnrichedLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const { statuses, loading: loadingStatuses } = useLeadStatuses();
  const { 
    interactions, 
    loading: loadingInteractions, 
    error: interactionsError, 
    addInteraction,
    fetchInteractions
  } = useLeadInteractions(id);

  const fetchLead = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (leadError) {
        console.error('Supabase error fetching lead:', leadError);
        // Display the specific error from Supabase instead of a generic one.
        throw new Error(leadError.message);
      }
      if (!leadData) {
        throw new Error('Lead não encontrado na base de dados.');
      }

      let status = statuses.find(s => s.id === leadData.status_id);
      if (!status && statuses.length > 0) {
        console.warn(`Status com ID "${leadData.status_id}" não encontrado para o lead "${leadData.name}". Usando o primeiro status como padrão.`);
        status = statuses[0]; // Fallback to the first available status
      } else if (!status) {
        throw new Error(`Nenhum status disponível para associar ao lead.`);
      }

      setLead({ ...leadData, status });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, statuses]);

  useEffect(() => {
    if (id && statuses.length > 0) {
      fetchLead();
    }
  }, [id, statuses, fetchLead]);

  const handleStatusChange = async (newStatusId: string) => {
    if (!id || !lead) return;

    const originalStatus = lead.status;
    
    const newStatus = statuses.find(s => s.id === newStatusId);
    if (newStatus) {
        setLead({ ...lead, status: newStatus });
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status_id: newStatusId, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Status atualizado!", description: "O status do lead foi alterado com sucesso." });

    } catch (error) {
      console.error('Falha ao atualizar status:', error);
      toast({ title: "Erro!", description: "Não foi possível atualizar o status.", variant: "destructive" });
      setLead({ ...lead, status: originalStatus });
    }
  };

  const handleAddInteraction = async (type: InteractionType, content: string) => {
    if (!id) return;
    try {
      await addInteraction(type, content);
      toast({ title: 'Interação adicionada', description: 'O histórico do lead foi atualizado.' });
    } catch (error) {
      toast({ 
        title: 'Erro ao adicionar interação', 
        description: 'Não foi possível salvar a nova interação.',
        variant: 'destructive'
      });
    }
  };

  const handleGenerateMessage = async () => {
    if (!isAIEnabled || !lead) {
      toast({
        title: 'IA não configurada',
        description: 'Configure a IA nas configurações para gerar mensagens.',
        variant: 'destructive'
      });
      return;
    }

    setGeneratingMessage(true);
    try {
      const message = await aiService.generateLeadMessage({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message
      }, 'initial');

      setGeneratedMessage(message);
      toast({
        title: 'Mensagem gerada!',
        description: 'Você pode editar a mensagem antes de enviar.'
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar mensagem',
        description: 'Não foi possível gerar a mensagem com IA.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingMessage(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!lead?.phone) {
      toast({
        title: 'Telefone não encontrado',
        description: 'Este lead não possui número de telefone cadastrado.',
        variant: 'destructive'
      });
      return;
    }

    const message = generatedMessage || `Olá ${lead.name}! Somos da nossa imobiliária e vimos seu interesse. Como podemos ajudá-lo?`;
    const whatsappUrl = createWhatsAppUrl(message);
    window.open(whatsappUrl, '_blank');
    
    // Registrar interação
    handleAddInteraction('other', `Mensagem WhatsApp enviada: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    
    toast({
      title: 'WhatsApp aberto!',
      description: 'Mensagem pré-preenchida enviada para o WhatsApp.'
    });
  };

  const formatDate = (date: string) => format(new Date(date), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });

  if (loading && !lead) {
    return <div className="flex justify-center items-center h-screen"><Loader className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/contacts')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:p-6 overflow-auto">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        {lead ? (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{lead.name}</CardTitle>
                      <CardDescription>{lead.email} {lead.phone && `• ${lead.phone}`}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    style={{ 
                      backgroundColor: `${lead.status.color}20`,
                      color: lead.status.color,
                      borderColor: `${lead.status.color}80`
                    }}
                    className="border"
                  >
                    {lead.status.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="my-4" />
                <Tabs defaultValue="details" className="w-full">
                  <TabsList>
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                    <TabsTrigger value="messages">Mensagens</TabsTrigger>
                    <TabsTrigger value="history">Histórico ({interactions.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="mt-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center"><User className="w-4 h-4 mr-2"/>Informações Pessoais</h3>
                          <p><strong>Email:</strong> {lead.email}</p>
                          {lead.phone && <p><strong>Telefone:</strong> {lead.phone}</p>}

                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center"><Tag className="w-4 h-4 mr-2"/>Status</h3>
                          <Select 
                            value={lead.status.id}
                            onValueChange={handleStatusChange}
                            disabled={loadingStatuses}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Mudar status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((status) => (
                                <SelectItem key={status.id} value={status.id}>
                                  {status.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center"><Calendar className="w-4 h-4 mr-2"/>Data de Cadastro</h3>
                          <p>{formatDate(lead.created_at)}</p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center"><Calendar className="w-4 h-4 mr-2"/>Última Atualização</h3>
                           <p>{formatDate(lead.updated_at)}</p>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-2">
                          <h3 className="font-semibold">Ações Rápidas</h3>
                          <div className="flex flex-col gap-2">
                            {lead.phone && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleSendWhatsApp}
                                className="justify-start bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Enviar WhatsApp
                              </Button>
                            )}
                            
                            {lead.email && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="justify-start"
                                onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar Email
                              </Button>
                            )}

                            {lead.phone && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="justify-start"
                                onClick={() => window.open(`tel:${lead.phone}`, '_blank')}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Fazer Ligação
                              </Button>
                            )}
                          </div>
                        </div>
                       </div>
                     </div>
                    
                    {lead.message && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">Observações</h3>
                        <p className="text-muted-foreground whitespace-pre-line">{lead.message}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="messages" className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-green-600" />
                          Gerar Mensagem Personalizada
                        </h3>
                        
                        <Button
                          onClick={handleGenerateMessage}
                          disabled={generatingMessage || !isAIEnabled}
                          className="w-full"
                          variant="outline"
                        >
                          {generatingMessage ? (
                            <>
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                              Gerando mensagem...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Gerar com IA
                            </>
                          )}
                        </Button>

                        {!isAIEnabled && (
                          <p className="text-xs text-muted-foreground text-center">
                            Configure a IA nas configurações para gerar mensagens automáticas.
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Mensagem para WhatsApp</h4>
                        <Textarea
                          placeholder="Digite sua mensagem personalizada ou gere uma com IA..."
                          value={generatedMessage}
                          onChange={(e) => setGeneratedMessage(e.target.value)}
                          rows={6}
                          className="resize-none"
                        />

                        <div className="flex gap-2">
                          <Button
                            onClick={handleSendWhatsApp}
                            disabled={!lead?.phone}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Enviar no WhatsApp
                          </Button>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-xs text-blue-800 font-medium">Informações do contato:</p>
                          <p className="text-xs text-blue-700">
                            {lead?.name} - {lead?.phone || 'Sem telefone'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-4">
                    <AddInteractionForm 
                      onAddInteraction={handleAddInteraction} 
                      isAdding={loadingInteractions} 
                    />
                    
                    {interactionsError ? (
                      <div className="text-center py-8 text-destructive">
                        <p>Erro ao carregar o histórico: {interactionsError}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => fetchInteractions()}
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    ) : loadingInteractions && interactions.length === 0 ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader className="h-6 w-6 animate-spin" />
                      </div>
                    ) : interactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhuma interação registrada ainda.</p>
                        <p className="text-sm">Adicione uma interação para começar o histórico.</p>
                      </div>
                    ) : (
                      <Card>
                        <ScrollArea className="h-[400px]">
                          <div className="divide-y">
                            {interactions.map((interaction) => (
                              <InteractionItem 
                                key={interaction.id} 
                                interaction={interaction} 
                                formatDate={formatDate}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p>Nenhum contato encontrado com o ID fornecido.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/admin/contacts')}
            >
              Voltar para a lista de contatos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContactDetail;
