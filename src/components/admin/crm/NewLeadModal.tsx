import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { LeadInsert } from '@/hooks/useLeads';
import type { LeadStatus } from '@/hooks/useLeadStatuses';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: LeadInsert) => void;
  leadData: Partial<LeadInsert>;
  setLeadData: (data: Partial<LeadInsert>) => void;
  statuses: LeadStatus[];
}

export function NewLeadModal({ isOpen, onClose, onSave, leadData, setLeadData, statuses }: NewLeadModalProps) {
  const handleChange = (field: keyof LeadInsert, value: string | null) => {
    setLeadData({ ...leadData, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-effect">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lead</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" value={leadData.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" value={leadData.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Telefone</Label>
            <Input id="phone" value={leadData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
                        <Select value={leadData.status || ''} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">Notas</Label>
            <Textarea id="message" value={leadData.message || ''} onChange={(e) => handleChange('message', e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={() => onSave(leadData as LeadInsert)}>Salvar Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
