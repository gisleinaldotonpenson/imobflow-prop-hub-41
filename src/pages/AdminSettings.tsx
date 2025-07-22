import { useMemo, useState } from 'react';
import { useLeadStatuses, type LeadStatus } from '@/hooks/useLeadStatuses';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { useAISettings } from '@/hooks/useAISettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, PlusCircle, Trash2, Settings, MessageCircle, Phone, Brain, Key, Sparkles } from 'lucide-react';
import { StatusForm } from '@/components/admin/StatusForm';
import { useToast } from '@/components/ui/use-toast';

export function AdminSettings() {
  const { statuses, loading, createStatus, updateStatus, deleteStatus } = useLeadStatuses();
  const { settings, loading: whatsappLoading, updateWhatsAppNumber, getFormattedNumber } = useWhatsAppSettings();
  const { settings: aiSettings, loading: aiLoading, updateAISettings, isAIEnabled } = useAISettings();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<LeadStatus | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [activeProvider, setActiveProvider] = useState<'none' | 'openai' | 'gemini'>('none');

  const sortedStatuses = useMemo(() => {
    if (!statuses) return [];
    return [...statuses].sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0));
  }, [statuses]);

  const handleSubmit = async (data: { name: string; color: string; order_num: number }) => {
    setIsSubmitting(true);
    try {
      if (selectedStatus) {
        await updateStatus(selectedStatus.id, data);
      } else {
        await createStatus(data);
      }
      toast({ title: selectedStatus ? 'Etapa atualizada!' : 'Nova etapa criada!' });
      setIsModalOpen(false);
    } catch (error) {
      toast({ title: 'Erro ao salvar etapa', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppUpdate = async () => {
    if (!whatsappNumber.trim()) {
      toast({ title: 'Erro', description: 'Por favor, insira um número válido', variant: 'destructive' });
      return;
    }
    
    const success = await updateWhatsAppNumber(whatsappNumber);
    if (success) {
      setWhatsappNumber('');
    }
  };

  const handleAISettingsUpdate = async () => {
    const success = await updateAISettings({
      openai_api_key: openaiKey.trim() || undefined,
      gemini_api_key: geminiKey.trim() || undefined,
      active_ai_provider: activeProvider
    });
    
    if (success) {
      setOpenaiKey('');
      setGeminiKey('');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <Settings className="w-8 h-8 mr-2 text-primary" /> Ajustes
      </h1>
      
      {/* WhatsApp Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            Configuração do WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-number">Número Atual</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono">
                  {whatsappLoading ? 'Carregando...' : (getFormattedNumber() || 'Não configurado')}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-number">Novo Número</Label>
              <div className="flex gap-2">
                <Input
                  id="new-number"
                  type="tel"
                  placeholder="Ex: 5511999999999"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="font-mono"
                />
                <Button onClick={handleWhatsAppUpdate} variant="outline" size="sm">
                  Atualizar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Digite o número completo com código do país (ex: 5511999999999)
              </p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Como usar:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• O número será usado em todos os botões de WhatsApp do sistema</li>
              <li>• As mensagens serão personalizadas automaticamente</li>
              <li>• Atualizações são aplicadas em tempo real</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            Configurações de IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="flex items-center">
                  <Key className="w-4 h-4 mr-1" />
                  Chave OpenAI
                </Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {aiSettings.openai_api_key ? '✓ Configurada' : 'Não configurada'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gemini-key" className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Chave Gemini
                </Label>
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="AIza..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {aiSettings.gemini_api_key ? '✓ Configurada' : 'Não configurada'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Provedor Ativo</Label>
                <Select value={activeProvider} onValueChange={(value: 'none' | 'openai' | 'gemini') => setActiveProvider(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Status: {isAIEnabled() ? '🟢 Ativo' : '🔴 Inativo'}
                </p>
              </div>
              
              <Button 
                onClick={handleAISettingsUpdate} 
                variant="outline" 
                size="sm"
                disabled={aiLoading}
                className="w-full"
              >
                {aiLoading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Recursos Disponíveis com IA:</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Geração automática de descrições de imóveis</li>
              <li>• Mensagens personalizadas para leads</li>
              <li>• Chat inteligente com consulta ao banco de dados</li>
              <li>• Análise de sentimento em conversas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Etapas do Funil (CRM)</CardTitle>
          <Button size="sm" onClick={() => {
            setSelectedStatus(null);
            setIsModalOpen(true);
          }} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Etapa
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando etapas...</p>
          ) : (
            <div className="space-y-4">
              {sortedStatuses.map((status) => (
                <div key={status.id} className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: status.color || '#ccc' }}
                    />
                    <span className="font-medium text-primary">{status.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedStatus(status);
                      setIsModalOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setStatusToDelete(status)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStatus ? 'Editar Etapa' : 'Nova Etapa'}</DialogTitle>
          </DialogHeader>
          <StatusForm
            status={selectedStatus}
            isSubmitting={isSubmitting}
            onCancel={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!statusToDelete} onOpenChange={(open) => !open && setStatusToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a etapa "{statusToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!statusToDelete) return;
                try {
                  await deleteStatus(statusToDelete.id);
                  toast({ title: 'Sucesso', description: 'Etapa excluída.' });
                } catch (error) {
                  console.error('Failed to delete status:', error);
                  toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a etapa.' });
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
