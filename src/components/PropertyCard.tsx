import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Bed, Bath, Square, MapPin, MessageCircle, Eye, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatArea } from "@/lib/formatters";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    type: string;
    purpose: string;
    image: string;
    images?: string[];
    image_url?: string;
  };
  onWhatsAppClick: () => void;
}

export function PropertyCard({
  property,
  onWhatsAppClick,
}: PropertyCardProps) {
  const {
    id,
    title,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
    type,
    purpose,
    image,
  } = property;


  return (
    <Card className="overflow-hidden hover-lift transition-smooth animate-fade-in shadow-card flex flex-col">
      <div className="relative">
        <img
          src={(property.images && property.images.length > 0 ? property.images[0] : property.image_url) || property.image || "/placeholder.svg"}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <Badge
          variant={purpose === "venda" ? "default" : "secondary"}
          className="absolute top-2 left-2 sm:top-3 sm:left-3 font-montserrat text-xs"
        >
          {purpose === "venda" ? "Venda" : "Aluguel"}
        </Badge>
        <Badge
          variant="outline"
          className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm text-xs"
        >
          {type}
        </Badge>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-montserrat font-semibold text-lg mb-2 text-primary line-clamp-2">
            {title}
          </h3>
          
          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">{location}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground mb-4 gap-4">
            <div className="flex items-center min-w-0">
              <Bed className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{bedrooms}</span>
            </div>
            <div className="flex items-center min-w-0">
              <Bath className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{bathrooms}</span>
            </div>
            <div className="flex items-center min-w-0">
              <Square className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{formatArea(area)}</span>
            </div>
          </div>
        </div>

        <div className="text-2xl font-montserrat font-bold text-primary">
          {formatCurrency(price)}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            onClick={onWhatsAppClick}
            variant="default"
            className="flex-1 font-montserrat bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Link to={`/property/${id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full font-montserrat"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Detalhes
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}