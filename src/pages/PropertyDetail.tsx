import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import {
  ArrowLeft,
  Bed,
  Bath,
  Square,
  MapPin,
  MessageCircle,
  Share2,
  Car,
  Loader,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLeads } from "@/hooks/useLeads";
import { useWhatsAppSettings } from "@/hooks/useWhatsAppSettings";
import { formatCurrency, formatArea } from "@/lib/formatters";
import type { Property } from "@/hooks/useProperties";

// Type definitions
interface PropertyImage {
  url: string;
  room?: string;
}

// Type for property features that can be either a record or an array of strings
type PropertyFeatures = Record<string, unknown> | string[];


export default function PropertyDetail() {
  // State management
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { createLead } = useLeads();
  const { createWhatsAppUrl } = useWhatsAppSettings();
  
  const [isLeadModalOpen, setIsLeadModalOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [property, setProperty] = useState<Partial<Property> & { features?: PropertyFeatures } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedImages, setParsedImages] = useState<PropertyImage[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Get unique rooms from images, ensuring 'Não especificado' is included if any image has no room
  const allRooms: string[] = useMemo(() => {
    const rooms = new Set(parsedImages.map((img) => img.room || 'Não especificado'));
    return ['Todos', ...Array.from(rooms)];
  }, [parsedImages]);
  
  // Filter images based on selected room
  const displayedImages: PropertyImage[] = useMemo(() => {
    if (!selectedRoom || selectedRoom === 'Todos') return parsedImages;
    return parsedImages.filter((img) => (img.room || 'Não especificado') === selectedRoom);
  }, [parsedImages, selectedRoom]);

  // Handle image navigation
  const goToNextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === displayedImages.length - 1 ? 0 : prevIndex + 1
    );
  }, [displayedImages.length]);

  const goToPrevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? displayedImages.length - 1 : prevIndex - 1
    );
  }, [displayedImages.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextImage, goToPrevImage]);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Property not found');

        // Handle property features that might be a string or an object
        const propertyData = { ...data };
        if (propertyData.features && typeof propertyData.features === 'string') {
          try {
            propertyData.features = JSON.parse(propertyData.features);
          } catch (e) {
            console.warn('Failed to parse features:', e);
            propertyData.features = [];
          }
        }

        setProperty(propertyData);

        // Parse images if they exist
        if (data.images && Array.isArray(data.images)) {
          const parsed = data.images.map((img: string | { url: string; room?: string }) => {
            if (typeof img === 'string') {
              try {
                const parsedImg = JSON.parse(img);
                return {
                  url: parsedImg.url || img,
                  room: parsedImg.room || 'Não especificado'
                };
              } catch {
                return { url: img, room: 'Não especificado' };
              }
            }
            return {
              url: img.url,
              room: img.room || 'Não especificado'
            };
          });
          setParsedImages(parsed);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Erro ao carregar o imóvel. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedRoom]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando imóvel...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!property || error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{error || 'Imóvel não encontrado'}</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format price with currency
  const formatPrice = (price?: number) => {
    if (!price) return 'Sob consulta';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleWhatsAppClick = () => {
    setIsLeadModalOpen(true);
  };

  // Handle lead submission
  const handleLeadSubmit = async (name: string, phone: string) => {
    if (!property) return;

    try {
      // Format the message to include property details
      const message = `Interesse no imóvel: ${property.title || 'Imóvel sem título'}`;
      
      // Call createLead with the correct fields
      await createLead({
        name,
        phone,
        email: null,
        property_id: property.id as string,
        message,
        status: 'novo', // Using 'novo' to match the expected status format
      });

      // Show success message
      toast({
        title: 'Sucesso!',
        description: 'Seu interesse foi registrado. Você será redirecionado para o WhatsApp.',
      });

      // Get current URL for the property
      const propertyUrl = window.location.href;
      
      // Redirect to WhatsApp with property details and link
      const whatsappMessage = `Olá! Meu nome é ${name} e tenho interesse no seguinte imóvel:

*${property.title || 'Imóvel sem título'}*

🔗 ${propertyUrl}

Gostaria de mais informações.`;
      const whatsappUrl = createWhatsAppUrl(whatsappMessage);
      if (whatsappUrl !== '#') {
        window.open(whatsappUrl, '_blank');
      }
      
      // Close the modal
      setIsLeadModalOpen(false);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar seu interesse. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Handle share functionality
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property && typeof property.title === 'string' ? property.title : 'Imóvel',
          text: 'Confira este imóvel:',
          url: window.location.href,
        });
      } else {
        await copyToClipboard();
      }
    } catch (err) {
      // User cancelled share
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copiado!",
      description: "O link do imóvel foi copiado para a área de transferência.",
    });
  };



  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Erro ao carregar o imóvel</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Property not found state
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Imóvel não encontrado</h2>
          <p className="text-muted-foreground mb-4">O imóvel solicitado não foi encontrado.</p>
          <Button asChild variant="outline">
            <Link to="/">Voltar para a lista de imóveis</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos imóveis
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Images and Description */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="mb-8">
              {displayedImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Room filter */}
                  {allRooms.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {allRooms.map((room) => (
                        <Button
                          key={room}
                          variant={selectedRoom === room || (!selectedRoom && room === 'Todos') ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedRoom(room === 'Todos' ? null : room)}
                          className="text-xs"
                        >
                          {room}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Main Image */}
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={displayedImages[currentImageIndex]?.url || "/placeholder.svg"}
                      alt={`${property.title} - Imagem ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Room label */}
                    {displayedImages[currentImageIndex]?.room && (
                      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                        {displayedImages[currentImageIndex]?.room}
                      </div>
                    )}
                    
                    {/* Image counter */}
                    {displayedImages.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                        {currentImageIndex + 1} / {displayedImages.length}
                      </div>
                    )}
                    
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {displayedImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {displayedImages.map((img: {url: string; room?: string}, index: number) => (
                        <div key={index} className="relative">
                          <button
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-full aspect-square rounded-md overflow-hidden border-2 ${
                              index === currentImageIndex ? 'border-primary' : 'border-transparent'
                            }`}
                            type="button"
                          >
                            <img
                              src={img.url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                          {img.room && (
                            <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[10px] p-0.5 rounded text-center truncate">
                              {img.room}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Nenhuma imagem disponível</p>
                </div>
              )}
            </div>

            {/* Description */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-montserrat font-bold mb-4">Descrição</h2>
                <div className="prose prose-gray max-w-none">
                  {property.description ? (
                    property.description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Descrição não disponível.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-montserrat font-bold mb-4">Características</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.features && Array.isArray(property.features) && property.features.length > 0 ? (
                    property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground col-span-2">Características não informadas.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Contact Information */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <Badge
                    variant={property.purpose === "venda" ? "default" : "secondary"}
                    className="mb-3"
                  >
                    {property.purpose === "venda" ? "Venda" : "Aluguel"}
                  </Badge>
                  
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {property.title || 'Imóvel sem título'}
                  </h1>
                  
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{property.address || 'Endereço não disponível'}</span>
                  </div>
                  
                  <div className="text-2xl font-bold text-primary mb-6">
                    {property.price ? `R$ ${Number(property.price).toLocaleString('pt-BR')}` : 'Sob consulta'}
                    {property.condo_fee && (
                      <span className="block text-sm font-normal text-muted-foreground mt-1">
                        Condomínio: R$ {Number(property.condo_fee).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-primary" />
                      <span>{property.bedrooms || 0} {property.bedrooms === 1 ? 'quarto' : 'quartos'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-primary" />
                      <span>{property.bathrooms || 0} {property.bathrooms === 1 ? 'banheiro' : 'banheiros'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Square className="w-5 h-5 text-primary" />
                      <span>{property.area ? `${property.area} m²` : 'Área não informada'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{property.type || 'Tipo não especificado'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setIsLeadModalOpen(true)}
                    className="w-full py-6 text-base font-medium bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Tenho Interesse
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Clique para falar com um de nossos corretores
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        propertyTitle={typeof property.title === 'string' ? property.title : 'Imóvel sem título'}
        onSubmit={handleLeadSubmit}
      />
    </div>
  );
}