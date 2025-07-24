import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAISettings } from '@/hooks/useAISettings';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { aiService } from '@/services/aiService';
import { Wand2, MessageCircle, Loader, Copy, ExternalLink } from 'lucide-react';
import type { EnrichedLead, Property } from '@/types/crm';

interface MessageGeneratorProps {
  lead: EnrichedLead;
  linkedProperty?: Property;
  onActivityAdd: (description: string) => void;
}

export function MessageGenerator({ lead, linkedProperty, onActivityAdd }: MessageGeneratorProps) {
  const [messageType, setMessageType] = useState<'initial' | 'follow_up' | 'visit_scheduling'>('initial');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  
  const { isAIEnabled } = useAISettings();
  const { createWhatsAppUrl } = useWhatsAppSettings();
  const { toast } = useToast();

  const messageTypes = [
    { value: 'initial', label: 'Primeiro Contato' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'visit_scheduling', label: 'Agendamento de Visita' }
  ];

  const generateMessage = async () => {
    if (!isAIEnabled) {
      toast({
        title: 'IA não configurada',
        description: 'Configure um provedor de IA nas configurações.',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);
    try {
      const message = await aiService.generateLeadMessage({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        property: linkedProperty ? {
          title: linkedProperty.title,
          location: linkedProperty.location,
          price: linkedProperty.price,
          bedrooms: linkedProperty.bedrooms
        } : undefined
      }, messageType);

      setGeneratedMessage(message);
      setCustomMessage(message);
      
      toast({
        title: 'Mensagem gerada!',
        description: 'Você pode editar a mensagem antes de enviar.'
      });
    } catch (error) {
      console.error('Error generating message:', error);
      toast({
        title: 'Erro ao gerar mensagem',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const sendWhatsAppMessage = (message: string) => {
    if (!message.trim()) {
      toast({
        title: 'Mensagem vazia',
        description: 'Digite uma mensagem antes de enviar.',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      const whatsappUrl = createWhatsAppUrl(message);
      window.open(whatsappUrl, '_blank');
      
      // Registrar atividade
      const activityDescription = `Mensagem WhatsApp enviada: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`;
      onActivityAdd(activityDescription);
      
      toast({
        title: 'WhatsApp aberto!',
        description: 'A mensagem foi pré-preenchida no WhatsApp.'
      });
    } catch (error) {
      toast({
        title: 'Erro ao abrir WhatsApp',
        description: 'Não foi possível abrir o WhatsApp.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Mensagem copiada para a área de transferência.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          Gerar Mensagem Personalizada
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Tipo de Mensagem</label>
            <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {messageTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateMessage}
            disabled={generating || !isAIEnabled}
            className="w-full"
            variant="outline"
          >
            {generating ? (
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
            <p className="text-xs text-muted-foreground">
              Configure a IA nas configurações para gerar mensagens automáticas.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Mensagem para WhatsApp</h4>
          {customMessage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(customMessage)}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copiar
            </Button>
          )}
        </div>
        
        <Textarea
          placeholder="Digite sua mensagem personalizada ou gere uma com IA..."
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          rows={6}
          className="resize-none"
        />

        <div className="flex gap-2">
          <Button
            onClick={() => sendWhatsAppMessage(customMessage)}
            disabled={!customMessage.trim() || sending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {sending ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            Enviar no WhatsApp
          </Button>
        </div>

        {linkedProperty && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800 font-medium">Imóvel vinculado:</p>
            <p className="text-xs text-blue-700">{linkedProperty.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}