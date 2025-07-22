import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWhatsAppSettings } from "@/hooks/useWhatsAppSettings";

export function WhatsAppFloat() {
  const { createWhatsAppUrl } = useWhatsAppSettings();
  
  const handleWhatsAppClick = () => {
    const message = "Olá! Gostaria de mais informações sobre os imóveis disponíveis.";
    const whatsappUrl = createWhatsAppUrl(message);
    if (whatsappUrl !== '#') {
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <Button
        onClick={handleWhatsAppClick}
        size="lg"
        className="rounded-full w-14 h-14 bg-white text-green-600 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </div>
  );
}