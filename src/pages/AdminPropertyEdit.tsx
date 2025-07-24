import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
import { Upload, X, Plus, Building, Bath, Car, Bed, MapPin, DollarSign, Image as ImageIcon, Check, ChevronsUpDown, Tag, ArrowLeft, Loader, Square, Wand2 } from 'lucide-react';

import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/hooks/useProperties";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { aiService } from "@/services/aiService";
import { useAISettings } from "@/hooks/useAISettings";

export default function AdminPropertyEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAIEnabled } = useAISettings();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
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
    is_active: true,
  });
  const [images, setImages] = useState<{ url: string; room?: string }[]>([]);
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
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Get property from localStorage - try adminProperties first, then properties
        let stored = localStorage.getItem('adminProperties');
        if (!stored) {
          stored = localStorage.getItem('properties');
        }
        const properties = stored ? JSON.parse(stored) : [];
        let data = properties.find((p: any) => p.id === id);
        
        // If not found, try to initialize with mock data
        if (!data && properties.length === 0) {
          const mockProperties = [
            {
              id: "1",
              title: "Apartamento Moderno no Centro",
              description: "Lindo apartamento com 3 quartos, 2 banheiros e área gourmet completa. Localizado no centro da cidade com fácil acesso a transporte público e comércios.",
              price: 450000,
              location: "Centro, Goiânia",
              bedrooms: 3,
              bathrooms: 2,
              area: 120,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
              images: [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop"
              ],
              features: ["Área Gourmet", "Piscina", "Academia", "Sacada", "2 Vagas"],
              purpose: "venda",
              type: "apartamento",
              reference: "AP001",
              parking_spots: 2,
              condo_fee: 350,
            }
          ];
          localStorage.setItem('adminProperties', JSON.stringify(mockProperties));
          data = mockProperties.find((p: any) => p.id === id);
        }

        if (!data) {
          throw new Error('Property not found');
        }

        setProperty(data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price || 0,
          location: data.location || "",
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          area: data.area || 0,
          type: data.type || "",
          purpose: data.purpose || "",
          features: Array.isArray(data.features) ? data.features.join(', ') : "",
          is_active: data.is_active !== false,
        });

        const parsedImages = data.images?.map((img: string) => {
          try {
            return JSON.parse(img);
          } catch {
            return { url: img };
          }
        }).filter((img: any) => img && img.url) || (data.image_url ? [{ url: data.image_url }] : []);
        setImages(parsedImages);

        const roomFeatures = Array.isArray(data.features)
          ? data.features
            .filter((f: string) => typeof f === 'string' && f.startsWith('Ambiente: '))
            .map((f: string) => f.replace('Ambiente: ', ''))
          : [];

        const imageRooms = parsedImages
          .map((img: any) => img.room)
          .filter((room: string | undefined): room is string => !!room);

        const allRooms = Array.from(new Set([...roomFeatures, ...imageRooms]));
        setSelectedRooms(allRooms);

      } catch (error) {
        console.error("Error fetching property:", error);
        toast({
          title: "Erro ao carregar imóvel",
          description: "Não foi possível encontrar os dados do imóvel. Tente novamente.",
          variant: "destructive",
        });
        navigate("/admin/properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate, toast]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    if (!id) return;

    setSaving(true);

    const featuresArray = typeof formData.features === 'string'
      ? formData.features.split(',').map(f => f.trim()).filter(f => f)
      : formData.features;

    const roomFeatures = selectedRooms.map(room => `Ambiente: ${room}`);
    const finalFeatures = Array.from(new Set([...featuresArray, ...roomFeatures]));

    const serializedImages = images.map(img => JSON.stringify(img));

    // Update property in localStorage - try adminProperties first
    let stored = localStorage.getItem('adminProperties');
    if (!stored) {
      stored = localStorage.getItem('properties');
    }
    const properties = stored ? JSON.parse(stored) : [];
    const updatedProperties = properties.map((p: any) => 
      p.id === id 
        ? { 
            ...p, 
            ...formData, 
            features: finalFeatures, 
            images: serializedImages, 
            image_url: images.length > 0 ? images[0].url : null,
            updated_at: new Date().toISOString()
          }
        : p
    );
    localStorage.setItem('adminProperties', JSON.stringify(updatedProperties));
    // Also update properties for compatibility
    localStorage.setItem('properties', JSON.stringify(updatedProperties));
    const error = null; // No error for localStorage operation

    setSaving(false);

    if (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o imóvel. Tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Imóvel atualizado!",
        description: "As alterações foram salvas com sucesso.",
        className: "bg-green-500 text-white",
      });
      navigate("/admin/properties");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">

        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Imóvel não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O imóvel que você está tentando editar não foi encontrado. Ele pode ter sido removido.
          </p>
          <Link to="/admin/properties">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a Lista de Imóveis
            </Button>
          </Link>
        </div>
        {isMobile && <AdminBottomNav />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6">
          <Link to="/admin/properties">
            <Button variant="outline" className="font-montserrat">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Imóveis
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                    onChange={(value) => handleInputChange("price", value || 0)}
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
                      <SelectItem value="Apartamento">Apartamento</SelectItem>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Sobrado">Sobrado</SelectItem>
                      <SelectItem value="Cobertura">Cobertura</SelectItem>
                      <SelectItem value="Kitnet">Kitnet</SelectItem>
                      <SelectItem value="Loft">Loft</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                      <SelectItem value="Comercial">Comercial</SelectItem>
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

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link to="/admin/properties">
              <Button variant="outline" type="button" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto font-montserrat">
              {saving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Building className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      {isMobile && <AdminBottomNav />}
    </div>
  );
}