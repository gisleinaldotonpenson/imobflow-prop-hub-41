import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type LeadData } from '@/hooks/useLeads';
import { type Tables } from '@/integrations/supabase/types';

type Status = Tables<'lead_statuses'>;
type Property = { id: string; title: string; };

interface LeadDetailSidebarProps {
  lead: LeadData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedLead: Partial<LeadData>) => void;
  properties: Property[];
  statuses: Status[];
  navigate: (path: string) => void;
}

export const LeadDetailSidebar = ({ lead, open, onOpenChange, onSave, properties, statuses, navigate }: LeadDetailSidebarProps) => {
  const [editableLead, setEditableLead] = useState<Partial<LeadData>>({});

  useEffect(() => {
    if (lead) {
      setEditableLead(lead);
    } else {
      setEditableLead({});
    }
  }, [lead]);

  const handleInputChange = (field: keyof LeadData, value: string | null) => {
    setEditableLead(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editableLead);
  };

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] glass-effect">
        <SheetHeader>
          <SheetTitle>Detalhes do Lead</SheetTitle>
          <SheetDescription>Visualize e edite as informações do lead. Clique em salvar para aplicar as mudanças.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" value={editableLead.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" value={editableLead.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Telefone</Label>
            <Input id="phone" value={editableLead.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Etapa</Label>
            <Select value={editableLead.status_id || ''} onValueChange={(value) => handleInputChange('status_id', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="property" className="text-right">Imóvel</Label>
            <Select value={editableLead.source || ''} onValueChange={(value) => handleInputChange('source', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o imóvel de interesse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>{property.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea id="message" value={editableLead.message || ''} onChange={(e) => handleInputChange('message', e.target.value)} rows={4} />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => navigate(`/lead/${lead.id}`)}>Ver Perfil Completo</Button>
          <SheetClose asChild>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
