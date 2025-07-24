import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image_url: string;
  images?: string[];
  type: string;
  purpose: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  reference?: string;
  parking_spots?: number;
  condo_fee?: number;
  description?: string;
}

// Mock data for development since we don't have a properties table
const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Apartamento Moderno no Centro",
    price: 450000,
    location: "Centro, Goiânia",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image_url: "/house-1.jpg",
    images: ["/house-1.jpg", "/house-2.jpg"],
    type: "apartamento",
    purpose: "venda",
    features: ["Área Gourmet", "Piscina", "Academia"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reference: "AP001",
    parking_spots: 2,
    condo_fee: 350,
    description: "Lindo apartamento com 3 quartos, 2 banheiros e área gourmet.",
  },
  {
    id: "2",
    title: "Casa com Quintal no Setor Sul",
    price: 650000,
    location: "Setor Sul, Goiânia",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    image_url: "/house-3.jpg",
    images: ["/house-3.jpg", "/house-4.jpg"],
    type: "casa",
    purpose: "venda",
    features: ["Quintal", "Garagem", "Área de Lazer"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reference: "CS001",
    parking_spots: 3,
    description: "Casa espaçosa com quintal amplo, ideal para famílias.",
  },
  {
    id: "3",
    title: "Apartamento para Aluguel",
    price: 2500,
    location: "Setor Oeste, Goiânia",
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    image_url: "/house-5.jpg",
    images: ["/house-5.jpg", "/house-6.jpg"],
    type: "apartamento",
    purpose: "aluguel",
    features: ["Mobiliado", "Pet Friendly"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reference: "AL001",
    parking_spots: 1,
    condo_fee: 200,
    description: "Apartamento mobiliado pronto para morar.",
  },
];

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load from localStorage or use mock data
      const stored = localStorage.getItem('properties');
      const data = stored ? JSON.parse(stored) : MOCK_PROPERTIES;
      
      setProperties(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar propriedades');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      localStorage.setItem('properties', JSON.stringify(updatedProperties));

      return { data: newProperty, error: null };
    } catch (err) {
      const error = 'Erro ao criar propriedade';
      setError(error);
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
      localStorage.setItem('properties', JSON.stringify(updatedProperties));

      return { error: null };
    } catch (err) {
      const error = 'Erro ao atualizar propriedade';
      setError(error);
      return { error };
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const updatedProperties = properties.filter(prop => prop.id !== id);
      setProperties(updatedProperties);
      localStorage.setItem('properties', JSON.stringify(updatedProperties));

      return { error: null };
    } catch (err) {
      const error = 'Erro ao excluir propriedade';
      setError(error);
      return { error };
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    loading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    refetch: fetchProperties,
  };
}