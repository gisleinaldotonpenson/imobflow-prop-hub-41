import { useWhatsAppSettings } from './useWhatsAppSettings';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  variables: string[];
}

export const DEFAULT_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'first_contact',
    name: 'Primeiro Contato',
    message: 'Olá {nome}! Obrigado pelo seu interesse. Estou aqui para ajudá-lo a encontrar o imóvel ideal. Como posso ajudá-lo?',
    variables: ['nome']
  },
  {
    id: 'property_interest',
    name: 'Interesse em Imóvel',
    message: 'Olá {nome}! Vi que você demonstrou interesse no imóvel "{titulo}" em {localizacao}. Gostaria de agendar uma visita ou tirar alguma dúvida?',
    variables: ['nome', 'titulo', 'localizacao']
  },
  {
    id: 'visit_scheduling',
    name: 'Agendamento de Visita',
    message: 'Oi {nome}! Que tal agendarmos uma visita ao imóvel? Tenho disponibilidade hoje à tarde ou amanhã de manhã. Qual horário funciona melhor para você?',
    variables: ['nome']
  },
  {
    id: 'follow_up',
    name: 'Follow-up',
    message: 'Olá {nome}! Como você está? Gostaria de saber se ainda tem interesse no imóvel que conversamos. Se precisar de mais informações, estou à disposição!',
    variables: ['nome']
  },
  {
    id: 'property_details',
    name: 'Detalhes do Imóvel',
    message: `Olá {nome}! Aqui estão os detalhes completos do imóvel:

🏠 *{titulo}*
📍 {localizacao}
💰 {preco}
📐 {area}m²
🛏️ {quartos} quartos
🚿 {banheiros} banheiros

🔗 Link para visualização: {link}

Gostaria de mais informações ou agendar uma visita?`,
    variables: ['nome', 'titulo', 'localizacao', 'preco', 'area', 'quartos', 'banheiros', 'link']
  }
];

export function useWhatsAppTemplates() {
  const { createWhatsAppUrl } = useWhatsAppSettings();

  // Replace variables in template message
  const replaceVariables = (template: string, variables: Record<string, string>): string => {
    let message = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      message = message.replace(regex, value || `{${key}}`);
    });
    return message;
  };

  // Create WhatsApp URL with template
  const createTemplateUrl = (
    templateId: string, 
    variables: Record<string, string> = {}
  ): string => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return '#';
    
    const message = replaceVariables(template.message, variables);
    return createWhatsAppUrl(message);
  };

  // Send message using template
  const sendTemplateMessage = (
    templateId: string,
    variables: Record<string, string> = {},
    openInNewTab: boolean = true
  ): boolean => {
    const url = createTemplateUrl(templateId, variables);
    if (url === '#') return false;
    
    if (openInNewTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
    return true;
  };

  // Create custom message URL
  const createCustomMessageUrl = (message: string): string => {
    return createWhatsAppUrl(message);
  };

  return {
    templates: DEFAULT_TEMPLATES,
    replaceVariables,
    createTemplateUrl,
    sendTemplateMessage,
    createCustomMessageUrl
  };
}