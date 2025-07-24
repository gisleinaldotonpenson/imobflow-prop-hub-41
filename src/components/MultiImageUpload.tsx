import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Upload, GripVertical, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DraggableImageItemProps {
  id: string;
  imageUrl: string;
  room?: string;
  onRoomChange: (room: string) => void;
  index: number;
  onRemove: () => void;
  isPrimary: boolean;
}

interface DraggableImageItemProps {
  id: string;
  imageUrl: string;
  room?: string;
  onRoomChange: (room: string) => void;
  index: number;
  onRemove: () => void;
  isPrimary: boolean;
  availableRooms: string[];
}

function DraggableImageItem({ id, imageUrl, room, onRoomChange, index, onRemove, isPrimary, availableRooms }: DraggableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const roomOptions = ['Não especificado', ...availableRooms];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-move bg-white rounded-lg border shadow-sm"
      {...attributes}
      {...listeners}
    >
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={`Imagem ${index + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      
      {/* Drag handle */}
      <div className="absolute top-2 left-2 bg-black/60 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3 h-3 text-white" />
      </div>
      
      {/* Remove button */}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </Button>
      
      {/* Primary badge */}
      {isPrimary && (
        <Badge className="absolute bottom-10 left-2 text-xs bg-primary hover:bg-primary">
          <Star className="w-3 h-3 mr-1" />
          Capa
        </Badge>
      )}
      
      {/* Position indicator */}
      <div className="absolute bottom-10 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
      
      {/* Room select */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Select value={room || ''} onValueChange={onRoomChange}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Ambiente" />
          </SelectTrigger>
          <SelectContent>
            {roomOptions.map((opt) => (
              <SelectItem key={opt} value={opt === 'Não especificado' ? '' : opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface MultiImageUploadProps {
  images: { url: string; room?: string }[];
  onImagesChange: (images: { url: string; room?: string }[]) => void;
  maxImages?: number;
  availableRooms?: string[];
}

export function MultiImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 15,
  availableRooms = ['Não especificado', 'Sala de Estar', 'Cozinha', 'Quarto', 'Banheiro', 'Varanda', 'Garagem', 'Área Externa', 'Outros']
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Para desenvolvimento, simular upload local
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          // Simular delay de upload
          setTimeout(() => {
            resolve(dataUrl);
          }, 500);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Muitas imagens",
        description: `Você pode adicionar apenas ${remainingSlots} imagem(ns) a mais. Máximo total: ${maxImages} imagens.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast({
          title: "Arquivo inválido",
          description: `${file.name} não é uma imagem válida.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} é maior que 5MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    const newImageUrls: { url: string; room?: string }[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const file of validFiles) {
      const url = await uploadImage(file);
      if (url) {
        newImageUrls.push({ url });
        successCount++;
      } else {
        errorCount++;
      }
    }

    if (newImageUrls.length > 0) {
      onImagesChange([...images, ...newImageUrls]);
    }

    // Show results
    if (successCount > 0 && errorCount === 0) {
      toast({
        title: "Upload concluído!",
        description: `${successCount} imagem(ns) adicionada(s) com sucesso.`,
      });
    } else if (successCount > 0 && errorCount > 0) {
      toast({
        title: "Upload parcialmente concluído",
        description: `${successCount} imagem(ns) enviada(s), ${errorCount} falharam.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload de nenhuma imagem.",
        variant: "destructive",
      });
    }

    setUploading(false);
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRoomChange = (imageUrl: string, room: string) => {
    const newImages = images.map(img => 
      img.url === imageUrl ? { ...img, room: room === '' ? undefined : room } : img
    );
    onImagesChange(newImages);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
    toast({
      title: "Imagem removida",
      description: "A imagem foi removida com sucesso.",
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((_, index) => index.toString() === active.id);
      const newIndex = images.findIndex((_, index) => index.toString() === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(images, oldIndex, newIndex);
        onImagesChange(newImages);
        
        toast({
          title: "Ordem atualizada",
          description: "A ordem das imagens foi atualizada.",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {images.length < maxImages && (
        <div className="space-y-3">
          <Label htmlFor="imageUpload">
            {images.length === 0 ? 'Adicionar Imagens' : `Adicionar Mais Imagens (${images.length}/${maxImages})`}
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById('imageUpload')?.click()}
              className="mb-3"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Fazendo upload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Escolher da Galeria
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mb-1">
              Selecione até {maxImages - images.length} imagens de uma vez
            </p>
            <p className="text-xs text-gray-400">
              Formatos: JPG, PNG, GIF. Máximo: 5MB por imagem
            </p>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Imagens do Imóvel ({images.length}/{maxImages})
            </Label>
            <p className="text-sm text-muted-foreground">
              Arraste para reordenar • Primeira imagem é a capa
            </p>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((_, index) => index.toString())}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <DraggableImageItem
                    key={index}
                    id={index.toString()}
                    imageUrl={image.url}
                    room={image.room}
                    onRoomChange={(newRoom) => {
                      const newImages = [...images];
                      newImages[index] = { ...newImages[index], room: newRoom === '' ? undefined : newRoom };
                      onImagesChange(newImages);
                    }}
                    index={index}
                    onRemove={() => {
                      const newImages = [...images];
                      newImages.splice(index, 1);
                      onImagesChange(newImages);
                    }}
                    isPrimary={index === 0}
                    availableRooms={availableRooms}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {images.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 mb-2">Nenhuma imagem adicionada</p>
              <p className="text-xs text-gray-400">
                A primeira imagem será a capa do imóvel
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}