import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';
// Remove unused import - use string instead

export interface AIResponse {
  text: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

class AIService {
  private openaiClient: OpenAI | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;
  private currentProvider: string = 'none';
  private initialized = false;

  private async initializeClients() {
    try {
      // Get settings from localStorage since we don't have a settings table
      const data = JSON.parse(localStorage.getItem('aiSettings') || '{}');

      if (!data) return;

      this.currentProvider = data.activeProvider || 'none';

      // Initialize OpenAI client
      if (data.openaiApiKey?.trim()) {
        this.openaiClient = new OpenAI({
          apiKey: data.openaiApiKey.trim(),
          dangerouslyAllowBrowser: true
        });
      }

      // Initialize Gemini client
      if (data.geminiApiKey?.trim()) {
        this.geminiClient = new GoogleGenerativeAI(data.geminiApiKey.trim());
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing AI clients:', error);
      throw new Error('Falha ao inicializar clientes de IA');
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeClients();
    }
  }

  public async generateText(
    prompt: string, 
    options: GenerateOptions = {}
  ): Promise<AIResponse> {
    await this.ensureInitialized();

    if (this.currentProvider === 'none') {
      throw new Error('Nenhum provedor de IA configurado. Configure nas Ajustes.');
    }

    const {
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt
    } = options;

    try {
      if (this.currentProvider === 'openai' && this.openaiClient) {
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
        
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        
        messages.push({ role: 'user', content: prompt });

        const response = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: maxTokens,
          temperature,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Resposta vazia da OpenAI');
        }

        return {
          text: content,
          usage: {
            prompt_tokens: response.usage?.prompt_tokens,
            completion_tokens: response.usage?.completion_tokens,
            total_tokens: response.usage?.total_tokens,
          }
        };
      }

      if (this.currentProvider === 'gemini' && this.geminiClient) {
        const model = this.geminiClient.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature,
          }
        });

        const fullPrompt = systemPrompt 
          ? `${systemPrompt}\n\nUsuário: ${prompt}`
          : prompt;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Resposta vazia do Gemini');
        }

