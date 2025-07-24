import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Since we don't have a properties table in the database, we'll use mock data
export type Property = {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image_url: string;
  images: string[];
  features: string[];
  purpose: string;
  type: string;
  reference: string;
  parking_spots?: number;
  condo_fee?: number;
};

// Mock data for development
const mockProperties: Property[] = [
  {
    id: "1",
    title: "Apartamento Moderno no Centro",
    description: "Lindo apartamento com 3 quartos, 2 banheiros e área gourmet.",
    price: 450000,
    location: "Centro, Goiânia",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    image_url: "/placeholder.svg",
    images: [],
    features: ["Área Gourmet", "Piscina", "Academia"],
    purpose: "venda",
    type: "apartamento",
    reference: "AP001",
    parking_spots: 2,
    condo_fee: 350,
  },
  {
    id: "2",
    title: "Casa com Quintal no Setor Sul",
    description: "Casa espaçosa com quintal amplo, ideal para famílias.",
    price: 650000,
    location: "Setor Sul, Goiânia",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    image_url: "/placeholder.svg",
    images: [],
    features: ["Quintal", "Garagem", "Área de Lazer"],
    purpose: "venda",
    type: "casa",
    reference: "CS001",
    parking_spots: 3,
  },
];

export function useAdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load from localStorage or use mock data
      const stored = localStorage.getItem('adminProperties');
      const data = stored ? JSON.parse(stored) : mockProperties;
      
      setProperties(data);
    } catch (err) {
      setError('Erro ao carregar propriedades');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProperty: Property = {
        ...propertyData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedProperties = [...properties, newProperty];
      setProperties(updatedProperties);
      localStorage.setItem('adminProperties', JSON.stringify(updatedProperties));

      toast({
        title: "Sucesso",
        description: "Propriedade criada com sucesso.",
      });

      return { data: newProperty, error: null };
    } catch (err) {
      const error = 'Erro ao criar propriedade';
      setError(error);
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const updatedProperties = properties.map(prop => 
        prop.id === id 
          ? { ...prop, ...updates, updated_at: new Date().toISOString() }
          : prop
      );

      setProperties(updatedProperties);
      localStorage.setItem('adminProperties', JSON.stringify(updatedProperties));

      toast({
        title: "Sucesso",
        description: "Propriedade atualizada com sucesso.",
      });

      return { error: null };
    } catch (err) {
      const error = 'Erro ao atualizar propriedade';
      setError(error);
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const updatedProperties = properties.filter(prop => prop.id !== id);
      setProperties(updatedProperties);
      localStorage.setItem('adminProperties', JSON.stringify(updatedProperties));

      toast({
        title: "Sucesso",
        description: "Propriedade excluída com sucesso.",
      });

      return { error: null };
    } catch (err) {
      const error = 'Erro ao excluir propriedade';
      setError(error);
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
      return { error };
    }
  };

  const togglePropertyStatus = async (id: string) => {
    const property = properties.find(p => p.id === id);
    if (!property) return { error: 'Propriedade não encontrada' };

    return updateProperty(id, { is_active: !property.is_active });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    togglePropertyStatus,
    refetch: fetchProperties,
  };
}