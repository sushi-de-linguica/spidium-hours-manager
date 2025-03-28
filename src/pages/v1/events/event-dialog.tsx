import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IEvent } from "@/domain";
import { Import } from "lucide-react";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent | null;
  onSave: (event: IEvent) => void;
}

export function EventDialog({
  isOpen,
  onClose,
  event,
  onSave,
}: EventDialogProps) {
  const [formData, setFormData] = useState<IEvent>({
    name: "",
    scheduleLink: "",
    runs: [],
    created_at: new Date(),
    updated_at: null,
    deleted_at: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        scheduleLink: event.scheduleLink || "",
      });
    } else {
      setFormData({
        name: "",
        scheduleLink: "",
        runs: [],
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const handleChange = (field: keyof IEvent, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || !formData.name?.trim()) {
      newErrors.name = "Nome do evento é obrigatório";
    }

    if (
      formData.scheduleLink &&
      !/^https?:\/\/.+/.test(formData.scheduleLink)
    ) {
      newErrors.scheduleLink =
        "O link da agenda precisa começar com http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({
        ...formData,
        id: event?.id,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {event ? `Editar ${event.name}` : "Adicionar novo evento"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="col-span-3"
                placeholder="24 horas de spidium #123"
              />
              {errors.name && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-4">
              <div className="w-full">
                <Label htmlFor="scheduleLink" className="text-right">
                  Link da agenda
                </Label>
                <div className="w-full flex flex-row gap-2">
                  <Input
                    id="scheduleLink"
                    value={formData.scheduleLink}
                    onChange={(e) =>
                      handleChange("scheduleLink", e.target.value)
                    }
                    className="w-full"
                    placeholder="https://horaro.org/yourevent/2023"
                  />
                  <Button>
                    <Import /> Importar
                  </Button>
                </div>
              </div>
              <div>
                {errors.scheduleLink && (
                  <p className="col-span-3 col-start-2 text-sm text-red-500">
                    {errors.scheduleLink}
                  </p>
                )}
              </div>
              <div className="col-span-3 col-start-2 text-xs text-muted-foreground">
                Opcional: Link da agenda, caso utilize do HORARO você pode
                importar as runs de forma simplificada.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
