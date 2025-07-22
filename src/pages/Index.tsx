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
import heroImage from "@/assets/hero-image.jpg";
import propertyIcon from "@/assets/property-icon.png";
import neighborhoodIcon from "@/assets/neighborhood-icon.png";
import clientsIcon from "@/assets/clients-icon.png";

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
  const itemsPerPage = 9;

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
                className="bg-primary hover:bg-primary/90 text-white font-montserrat px-8 py-3 text-lg"
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
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                <img src={propertyIcon} alt="Imóveis" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-3xl font-montserrat font-bold text-primary mb-2">1.000+</h3>
              <p className="text-muted-foreground">Imóveis Disponíveis</p>
            </div>
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                <img src={neighborhoodIcon} alt="Bairros" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-3xl font-montserrat font-bold text-primary mb-2">50+</h3>
              <p className="text-muted-foreground">Bairros Atendidos</p>
            </div>
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                <img src={clientsIcon} alt="Clientes" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-3xl font-montserrat font-bold text-primary mb-2">98%</h3>
              <p className="text-muted-foreground">Clientes Satisfeitos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section id="imoveis" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12 animate-fade-in">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h2 className="text-4xl font-montserrat font-bold text-primary mb-4">
                Nossos Imóveis
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Encontre o imóvel perfeito para você com nossos filtros avançados
              </p>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <Button
                variant="outline"
                className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 text-primary hover:from-primary/20 hover:to-accent/20 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => {
                  const filtersElement = document.getElementById('property-filters');
                  if (filtersElement) {
                    filtersElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avançados
              </Button>
            </div>
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
      <footer id="contato" className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-16 overflow-hidden">
        {/* Subtle tech background effect */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_26%,transparent_27%,transparent_74%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02)_76%,transparent_77%,transparent)] bg-[length:20px_20px]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="relative">
                  <Home className="w-10 h-10 mr-3 text-blue-400" />
                  <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-sm"></div>
                </div>
                <span className="text-2xl font-montserrat font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  ImobFlow
                </span>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">
                Sistema completo para corretores imobiliários com vitrine de imóveis, 
                CRM e integração WhatsApp.
              </p>
              
              {/* Tech accent line */}
              <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full"></div>
            </div>
            
            <div>
              <h3 className="text-lg font-montserrat font-semibold mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                Contato
              </h3>
              <div className="space-y-3 text-white/80">
                <p className="flex items-center hover:text-blue-400 transition-colors cursor-pointer">
                  <span className="w-1 h-1 bg-blue-400/60 rounded-full mr-3"></span>
                  (62) 9 8106-7855
                </p>
                <p className="flex items-center hover:text-blue-400 transition-colors cursor-pointer">
                  <span className="w-1 h-1 bg-blue-400/60 rounded-full mr-3"></span>
                  contato@imobflow.com.br
                </p>
                <p className="flex items-center hover:text-blue-400 transition-colors">
                  <span className="w-1 h-1 bg-blue-400/60 rounded-full mr-3"></span>
                  Goiânia - GO
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-montserrat font-semibold mb-6 flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.5s'}}></span>
                Links Rápidos
              </h3>
              <div className="space-y-3">
                <a href="#home" className="block text-white/80 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400/60 rounded-full mr-3 group-hover:bg-cyan-400 transition-colors"></span>
                  Início
                </a>
                <a href="#imoveis" className="block text-white/80 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400/60 rounded-full mr-3 group-hover:bg-cyan-400 transition-colors"></span>
                  Imóveis
                </a>
                <a href="#contato" className="block text-white/80 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400/60 rounded-full mr-3 group-hover:bg-cyan-400 transition-colors"></span>
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
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-lg text-sm text-blue-400/80 hover:text-blue-400 hover:border-blue-400/30 transition-all duration-300">
                Powered by ImobFlow
              </button>
            </div>
          </div>
        </div>
        
        {/* Corner accent */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-tl-full"></div>
      </footer>

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