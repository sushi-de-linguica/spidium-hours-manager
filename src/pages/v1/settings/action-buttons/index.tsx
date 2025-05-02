import React, { useState } from 'react';
import { useFileStore } from '@/stores';
import { IFileTag } from '@/domain';
import { ActionForm } from '../components/action-form';
import { Plus, Edit2, Trash2, GripVertical, Save, RotateCcw } from 'lucide-react';
import { getDefaultActionButtons } from './default_actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFile } from '@/hooks/use-file';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";

interface SortableActionButtonProps {
  tag: IFileTag;
  onEdit: (tag: IFileTag) => void;
  onDelete: (tag: IFileTag) => void;
}

function SortableActionButton({ tag, onEdit, onDelete }: SortableActionButtonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: tag.id as UniqueIdentifier });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 hover:bg-muted rounded"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">{tag.label}</h3>
          <p className="text-sm text-muted-foreground">
            {tag.description || 'No description'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(tag)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(tag)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const ActionButtonsSettings = () => {
  const { filesStore, removeTag, updateTagOrder, setState } = useFile();
  const [selectedAction, setSelectedAction] = useState<IFileTag | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<IFileTag | null>(null);
  const [orderedTags, setOrderedTags] = useState<IFileTag[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    setOrderedTags(filesStore.tags);
  }, [filesStore.tags]);

  const handleEdit = (action: IFileTag) => {
    setSelectedAction(action);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setSelectedAction(null);
    setIsFormOpen(false);
  };

  const handleDeleteClick = (action: IFileTag) => {
    setActionToDelete(action);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (actionToDelete) {
      removeTag(actionToDelete);
      setActionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setActionToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedTags((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newItems;
      });
    }
  };

  const handleSaveOrder = () => {
    updateTagOrder(orderedTags);
    setHasChanges(false);
    toast.success("Action buttons order saved successfully");
  };

  const handleResetToDefault = () => {
    const defaultTags = getDefaultActionButtons();
    setState({ tags: defaultTags });
    setOrderedTags(defaultTags);
    setResetDialogOpen(false);
    toast.success("Action buttons reset to default successfully");
  };

  return (
    <div className="container mx-auto md:gap-8 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Botões de ação</h1>
        <div className="flex w-full sm:w-auto gap-4">
          <Button
            variant="outline"
            onClick={() => setResetDialogOpen(true)}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Resetar botões de ação
          </Button>
          <ActionForm
            showEditMode={isFormOpen}
            action={selectedAction}
            onClose={handleClose}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4 flex flex-col gap-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedTags.map((tag) => tag.id as UniqueIdentifier)}
              strategy={verticalListSortingStrategy}
            >
              {orderedTags.map((tag) => (
                <SortableActionButton
                  key={tag.id}
                  tag={tag}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {hasChanges && (
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveOrder} className="gap-2">
            <Save className="h-4 w-4" />
            Save Order
          </Button>
        </div>
      )}

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar botões de ação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja resetar todos os botões de ação para o estado padrão? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleResetToDefault}>
              Resetar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Action Button</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this action button? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActionButtonsSettings; 