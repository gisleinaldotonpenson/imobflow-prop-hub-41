import React from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, GripVertical } from 'lucide-react';

interface DraggableImageItemProps {
  id: string;
  preview: string;
  index: number;
  onRemove: () => void;
  isPrimary: boolean;
}

function DraggableImageItem({ id, preview, index, onRemove, isPrimary }: DraggableImageItemProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-move"
      {...attributes}
      {...listeners}
    >
      <div className="relative">
        <img
          src={preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-32 object-cover rounded-lg border"
        />
        
        {/* Drag handle */}
        <div className="absolute top-1 left-1 bg-black/60 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </Button>
        
        {/* Primary badge */}
        {isPrimary && (
          <Badge className="absolute bottom-1 left-1 text-xs">
            Principal
          </Badge>
        )}
      </div>
    </div>
  );
}

interface DraggableImageListProps {
  images: File[];
  imagePreviews: string[];
  onReorder: (newImages: File[], newPreviews: string[]) => void;
  onRemove: (index: number) => void;
}

export function DraggableImageList({ 
  images, 
  imagePreviews, 
  onReorder, 
  onRemove 
}: DraggableImageListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = imagePreviews.findIndex((_, index) => index.toString() === active.id);
      const newIndex = imagePreviews.findIndex((_, index) => index.toString() === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(images, oldIndex, newIndex);
        const newPreviews = arrayMove(imagePreviews, oldIndex, newIndex);
        onReorder(newImages, newPreviews);
      }
    }
  };

  if (imagePreviews.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={imagePreviews.map((_, index) => index.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagePreviews.map((preview, index) => (
            <DraggableImageItem
              key={index}
              id={index.toString()}
              preview={preview}
              index={index}
              onRemove={() => onRemove(index)}
              isPrimary={index === 0}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}