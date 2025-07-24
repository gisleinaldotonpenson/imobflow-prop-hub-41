import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/hooks/useLeads";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LeadDetailSidebar } from "@/components/admin/crm/LeadDetailSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import type { EnrichedLead } from "@/types/crm";
import { Input } from "@/components/ui/input";
import {
  Search,
  Home,
  Phone,
  Calendar as CalendarIcon,
  MapPin,
  Bed,
  Bath,
  Car,
  Share2,
  Edit,
  Play,
  Pause,
  Trash2,
  Building,
  Plus,
  Eye
} from 'lucide-react';
import { useProperties } from "@/hooks/useProperties";

// Define a local type for property to avoid external dependency
type Property = {
  id: string;
  title?: string;
  [key: string]: any; // For other properties that might be needed
};

export default function AdminProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedLead, setSelectedLead] = useState<EnrichedLead | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { properties, loading: propertiesLoading, error: propertiesError, updatePropertyStatus, deleteProperty } = useProperties();
  const { leads, loading: leadsLoading, updateLead } = useLeads();
  const { statuses } = useLeadStatuses();
  const { toast } = useToast();
  
  // Cast properties to our local Property type
  const typedProperties = properties as unknown as Property[];

  // Stats calculation
  const stats = {
    total: properties.length,
    active: properties.filter(p => p.is_active === true).length,
    inactive: properties.filter(p => p.is_active === false).length,
    totalLeads: leads.length,
  };

  // Recent leads
  const recentLeads = useMemo(() => {
    if (leadsLoading || propertiesLoading) return [];
    return leads.slice(0, 5).map(lead => {
      const property = properties.find(p => p.id === lead.property_id);
      return {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        property: property?.title || "Imóvel não encontrado",
        date: new Date(lead.created_at).toLocaleDateString('pt-BR'),
        status: lead.status || "novo",
      };
    });
  }, [leads, properties, leadsLoading, propertiesLoading]);

  // Format distance to now in Portuguese
  const formatDistanceToNow = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'hoje';
    } else if (diffInDays === 1) {
      return 'ontem';
    } else if (diffInDays < 7) {
      return `há ${diffInDays} dias`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

  // Get status name from status ID
  const getStatusName = (statusId: string): string => {
    const status = statuses?.find(s => s.id === statusId);
    return status?.name || 'Novo';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge variant="default">Ativo</Badge> : 
      <Badge variant="secondary">Pausado</Badge>;
  };

  const getLeadStatusBadge = (status: string) => {
    const statusObj = statuses?.find(s => s.name === status);
    if (!statusObj) return <Badge variant="outline">{status}</Badge>;
    
    return (
      <Badge 
        className="text-xs" 
        style={{ backgroundColor: statusObj.color || '#6b7280' }}
      >
        {status}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleShareProperty = (property: any) => {
    const link = `${window.location.origin}/property/${property.id}`;
    const message = `Confira este imóvel: ${property.title} - ${formatPrice(property.price)}\n\n${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleToggleStatus = async (propertyId: string, currentStatus: boolean) => {
    await updatePropertyStatus(propertyId, !currentStatus);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este imóvel?")) {
      await deleteProperty(propertyId);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && property.is_active) || 
      (statusFilter === "inactive" && !property.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const getFirstImageUrl = (property: any) => {
    if (!property.images || property.images.length === 0) {
      return property.image_url || "/placeholder.svg";
    }
    const first = property.images[0];
    try {
      const parsed = JSON.parse(first);
      return parsed.url || "/placeholder.svg";
    } catch {
      return first;
    }
  };

  const handleLeadClick = (leadId: string) => {
    const rawLead = leads.find(l => l.id === leadId);
    if (rawLead) {
      const status = statuses.find(s => s.id === rawLead.status) || { id: 'default', name: 'Novo', color: '#gray', order_num: 0 };
      setSelectedLead({ ...rawLead, status });
      setSidebarOpen(true);
    }
  };

  const handleUpdateLead = async (leadId: string, updates: any) => {
    try {
      await updateLead(leadId, updates);
      toast({
        title: 'Sucesso',
        description: 'Lead atualizado com sucesso!',
      });
      // No need to return anything as updateLead handles the state update
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o lead. Tente novamente.',
        variant: 'destructive',
      });
      throw error; // Re-throw to let the component handle it
    }
  };

  const handleAddNote = async (leadId: string, note: string) => {
    // Implement note addition logic here
    console.log(`Adding note to lead ${leadId}:`, note);
    return true;
  };

  const handleAddActivity = (description: string) => {
    // Implement activity addition logic here
    console.log('Adding activity:', description);
  };

  const handleLinkProperty = async (leadId: string, propertyId: string) => {
    try {
      await updateLead(leadId, { property_id: propertyId });
      return true;
    } catch (error) {
      console.error('Error linking property:', error);
      return false;
    }
  };

  const handleUnlinkProperty = async (leadId: string, propertyId: string) => {
    try {
      await updateLead(leadId, { property_id: null });
      return true;
    } catch (error) {
      console.error('Error unlinking property:', error);
      return false;
    }
  };

  const handleDeleteLead = (lead: EnrichedLead) => {
    // Implement delete logic if needed
    console.log('Deleting lead:', lead.id);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Stats */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-montserrat text-primary flex items-center">
          <Building className="w-6 h-6 mr-2 text-primary" /> Meus Imóveis
        </h1>
        <Link to="/admin/properties/new">
          <Button variant="default" size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-montserrat">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Imóvel
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center">
              <Building className="w-4 h-4 mr-1" /> Total de Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center">
              <Building className="w-4 h-4 mr-1" /> Imóveis Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center">
              <Building className="w-4 h-4 mr-1" /> Imóveis Pausados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center">
              <Building className="w-4 h-4 mr-1" /> Total de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Properties List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar imóveis..."
                    className="w-full pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status:</span>
                  <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                    <button
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${statusFilter === 'all' ? 'bg-background shadow' : 'hover:bg-background/50'}`}
                      onClick={() => setStatusFilter('all')}
                    >
                      Todos
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${statusFilter === 'active' ? 'bg-background shadow' : 'hover:bg-background/50'}`}
                      onClick={() => setStatusFilter('active')}
                    >
                      Ativos
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${statusFilter === 'inactive' ? 'bg-background shadow' : 'hover:bg-background/50'}`}
                      onClick={() => setStatusFilter('inactive')}
                    >
                      Pausados
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {propertiesLoading ? (
            <p>Carregando imóveis...</p>
          ) : propertiesError ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-destructive">Erro: {propertiesError}</p>
              </CardContent>
            </Card>
          ) : filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/3 h-48 sm:h-auto relative">
                    <img 
                      src={getFirstImageUrl(property)}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={property.is_active ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                        {property.is_active ? "Ativo" : "Pausado"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{property.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.location}
                      </p>
                      <p className="text-lg font-semibold text-primary mb-4">
                        {formatPrice(property.price)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center"><Bed className="w-4 h-4 mr-1" /> {property.bedrooms}</span>
                        <span className="flex items-center"><Bath className="w-4 h-4 mr-1" /> {property.bathrooms}</span>
                        <span className="flex items-center"><Car className="w-4 h-4 mr-1" /> {property.parking_spots}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Link to={`/property/${property.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Ver</span>
                        </Button>
                      </Link>
                      <Link to={`/admin/properties/edit/${property.id}`}>
                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                          <Edit className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShareProperty(property)}
                        className="flex-1 lg:flex-none"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Compartilhar</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(property.id, property.is_active || false)}
                        className="flex-1 lg:flex-none"
                      >
                        {property.is_active ? 
                          <><Pause className="w-4 h-4 mr-1" /><span className="hidden sm:inline">Pausar</span></> : 
                          <><Play className="w-4 h-4 mr-1" /><span className="hidden sm:inline">Ativar</span></>
                        }
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 lg:flex-none text-destructive hover:text-destructive"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Excluir</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum imóvel encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Tente ajustar sua busca" : "Comece cadastrando seu primeiro imóvel"}
                </p>
                <Link to="/admin/properties/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Imóvel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Recent Leads */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-montserrat text-lg">Leads Recentes</CardTitle>
                <Link to="/admin/crm">
                  <Button variant="outline" size="sm">
                    Ver CRM
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleLeadClick(lead.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{lead.name}</h4>
                    {getLeadStatusBadge(lead.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    {lead.property}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {lead.date}
                  </p>
                </div>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum lead recente
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lead Detail Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar detalhes"
          />
          {/* Sidebar */}
          <LeadDetailSidebar
            lead={selectedLead}
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onUpdate={handleUpdateLead}
            statuses={statuses || []}
            properties={typedProperties.map(p => ({
              id: p.id,
              title: p.title || `Imóvel #${p.id}`,
              reference: p.id // Using ID as reference if code is not available
            }))}
            onLinkProperty={handleLinkProperty}
            onUnlinkProperty={handleUnlinkProperty}
            onAddNote={handleAddNote}
            onAddActivity={handleAddActivity}
            activities={[]} // Add activities if available
            onDelete={handleDeleteLead}
          />
        </>
      )}
    </>
  );
}