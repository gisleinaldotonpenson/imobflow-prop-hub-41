import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MessageCircle, Copy, Send } from 'lucide-react';
import { useWhatsAppTemplates, type WhatsAppTemplate } from '@/hooks/useWhatsAppTemplates';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName?: string;
  propertyData?: {
    title: string;
    location: string;
    price: string;
    area: string;
    bedrooms: string;
    bathrooms: string;
    link: string;
  };
}

export function WhatsAppTemplateModal({
  isOpen,
  onClose,
  leadName = '',
  propertyData
}: WhatsAppTemplateModalProps) {
  const { templates, replaceVariables, sendTemplateMessage, createCustomMessageUrl } = useWhatsAppTemplates();
  const { toast } = useToast();
  
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [previewMessage, setPreviewMessage] = useState('');

  // Initialize variables when template or lead data changes
  useState(() => {
    const initialVars: Record<string, string> = {
      nome: leadName
    };

    if (propertyData) {
      initialVars.titulo = propertyData.title;
      initialVars.localizacao = propertyData.location;
      initialVars.preco = propertyData.price;
      initialVars.area = propertyData.area;
      initialVars.quartos = propertyData.bedrooms;
      initialVars.banheiros = propertyData.bathrooms;
      initialVars.link = propertyData.link;
    }

    setVariables(initialVars);
  });

  // Update preview when template or variables change
  useState(() => {
    if (selectedTemplate) {
      const preview = replaceVariables(selectedTemplate.message, variables);
      setPreviewMessage(preview);
    } else {
      setPreviewMessage(customMessage);
    }
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    setCustomMessage('');
  };

  const handleVariableChange = (variableName: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  const handleSendMessage = () => {
    if (selectedTemplate) {
      const success = sendTemplateMessage(selectedTemplate.id, variables);
      if (success) {
        toast({
          title: 'Mensagem enviada!',
          description: 'O WhatsApp foi aberto com a mensagem personalizada.'
        });
        onClose();
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível abrir o WhatsApp. Verifique as configurações.',
          variant: 'destructive'
        });
      }
    } else if (customMessage.trim()) {
      const url = createCustomMessageUrl(customMessage);
      if (url !== '#') {
        window.open(url, '_blank');
        toast({
          title: 'Mensagem enviada!',
          description: 'O WhatsApp foi aberto com sua mensagem personalizada.'
        });
        onClose();
      }
    }
  };

  const handleCopyMessage = async () => {
    const messageToCopy = selectedTemplate ? previewMessage : customMessage;
    try {
      await navigator.clipboard.writeText(messageToCopy);
      toast({
        title: 'Mensagem copiada!',
        description: 'A mensagem foi copiada para a área de transferência.'
      });
    } catch (error) {
      console.error('Failed to copy message:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar a mensagem.',
        variant: 'destructive'
      });
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setCustomMessage('');
    setVariables({});
    setPreviewMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            Enviar Mensagem WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template-select">Escolher Template</Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template ou escreva uma mensagem personalizada" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Variables */}
          {selectedTemplate && (
            <div className="space-y-4">
              <Label>Personalizar Variáveis</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable} className="space-y-1">
                    <Label htmlFor={variable} className="text-sm capitalize">
                      {variable === 'nome' ? 'Nome' :
                       variable === 'titulo' ? 'Título do Imóvel' :
                       variable === 'localizacao' ? 'Localização' :
                       variable === 'preco' ? 'Preço' :
                       variable === 'area' ? 'Área' :
                       variable === 'quartos' ? 'Quartos' :
                       variable === 'banheiros' ? 'Banheiros' :
                       variable === 'link' ? 'Link' :
                       variable}
                    </Label>
                    <Input
                      id={variable}
                      value={variables[variable] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      placeholder={`Digite ${variable}...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Message */}
          {!selectedTemplate && (
            <div className="space-y-2">
              <Label htmlFor="custom-message">Mensagem Personalizada</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite sua mensagem personalizada..."
                rows={6}
              />
            </div>
          )}

          {/* Message Preview */}
          <div className="space-y-2">
            <Label>Pré-visualização</Label>
            <div className="p-4 bg-muted rounded-md border min-h-[100px]">
              <div className="whitespace-pre-wrap text-sm">
                {selectedTemplate ? previewMessage : customMessage || 'Digite uma mensagem para ver a pré-visualização...'}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCopyMessage}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!selectedTemplate && !customMessage.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar no WhatsApp
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}