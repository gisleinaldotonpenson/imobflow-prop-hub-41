import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters } from "@/components/PropertyFilters";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { useProperties, type Property } from "@/hooks/useProperties";
import { useLeads } from "@/hooks/useLeads";
import { useWhatsAppSettings } from "@/hooks/useWhatsAppSettings";
import { useToast } from "@/hooks/use-toast";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Search, Home, MapPin, TrendingUp, MessageCircle, Filter } from "lucide-react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import heroImage from "@/assets/hero-image.jpg";
import modernHomeIcon from "@/assets/modern-home-icon.png";
import modernLocationIcon from "@/assets/modern-location-icon.png";
import modernChartIcon from "@/assets/modern-chart-icon.png";

export default function Index() {
  const { properties, loading, error } = useProperties();
  const { createLead } = useLeads();
  const { createWhatsAppUrl } = useWhatsAppSettings();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState({
    type: "all",
    purpose: "all",
    location: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "all",
    bathrooms: "all",
    minArea: "",
    maxArea: "",
    parkingSpots: "all",
    maxCondoFee: "",
  });
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setFilters({
      type: "all",
      purpose: "all",
      location: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "all",
      bathrooms: "all",
      minArea: "",
      maxArea: "",
      parkingSpots: "all",
      maxCondoFee: "",
    });
    setCurrentPage(1);
  };

  const handleWhatsAppClick = (property: Property) => {
    setSelectedProperty(property);
    setIsLeadModalOpen(true);
  };

  const handleLeadSubmit = async (name: string, phone: string) => {
    try {
      const leadData = {
        name,
        phone,
        email: null,
        property_id: selectedProperty?.id || null,
        message: `Interesse no imóvel: ${selectedProperty?.title}`,
        status: "novo",
      };

      const { error } = await createLead(leadData);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível registrar seu interesse. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Seu interesse foi registrado. Você será redirecionado para o WhatsApp.",
      });

      // Build property URL
      const propertyUrl = `${window.location.origin}/property/${selectedProperty?.id}`;
      
      // Redirect to WhatsApp with property details and link
      const message = `Olá! Meu nome é ${name} e tenho interesse no seguinte imóvel:

*${selectedProperty?.title || 'Imóvel sem título'}*

🔗 ${propertyUrl}

Gostaria de mais informações.`;
      const whatsappUrl = createWhatsAppUrl(message);
      if (whatsappUrl !== '#') {
        window.open(whatsappUrl, "_blank");
      }
      
      setIsLeadModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleHeroWhatsApp = () => {
    const message = "Olá! Vi seu site e tenho interesse em conhecer os imóveis disponíveis. Pode me ajudar?";
    const whatsappUrl = createWhatsAppUrl(message);
    if (whatsappUrl !== '#') {
      window.open(whatsappUrl, "_blank");
    }
  };

  // Filtrar propriedades baseado nos filtros aplicados
  const filteredProperties = useMemo(() => {
    const { type, purpose, location, minPrice, maxPrice, bedrooms, bathrooms, minArea, maxArea, parkingSpots, maxCondoFee } = filters;
    
    return properties.filter(property => {
      // Filtro por status ativo (só mostra imóveis ativos na vitrine)
      if (property.is_active === false) return false;
      
      // Filtro por tipo
      if (type !== "" && type !== "all" && property.type !== type) return false;
      
      // Filtro por finalidade
      if (purpose !== "" && purpose !== "all" && property.purpose !== purpose) return false;
      
      // Filtro por localização
      if (location !== "" && !property.location.toLowerCase().includes(location.toLowerCase())) return false;
      
      // Filtro por preço mínimo
      const minPriceNum = parseFloat(minPrice) || 0;
      if (property.price < minPriceNum) return false;
      
      // Filtro por preço máximo
      const maxPriceNum = parseFloat(maxPrice) || Infinity;
      if (property.price > maxPriceNum) return false;
      
      // Filtro por quartos
      if (bedrooms !== "" && bedrooms !== "all" && property.bedrooms < parseInt(bedrooms)) return false;
      
      // Filtro por banheiros
      if (bathrooms !== "" && bathrooms !== "all" && property.bathrooms < parseInt(bathrooms)) return false;
      
      // Filtro por área mínima
      if (minArea !== "" && property.area < parseInt(minArea)) return false;
      
      // Filtro por área máxima
      if (maxArea !== "" && property.area > parseInt(maxArea)) return false;
      
      // Filtro por vagas de garagem
      if (parkingSpots !== "" && parkingSpots !== "all" && (property.parking_spots || 0) < parseInt(parkingSpots)) return false;
      
      // Filtro por taxa de condomínio máxima
      if (maxCondoFee !== "" && (property.condo_fee || 0) > parseInt(maxCondoFee)) return false;
      
      return true;
    });
  }, [properties, filters]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section id="home" className="relative h-[500px] sm:h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/75" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="max-w-4xl text-center text-white animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-montserrat font-bold mb-6 leading-tight">
              Encontre seu
              <br />
              <span className="text-accent">Imóvel Ideal</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Mais de 1.000 imóveis disponíveis para venda e aluguel. 
              Encontre sua casa dos sonhos com a melhor assessoria imobiliária.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-montserrat px-8 py-3 text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 hover:translate-y-[-2px] ring-2 ring-primary/20 hover:ring-primary/40"
                onClick={() => document.getElementById('imoveis')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Search className="w-5 h-5 mr-2" />
                Ver Imóveis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src={modernHomeIcon} alt="Imóveis" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain rounded-full" />
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 sm:p-4 mb-2 border border-primary/20">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold text-primary">
                  <AnimatedNumber end={1000} suffix="+" />
                </h3>
              </div>
              <p className="text-muted-foreground font-medium text-sm sm:text-base">Imóveis Disponíveis</p>
            </div>
            <div className="animate-fade-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src={modernLocationIcon} alt="Bairros" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain rounded-full" />
              </div>
              <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg p-3 sm:p-4 mb-2 border border-accent/20">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold text-primary">
                  <AnimatedNumber end={50} suffix="+" />
                </h3>
              </div>
              <p className="text-muted-foreground font-medium text-sm sm:text-base">Bairros Atendidos</p>
            </div>
            <div className="animate-fade-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src={modernChartIcon} alt="Clientes" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain rounded-full" />
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 sm:p-4 mb-2 border border-primary/20">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold text-primary">
                  <AnimatedNumber end={98} suffix="%" />
                </h3>
              </div>
              <p className="text-muted-foreground font-medium text-sm sm:text-base">Clientes Satisfeitos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section id="imoveis" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-montserrat font-bold text-primary mb-4">
              Nossos Imóveis
            </h2>
          </div>

          {/* Filters */}
          <div id="property-filters" className="mb-12">
            <PropertyFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loading ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando propriedades...</p>
              </div>
            ) : error ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8">
                <p className="text-destructive">Erro: {error}</p>
              </div>
            ) : currentProperties.length > 0 ? (
              currentProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    ...property,
                    image: property.image_url || "/placeholder.svg"
                  }}
                  onWhatsAppClick={() => handleWhatsAppClick(property)}
                />
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-montserrat font-semibold text-muted-foreground mb-2">
                  Nenhum imóvel encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros para encontrar mais imóveis
                </p>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="mt-4"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>


      {/* Footer */}
      <footer id="contato" className="relative bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16">        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <Home className="w-10 h-10 mr-3 text-blue-400" />
                <span className="text-2xl font-montserrat font-bold">
                  ImobFlow
                </span>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">
                Sistema completo para corretores imobiliários com vitrine de imóveis, 
                CRM e integração WhatsApp.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-montserrat font-semibold mb-6">
                Contato
              </h3>
              <div className="space-y-3 text-white/80">
                <p>(62) 9 8106-7855</p>
                <p>contato@imobflow.com.br</p>
                <p>Goiânia - GO</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-montserrat font-semibold mb-6">
                Links Rápidos
              </h3>
              <div className="space-y-3">
                <a href="#home" className="block text-white/80 hover:text-white transition-colors">
                  Início
                </a>
                <a href="#imoveis" className="block text-white/80 hover:text-white transition-colors">
                  Imóveis
                </a>
                <a href="#contato" className="block text-white/80 hover:text-white transition-colors">
                  Contato
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              &copy; 2024 ImobFlow. Todos os direitos reservados.
            </p>
            
            <div className="mt-4 md:mt-0">
              <span className="text-sm text-white/60">
                Powered by ImobFlow
              </span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Admin Access Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Área Administrativa</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Acesse o painel administrativo para gerenciar propriedades, leads e configurações do sistema
          </p>
          <div className="space-y-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <a href="/auth" className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Acessar Painel Admin
              </a>
            </Button>
            <div className="text-sm text-muted-foreground bg-white/80 p-3 rounded-lg inline-block">
              <strong>Credenciais:</strong> admin@admin.com / teste123
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        propertyTitle={selectedProperty?.title || ""}
        onSubmit={handleLeadSubmit}
      />
      
      {/* WhatsApp Float Button */}
      <WhatsAppFloat />
    </div>
  );
}