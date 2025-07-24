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
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
    ],
    type: "apartamento",
    purpose: "venda",
    features: ["Área Gourmet", "Piscina", "Academia", "Sacada", "2 Vagas"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reference: "AP001",
    parking_spots: 2,
    condo_fee: 350,
    description: "Lindo apartamento com 3 quartos, 2 banheiros e área gourmet completa. Localizado no centro da cidade com fácil acesso a transporte público e comércios.",
  },
  {
    id: "2",
    title: "Casa com Quintal no Setor Sul",
    price: 650000,
    location: "Setor Sul, Goiânia",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&h=600&fit=crop"
    ],
    type: "casa",
    purpose: "venda",
    features: ["Quintal", "Garagem", "Área de Lazer", "Churrasqueira", "3 Vagas"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reference: "CS001",
    parking_spots: 3,
    description: "Casa espaçosa com quintal amplo, ideal para famílias. Possui 4 quartos sendo 2 suítes, área de lazer completa com churrasqueira.",
  },
  {
    id: "3",
    title: "Apartamento para Aluguel",
    price: 2500,
    location: "Setor Oeste, Goiânia",
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
    ],
    type: "apartamento",
    purpose: "aluguel",
    features: ["Mobiliado", "Pet Friendly", "Sacada", "1 Vaga"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reference: "AL001",
    parking_spots: 1,
    condo_fee: 200,
    description: "Apartamento mobiliado pronto para morar. Aceita pets, localização privilegiada no Setor Oeste.",
  },
  {
    id: "4",
    title: "Casa de Luxo com Piscina",
    price: 980000,
    location: "Setor Bueno, Goiânia",
    bedrooms: 5,
    bathrooms: 4,
    area: 350,
    image_url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop"
    ],
    type: "casa",
    purpose: "venda",
    features: ["Piscina", "Área Gourmet", "Academia", "Escritório", "4 Vagas"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reference: "CS002",
    parking_spots: 4,
    description: "Casa de alto padrão com 5 suítes, piscina aquecida, área gourmet completa e academia. Localizada no nobre Setor Bueno.",
  },
  {
    id: "5",
    title: "Kitnet Próximo à Universidade",
    price: 1200,
    location: "Setor Universitário, Goiânia",
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    image_url: "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=600&fit=crop"
    ],
    type: "kitnet",
    purpose: "aluguel",
    features: ["Mobiliado", "Internet Incluída", "Próximo ao Campus"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reference: "KT001",
    parking_spots: 0,
    condo_fee: 80,
    description: "Kitnet perfeita para estudantes, completamente mobiliada e a poucos metros da universidade. Internet incluída na mensalidade.",
  },
  {
    id: "6",
    title: "Cobertura com Vista Panorâmica",
    price: 750000,
    location: "Setor Marista, Goiânia",
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop"
    ],
    type: "cobertura",
    purpose: "venda",
    features: ["Terraço", "Vista Panorâmica", "Área Gourmet", "Piscina Privativa", "2 Vagas"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reference: "CB001",
    parking_spots: 2,
    condo_fee: 450,
    description: "Cobertura exclusiva com vista panorâmica da cidade. Terraço amplo, piscina privativa e área gourmet completa. O último andar oferece privacidade total.",
  }
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