        return {
          text,
          usage: {
            prompt_tokens: result.response.usageMetadata?.promptTokenCount,
            completion_tokens: result.response.usageMetadata?.candidatesTokenCount,
            total_tokens: result.response.usageMetadata?.totalTokenCount,
          }
        };
      }

      throw new Error(`Provedor de IA '${this.currentProvider}' não configurado corretamente`);

    } catch (error) {
      console.error('AI Generation Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Chave de API inválida. Verifique as configurações.');
        }
        if (error.message.includes('quota') || error.message.includes('limit')) {
          throw new Error('Limite de uso da API atingido. Tente novamente mais tarde.');
        }
        throw error;
      }
      
      throw new Error('Erro desconhecido ao gerar texto com IA');
    }
  }

  public async generatePropertyDescription(propertyData: {
    title?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    location?: string;
    price?: number;
    type?: string;
  }): Promise<string> {
    const { title, bedrooms, bathrooms, area, location, price, type } = propertyData;
    
    const systemPrompt = `Você é um especialista em marketing imobiliário. Gere descrições atrativas e profissionais para anúncios de imóveis.

Diretrizes:
- Use linguagem envolvente e persuasiva
- Destaque os benefícios e características únicas
- Mantenha entre 150-300 palavras
- Use formato em parágrafos, não em lista
- Inclua call-to-action sutil
- Seja realista e não exagere`;

    const prompt = `Gere uma descrição atrativa para este imóvel:

${title ? `Título: ${title}` : ''}
${type ? `Tipo: ${type}` : ''}
${bedrooms ? `Quartos: ${bedrooms}` : ''}
${bathrooms ? `Banheiros: ${bathrooms}` : ''}
${area ? `Área: ${area}m²` : ''}
${location ? `Localização: ${location}` : ''}
${price ? `Preço: R$ ${price.toLocaleString('pt-BR')}` : ''}

Crie uma descrição que desperte o interesse de potenciais compradores.`;

    const response = await this.generateText(prompt, {
      systemPrompt,
      temperature: 0.8,
      maxTokens: 500
    });

    return response.text;
  }

  public async generateLeadMessage(leadData: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    property?: {
      title?: string;
      location?: string;
      price?: number;
      bedrooms?: number;
    };
  }, messageType: 'initial' | 'follow_up' | 'visit_scheduling' = 'initial'): Promise<string> {
    const { name, property } = leadData;
    
    const systemPrompt = `Você é um corretor de imóveis experiente e profissional. Gere mensagens personalizadas para WhatsApp que sejam:

- Amigáveis e profissionais
- Personalizadas com o nome do cliente
- Específicas sobre o imóvel de interesse
- Que incluam call-to-action apropriado
- Entre 100-200 palavras
- Em tom conversacional mas respeitoso`;

    let prompt = '';
    const clientName = name || 'cliente';
    
    switch (messageType) {
      case 'initial':
        prompt = `Gere uma mensagem de primeiro contato para ${clientName} que demonstrou interesse ${property?.title ? `no imóvel "${property.title}"` : 'em um de nossos imóveis'}${property?.location ? ` localizado em ${property.location}` : ''}.

${property ? `Detalhes do imóvel:
${property.title ? `- ${property.title}` : ''}
${property.location ? `- Localização: ${property.location}` : ''}
${property.bedrooms ? `- Quartos: ${property.bedrooms}` : ''}
${property.price ? `- Preço: R$ ${property.price.toLocaleString('pt-BR')}` : ''}` : ''}

A mensagem deve ser calorosa, apresentar-se como corretor, e oferecer ajuda ou agendamento de visita.`;
        break;
        
      case 'follow_up':
        prompt = `Gere uma mensagem de follow-up para ${clientName}. Esta é uma segunda tentativa de contato, então seja um pouco mais direto mas ainda amigável. Mencione que você está disponível para esclarecer dúvidas ou agendar uma visita.`;
        break;
        
      case 'visit_scheduling':
        prompt = `Gere uma mensagem para ${clientName} focada em agendamento de visita${property?.title ? ` para o imóvel "${property.title}"` : ''}. Ofereça flexibilidade de horários e destaque os benefícios de uma visita presencial.`;
        break;
    }

    const response = await this.generateText(prompt, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 300
    });

    return response.text;
  }

  public async convertNaturalLanguageToSQL(
    query: string,
    availableTables: Record<string, string[]>
  ): Promise<string> {
    const systemPrompt = `Você é um especialista em SQL que converte perguntas em linguagem natural para consultas SQL seguras.

REGRAS CRÍTICAS DE SEGURANÇA:
- APENAS consultas SELECT são permitidas
- NÃO use DELETE, UPDATE, INSERT, DROP, ALTER, CREATE
- Use APENAS as tabelas e colunas fornecidas
- Sempre use LIMIT para evitar consultas muito grandes
- Use aspas simples para strings
- Formate datas como 'YYYY-MM-DD'

TABELAS E COLUNAS DISPONÍVEIS:
${Object.entries(availableTables).map(([table, columns]) => 
  `${table}: ${columns.join(', ')}`
).join('\n')}

Responda APENAS com a consulta SQL, sem explicações adicionais.`;

    const prompt = `Converta esta pergunta em SQL: "${query}"

Exemplos de conversões:
- "leads ativos" → SELECT * FROM leads WHERE status = 'ativo' LIMIT 10
- "imóveis em São Paulo" → SELECT * FROM properties WHERE location ILIKE '%São Paulo%' LIMIT 10
- "leads criados hoje" → SELECT * FROM leads WHERE DATE(created_at) = CURRENT_DATE LIMIT 10`;

    const response = await this.generateText(prompt, {
      systemPrompt,
      temperature: 0.1, // Baixa temperatura para respostas mais consistentes
      maxTokens: 200
    });

    return response.text.trim();
  }

  // Reinitialize clients when settings change
  public async reinitialize() {
    this.initialized = false;
    this.openaiClient = null;
    this.geminiClient = null;
    await this.initializeClients();
  }
}

export const aiService = new AIService();