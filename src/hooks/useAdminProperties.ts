import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { type Tables } from "@/integrations/supabase/types";

export type Property = Tables<"properties"> & {
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
};

// Mock data for development
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Casa de Luxo',
    description: 'Linda casa com piscina e vista para o mar',
    price: 2500000,
    location: 'Rio de Janeiro, RJ',
    bedrooms: 4,
    bathrooms: 5,
    area: 350,
    features: ['Piscina', 'Vista para o mar', 'Garagem'],
    image_url: '',
    images: [],
    purpose: 'sale',
    type: 'house',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Apartamento Moderno',
    description: 'Apartamento novo no centro da cidade',
    price: 850000,
    location: 'São Paulo, SP',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    features: ['Moderno', 'Centro da cidade'],
    image_url: '',
    images: [],
    purpose: 'sale',
    type: 'apartment',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function useAdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProperties = async () => {
    // If supabase is not initialized (mock client), use local data
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your_')) {
      console.warn('Using mock properties data');
      setProperties(MOCK_PROPERTIES);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Erro ao buscar propriedades:', error);
        setError(error.message);
        // Fallback to mock data in case of error
        setProperties(MOCK_PROPERTIES);
        return;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Erro ao buscar propriedades:', error);
      setError('Erro ao carregar propriedades');
      // Fallback to mock data in case of error
      setProperties(MOCK_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyStatus = async (id: string, isActive: boolean) => {
    // If supabase is not initialized, update local state only
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your_')) {
      setProperties(prev => 
        prev.map(prop => 
          prop.id === id ? { ...prop, is_active: isActive } : prop
        )
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("properties")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status do imóvel.",
          variant: "destructive",
        });
        return false;
      }

      // Atualizar o estado local
      setProperties(prev => 
        prev.map(property => 
          property.id === id 
            ? { ...property, is_active: isActive }
            : property
        )
      );

      toast({
        title: `Imóvel ${isActive ? "ativado" : "pausado"}!`,
        description: `O imóvel foi ${isActive ? "ativado e aparecerá" : "pausado e não aparecerá"} na vitrine.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar o status.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) {
        console.error('Erro ao deletar propriedade:', error);
        toast({
          title: "Erro",
          description: "Não foi possível deletar o imóvel.",
          variant: "destructive",
        });
        return false;
      }

      // Atualizar o estado local
      setProperties(prev => prev.filter(property => property.id !== id));

      toast({
        title: "Imóvel removido!",
        description: "O imóvel foi removido com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao deletar propriedade:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover o imóvel.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProperties();
    
    // Only set up real-time updates if Supabase is properly initialized
    if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your_')) {
      try {
        // Configurar listener para mudanças em tempo real
        const channel = supabase
          .channel('admin-properties-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'properties'
            },
            (payload) => {
              console.log('Property change detected in admin:', payload);
              // Atualizar dados sempre que houver mudanças
              fetchProperties();
            }
          )
          .subscribe();

        return () => {
          // Limpar subscription ao desmontar
          channel.unsubscribe();
        };
      } catch (error) {
        console.warn('Failed to set up real-time updates:', error);
      }
    } else {
      console.log('Real-time updates disabled in development mode');
    }
  }, [fetchProperties]);

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
    updatePropertyStatus,
    deleteProperty,
  };
}