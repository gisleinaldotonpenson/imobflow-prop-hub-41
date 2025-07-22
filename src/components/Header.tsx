import { Button } from "@/components/ui/button";
import { Home, Phone, MessageCircle, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useWhatsAppSettings } from "@/hooks/useWhatsAppSettings";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { createWhatsAppUrl, getFormattedNumber } = useWhatsAppSettings();

  const handleWhatsAppClick = () => {
    const message = "Olá! Gostaria de mais informações sobre os imóveis disponíveis.";
    const whatsappUrl = createWhatsAppUrl(message);
    if (whatsappUrl !== '#') {
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <header className="bg-white shadow-card sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Home className="w-8 h-8 text-primary mr-2" />
            <span className="text-2xl font-montserrat font-bold text-primary">
              ImobFlow
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Início
            </Link>
            <a
              href="#imoveis"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Imóveis
            </a>
            <a
              href="#contato"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Contato
            </a>
          </nav>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="font-montserrat"
            >
              <Phone className="w-4 h-4 mr-2" />
              {getFormattedNumber() || '(00) 0 0000-0000'}
            </Button>
            <Button
              onClick={handleWhatsAppClick}
              variant="whatsapp"
              size="sm"
              className="font-montserrat"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6 text-primary" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t animate-slide-up">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <a
                href="#imoveis"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Imóveis
              </a>
              <a
                href="#contato"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </a>
              <div className="flex flex-col space-y-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-montserrat w-full"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {getFormattedNumber() || '(00) 0 0000-0000'}
                </Button>
                <Button
                  onClick={handleWhatsAppClick}
                  variant="whatsapp"
                  size="sm"
                  className="font-montserrat w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}