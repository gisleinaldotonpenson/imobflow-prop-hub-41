import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Filter, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { formatNumberWithDots } from "@/lib/formatters";

interface PropertyFiltersProps {
  filters: {
    purpose: string;
    type: string;
    location: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
    minArea: string;
    maxArea: string;
    parkingSpots: string;
    maxCondoFee: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function PropertyFilters({ filters, onFilterChange, onClearFilters }: PropertyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className="shadow-card animate-slide-up">
      <CardContent className="p-6">
        {/* Mobile: Collapsible trigger */}
        <div className="md:hidden">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <span className="font-montserrat font-semibold text-primary">
                    Filtrar Imóveis
                  </span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purpose-mobile" className="text-sm font-medium">
                    Finalidade
                  </Label>
                  <Select
                    value={filters.purpose}
                    onValueChange={(value) => onFilterChange("purpose", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="venda">Venda</SelectItem>
                      <SelectItem value="aluguel">Aluguel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type-mobile" className="text-sm font-medium">
                    Tipo
                  </Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => onFilterChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="sobrado">Sobrado</SelectItem>
                      <SelectItem value="kitnet">Kitnet</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location-mobile" className="text-sm font-medium">
                    Localização
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location-mobile"
                      placeholder="Bairro ou cidade"
                      value={filters.location}
                      onChange={(e) => onFilterChange("location", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPrice-mobile" className="text-sm font-medium">
                      Preço Mínimo
                    </Label>
                    <Input
                      id="minPrice-mobile"
                      placeholder="Ex: 200.000"
                      value={formatNumberWithDots(filters.minPrice)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        onFilterChange("minPrice", rawValue);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPrice-mobile" className="text-sm font-medium">
                      Preço Máximo
                    </Label>
                    <Input
                      id="maxPrice-mobile"
                      placeholder="Ex: 500.000"
                      value={formatNumberWithDots(filters.maxPrice)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        onFilterChange("maxPrice", rawValue);
                      }}
                    />
                  </div>
                </div>

                {/* Advanced Filters Toggle */}
                <Button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  variant="ghost"
                  className="w-full"
                >
                  Filtros Avançados {showAdvanced ? '▲' : '▼'}
                </Button>

                {/* Advanced Filters */}
                {showAdvanced && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Quartos</Label>
                        <Select
                          value={filters.bedrooms}
                          onValueChange={(value) => onFilterChange("bedrooms", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer" />
                          </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Banheiros</Label>
                        <Select
                          value={filters.bathrooms}
                          onValueChange={(value) => onFilterChange("bathrooms", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer" />
                          </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Qualquer</SelectItem>
                          <SelectItem value="1">1+</SelectItem>
                          <SelectItem value="2">2+</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                        </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Área Mín (m²)</Label>
                        <Input
                          placeholder="Ex: 50"
                          value={filters.minArea}
                          onChange={(e) => onFilterChange("minArea", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Área Máx (m²)</Label>
                        <Input
                          placeholder="Ex: 200"
                          value={filters.maxArea}
                          onChange={(e) => onFilterChange("maxArea", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Vagas</Label>
                        <Select
                          value={filters.parkingSpots}
                          onValueChange={(value) => onFilterChange("parkingSpots", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer" />
                          </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Condomínio Máx</Label>
                        <Input
                          placeholder="Ex: 500"
                          value={formatNumberWithDots(filters.maxCondoFee)}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, "");
                            onFilterChange("maxCondoFee", rawValue);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={onClearFilters}
                  variant="outline"
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Desktop: Always visible */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-montserrat font-semibold text-primary">
              Filtrar Imóveis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-sm font-medium">
                Finalidade
              </Label>
              <Select
                value={filters.purpose}
                onValueChange={(value) => onFilterChange("purpose", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="aluguel">Aluguel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Tipo
              </Label>
              <Select
                value={filters.type}
                onValueChange={(value) => onFilterChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="sobrado">Sobrado</SelectItem>
                  <SelectItem value="kitnet">Kitnet</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="terreno">Terreno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Localização
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Bairro ou cidade"
                  value={filters.location}
                  onChange={(e) => onFilterChange("location", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPrice" className="text-sm font-medium">
                Preço Mínimo
              </Label>
              <Input
                id="minPrice"
                placeholder="Ex: 200.000"
                value={formatNumberWithDots(filters.minPrice)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  onFilterChange("minPrice", rawValue);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice" className="text-sm font-medium">
                Preço Máximo
              </Label>
              <Input
                id="maxPrice"
                placeholder="Ex: 500.000"
                value={formatNumberWithDots(filters.maxPrice)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  onFilterChange("maxPrice", rawValue);
                }}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mt-6">
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="ghost"
              className="mb-4"
            >
              Filtros Avançados {showAdvanced ? '▲' : '▼'}
            </Button>
            
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 p-6 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quartos</Label>
                  <Select
                    value={filters.bedrooms}
                    onValueChange={(value) => onFilterChange("bedrooms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Banheiros</Label>
                  <Select
                    value={filters.bathrooms}
                    onValueChange={(value) => onFilterChange("bathrooms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Área Mín (m²)</Label>
                  <Input
                    placeholder="Ex: 50"
                    value={filters.minArea}
                    onChange={(e) => onFilterChange("minArea", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Área Máx (m²)</Label>
                  <Input
                    placeholder="Ex: 200"
                    value={filters.maxArea}
                    onChange={(e) => onFilterChange("maxArea", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vagas</Label>
                  <Select
                    value={filters.parkingSpots}
                    onValueChange={(value) => onFilterChange("parkingSpots", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Condomínio Máx</Label>
                  <Input
                    placeholder="Ex: 500"
                    value={formatNumberWithDots(filters.maxCondoFee)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "");
                      onFilterChange("maxCondoFee", rawValue);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="flex-1 md:flex-none"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}