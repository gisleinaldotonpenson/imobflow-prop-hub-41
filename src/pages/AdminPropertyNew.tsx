import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  ArrowLeft,
  Upload,
  MapPin,
  Bed,
  Bath,
  Square,
  X,
  Plus,
  Car,
  DollarSign,
  Image as ImageIcon,
  Check,
  ChevronsUpDown,
  Tag,
  Wand2,
  Loader,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { aiService } from "@/services/aiService";
import { useAISettings } from "@/hooks/useAISettings";

import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AdminPropertyNew() {
  const { toast } = useToast();
  const { isAIEnabled } = useAISettings();
  const [generatingDescription, setGeneratingDescription] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    location: "",
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    type: "",
    purpose: "",
    features: "" as string | string[],
  });

  const [images, setImages] = useState<{url: string, room?: string}[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState([
    'Sala de Estar',
    'Cozinha',
    'Quarto Principal',
    'Quarto',
    'Banheiro',
    'Varanda',
    'Garagem',
    'Área Externa',
    'Outros'
  ]);
  const [newRoom, setNewRoom] = useState('');

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateDescription = async () => {
    if (!isAIEnabled) {
      toast({
        title: "IA não configurada",
        description: "Configure um provedor de IA nas configurações para gerar descrições.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingDescription(true);
    
    try {
      const description = await aiService.generatePropertyDescription({
        title: formData.title,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        location: formData.location,
        price: formData.price,
        type: formData.type,
      });

      handleInputChange("description", description);
      
      toast({
        title: "Descrição gerada!",
        description: "A descrição foi gerada com sucesso. Você pode editá-la se necessário.",
      });
    } catch (error) {
      console.error("Error generating description:", error);
      toast({
        title: "Erro ao gerar descrição",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setGeneratingDescription(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.price || !formData.location || !formData.type || !formData.purpose) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Imagens obrigatórias",
        description: "Adicione pelo menos uma imagem do imóvel.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse features from string to array
      const featuresArray = Array.isArray(formData.features) 
        ? formData.features
        : typeof formData.features === 'string' 
          ? formData.features.split(',').map(f => f.trim()).filter(f => f.length > 0)
          : [];

      // Prepare images data with room information
      const imagesWithRooms = images.map(img => ({
        url: img.url,
        room: img.room || 'Não especificado',
        is_primary: img.url === images[0]?.url // First image is primary
      }));

      // Store room information as a feature
      const allFeatures = [
        ...featuresArray,
        ...selectedRooms.map(room => `Ambiente: ${room}`)
      ];

      // Save property to localStorage since we don't have a properties table
      const stored = localStorage.getItem('properties');
      const properties = stored ? JSON.parse(stored) : [];
      
      const newProperty = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description || "",
        price: formData.price,
        location: formData.location,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        type: formData.type,
        purpose: formData.purpose,
        features: allFeatures,
        images: imagesWithRooms.map(img => JSON.stringify(img)),
        image_url: images.length > 0 ? images[0]?.url : null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedProperties = [...properties, newProperty];
      localStorage.setItem('properties', JSON.stringify(updatedProperties));
      const error = null; // No error for localStorage operation

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Imóvel cadastrado com sucesso!",
      });

      // Redirect to properties list
      navigate("/admin/properties");
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o imóvel. Tente novamente.",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/admin/properties">
            <Button variant="outline" className="font-montserrat">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Imóveis
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-montserrat font-bold text-primary mb-2">
            Cadastrar Novo Imóvel
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Preencha todas as informações do imóvel para adicionar à vitrine
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-montserrat">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título do Imóvel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Apartamento Moderno no Centro"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Preço *</Label>
                  <CurrencyInput
                    id="price"
                    value={formData.price}
                    onChange={(value) => handleInputChange("price", value)}
                    placeholder="450.000 ou 2.800 (para aluguel)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Imóvel *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="sobrado">Sobrado</SelectItem>
                      <SelectItem value="cobertura">Cobertura</SelectItem>
                      <SelectItem value="kitnet">Kitnet</SelectItem>
                      <SelectItem value="loft">Loft</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="purpose">Finalidade *</Label>
                  <Select value={formData.purpose} onValueChange={(value) => handleInputChange("purpose", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a finalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venda">Venda</SelectItem>
                      <SelectItem value="aluguel">Aluguel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">Descrição Completa</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateDescription}
                    disabled={generatingDescription || !formData.title}
                    className="flex items-center gap-2 text-xs"
                  >
                    {generatingDescription ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    {generatingDescription ? "Gerando..." : "Gerar com IA"}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva o imóvel em detalhes..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isAIEnabled 
                    ? "Preencha pelo menos o título e clique em 'Gerar com IA' para criar uma descrição automática."
                    : "Configure a IA nas configurações para gerar descrições automaticamente."
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="font-montserrat flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Bairro e Cidade *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Ex: Centro, São Paulo - SP"
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-montserrat">Detalhes do Imóvel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms" className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    Quartos
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms || ''}
                    onChange={(e) => handleInputChange("bedrooms", parseInt(e.target.value) || 0)}
                    placeholder="Ex: 2"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms" className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    Banheiros
                  </Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms || ''}
                    onChange={(e) => handleInputChange("bathrooms", parseInt(e.target.value) || 0)}
                    placeholder="Ex: 2"
                  />
                </div>
                <div>
                  <Label htmlFor="area" className="flex items-center">
                    <Square className="w-4 h-4 mr-1" />
                    Área (m²)
                  </Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area || ''}
                    onChange={(e) => handleInputChange("area", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 85"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="features">Características e Diferenciais</Label>
                <Textarea
                  id="features"
                  value={Array.isArray(formData.features) ? formData.features.join(', ') : formData.features}
                  onChange={(e) => handleInputChange("features", e.target.value)}
                  placeholder="Ex: Piscina, Churrasqueira, Varanda Gourmet, Garagem, etc."
                  rows={3}
                />
              </div>

              <div>
                <Label>Ambientes do Imóvel</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedRooms.map((room) => (
                    <Badge key={room} className="flex items-center gap-1">
                      {room}
                      <button
                        type="button"
                        onClick={() => setSelectedRooms(selectedRooms.filter(r => r !== room))}
                        className="ml-1 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select
                    value={newRoom}
                    onValueChange={(value) => {
                      if (value && !selectedRooms.includes(value)) {
                        setSelectedRooms([...selectedRooms, value]);
                        setNewRoom('');
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um ambiente" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms
                        .filter(room => !selectedRooms.includes(room))
                        .map((room) => (
                          <SelectItem key={room} value={room}>
                            {room}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newRoom.trim() && !selectedRooms.includes(newRoom.trim())) {
                        e.preventDefault();
                        setSelectedRooms([...selectedRooms, newRoom.trim()]);
                        setNewRoom('');
                      }
                    }}
                    placeholder="Ou digite um novo ambiente"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (newRoom.trim() && !selectedRooms.includes(newRoom.trim())) {
                        setSelectedRooms([...selectedRooms, newRoom.trim()]);
                        setNewRoom('');
                      }
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione os ambientes do imóvel para organizar as fotos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="font-montserrat flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Imagens do Imóvel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MultiImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={15}
                availableRooms={['Não especificado', ...selectedRooms]}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link to="/admin/properties">
              <Button variant="outline" type="button" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="w-full sm:w-auto font-montserrat">
              <Building className="w-4 h-4 mr-2" />
              Cadastrar Imóvel
            </Button>
          </div>
        </form>
      </div>
      {isMobile && <AdminBottomNav />}
    </div>
  );
}