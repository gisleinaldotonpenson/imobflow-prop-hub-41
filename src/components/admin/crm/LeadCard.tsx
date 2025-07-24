import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreVertical, Eye, Edit, Trash2, Phone, Mail, Clock, MessageSquare, Home, MessageCircle, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { useAISettings } from '@/hooks/useAISettings';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import type { EnrichedLead } from '@/types/crm';

// Advanced liquid glass effect styles
const liquidGlassEffect = `
  .lead-card {
    position: relative;
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(12px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 0.75rem;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  }
  
  .lead-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.6) 0%,
      rgba(255, 255, 255, 0.2) 100%
    );
    z-index: 1;
    opacity: 0.6;
    transition: opacity 0.3s ease;
  }
  
  .lead-card::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to bottom right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(30deg);
    z-index: 2;
    opacity: 0;
    transition: opacity 0.6s ease, transform 0.6s ease;
    pointer-events: none;
  }
  
  .lead-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .lead-card:hover::after {
    opacity: 1;
    transform: translateX(100%) rotate(30deg);
  }
  
  .lead-card-content {
    position: relative;
    z-index: 3;
  }
`;

interface LeadCardProps {
  lead: EnrichedLead;
  onSelectLead?: (lead: EnrichedLead) => void;
  onEdit?: (lead: EnrichedLead) => void;
  onDelete?: (leadId: string) => void;
}

export function LeadCard({ lead, onSelectLead, onEdit, onDelete }: LeadCardProps) {
  const { createWhatsAppUrl } = useWhatsAppSettings();
  const { isAIEnabled } = useAISettings();
  const { toast } = useToast();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: lead.id, 
    data: { 
      type: 'Lead', 
      lead 
    } 
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition as string),
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  const timeInStage = lead.updated_at 
    ? formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true, locale: ptBR })
    : 'N/A';
    
  // Default values for optional fields
  // Remove source and notes from display
  const leadProperty = 'property' in lead ? (lead as any).property : null;

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectLead) {
      onSelectLead(lead);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(lead);
    } else {
      console.log('Edit lead:', lead);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(lead.id);
    } else {
      console.log('Delete lead:', lead.id);
    }
  };
  
  // Format phone number if needed
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const handleWhatsApp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lead.phone) {
      toast({
        title: 'Telefone não encontrado',
        description: 'Este lead não possui número de telefone cadastrado.',
        variant: 'destructive'
      });
      return;
    }

    let message = `Olá ${lead.name}! Somos da nossa imobiliária e vimos seu interesse. `;
    
    if (isAIEnabled) {
      try {
        message = await aiService.generateLeadMessage({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          message: lead.message
        }, 'initial');
      } catch (error) {
        console.warn('Failed to generate AI message, using fallback');
      }
    }

    const whatsappUrl = createWhatsAppUrl(message);
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: 'WhatsApp aberto!',
      description: 'Mensagem pré-preenchida enviada para o WhatsApp.'
    });
  };

  const handleAIMessage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAIEnabled) {
      toast({
        title: 'IA não configurada',
        description: 'Configure a IA nas configurações para gerar mensagens.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const message = await aiService.generateLeadMessage({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message
      }, 'initial');

      navigator.clipboard.writeText(message);
      toast({
        title: 'Mensagem gerada!',
        description: 'Mensagem copiada para área de transferência.'
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar mensagem',
        description: 'Não foi possível gerar a mensagem com IA.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: liquidGlassEffect }} />
      <Card 
        ref={setNodeRef} 
        style={{
          ...style,
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
          overflow: 'visible',
        }}
        className="lead-card group"
        {...attributes}
        {...listeners}
        onClick={handleView}
      >
        <div className="lead-card-content">
          <CardHeader className="relative p-4 pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {formatDistanceToNow(new Date(lead.created_at || new Date()), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
                <h4 className="text-base font-semibold mt-2 text-foreground line-clamp-1">
                  {lead.name || 'Lead sem nome'}
                </h4>
                <div className="mt-2 space-y-1">
                  {lead.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 opacity-70" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 opacity-70" />
                      <span className="truncate">{formatPhoneNumber(lead.phone)}</span>
                    </div>
                  )}
                  {leadProperty && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Home className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 opacity-70" />
                      <span className="truncate">
                        {(leadProperty as any)?.title || 'Imóvel não especificado'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex items-center gap-2">
                  {lead.phone && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleWhatsApp}
                      className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      WhatsApp
                    </Button>
                  )}
                  
                  {isAIEnabled && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAIMessage}
                      className="h-7 px-2 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      IA
                    </Button>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 -mt-1 -mr-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/80 hover:bg-white backdrop-blur-sm border border-border/50 shadow-sm hover:shadow"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                    <span className="sr-only">Mais opções</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-white/95 backdrop-blur-sm border border-border shadow-lg rounded-lg overflow-hidden"
                  sideOffset={8}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem 
                    onClick={handleView}
                    className="flex items-center cursor-pointer px-3 py-2 text-sm focus:bg-accent/50"
                  >
                    <Eye className="h-3.5 w-3.5 mr-2 opacity-70" />
                    Ver detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleEdit}
                    className="flex items-center cursor-pointer px-3 py-2 text-sm focus:bg-accent/50"
                  >
                    <Edit className="h-3.5 w-3.5 mr-2 opacity-70" />
                    Editar lead
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="flex items-center cursor-pointer px-3 py-2 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Excluir lead
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                <div 
                  className="h-2 w-2 rounded-full flex-shrink-0" 
                  style={{ 
                    backgroundColor: lead.status?.color || '#6b7280',
                    boxShadow: `0 0 8px ${lead.status?.color || '#6b7280'}80`
                  }}
                />
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {lead.status?.name || 'Sem status'}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                <span>{timeInStage}</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </>
  );
}
