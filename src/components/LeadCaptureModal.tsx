import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPhone } from "@/lib/formatters";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  onSubmit: (name: string, phone: string) => void;
}

export function LeadCaptureModal({
  isOpen,
  onClose,
  propertyTitle,
  onSubmit,
}: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      toast({
        title: "Erro",
        description: "Por favor, insira um telefone válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      onSubmit(name.trim(), phone);
      toast({
        title: "Sucesso!",
        description: "Redirecionando para o WhatsApp...",
      });
      
      // Reset form
      setName("");
      setPhone("");
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md shadow-modal">
        <DialogHeader>
          <DialogTitle className="font-montserrat text-xl text-primary flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-500" />
            Interesse no Imóvel
          </DialogTitle>
          <DialogDescription className="text-base">
            Deixe seu nome e telefone para entrar em contato sobre:
            <br />
            <strong className="text-primary">{propertyTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Seu nome completo
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Seu telefone/WhatsApp
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={handlePhoneChange}
                className="pl-10"
                maxLength={15}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="whatsapp"
              disabled={isLoading}
              className="font-montserrat"
            >
              {isLoading ? (
                "Enviando..."
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Conversar no WhatsApp
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}