"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IMember, IMemberImage } from "@/domain";
import { IFile } from "@/domain/file.interface";
import { ImageUpload } from "@/components/image-upload";
import { randomUUID } from "crypto";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB } from "@/constants/file";

interface MemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: IMember | null;
  onSave: (member: IMember) => void;
}

export function MemberDialog({
  isOpen,
  onClose,
  member,
  onSave,
}: MemberDialogProps) {
  const [formData, setFormData] = useState<IMember>({
    gender: "",
    name: "",
    primaryTwitch: "",
    secondaryTwitch: "",
    streamAt: "primary",
    link: "",
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (member) {
      const memberData = {
        ...member,
        streamAt: member.streamAt === member.primaryTwitch ? "primary" : "secondary"
      };
      setFormData(memberData);
    } else {
      setFormData({
        gender: "",
        name: "",
        primaryTwitch: "",
        secondaryTwitch: "",
        streamAt: "primary",
        link: "",
        images: [],
      });
    }
    setErrors({});
  }, [member, isOpen]);

  const handleChange = (field: keyof IMember, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleAddImage = async () => {
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    // Add it to the document
    document.body.appendChild(input);

    // Trigger the file selection dialog
    input.click();

    // Handle the file selection
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }

      // Check if file is an image
      if (!file.type.match("image.*")) {
        alert("Por favor, selecione um arquivo de imagem");
        document.body.removeChild(input);
        return;
      }

      // Check file size (limit to 10MB)
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        alert(`O tamanho do arquivo não deve exceder ${MAX_IMAGE_SIZE_MB}MB`);
        document.body.removeChild(input);
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newFile: IFile = {
            type: file.type,
            path: file.name,
            lastModified: file.lastModified,
            base64: e.target.result as string,
          };

          // Add the new image
          setFormData(prev => ({
            ...prev,
            images: [
              ...(prev.images || []),
              {
                id: randomUUID(),
                name: file.name.split('.')[0], // Use filename as default name
                file: newFile,
              },
            ],
          }));
        }
        document.body.removeChild(input);
      };
      reader.readAsDataURL(file);
    };
  };

  const handleRemoveImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter(img => img.id !== imageId) || [],
    }));
  };

  const handleImageNameChange = (imageId: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.map(img => {
        if (img.id === imageId) {
          return { ...img, name };
        }
        return img;
      }),
    }));
  };

  const handleImageUpload = (imageId: string, file: IFile | null) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.map(img => {
        if (img.id === imageId) {
          return {
            ...img,
            file: file || {
              type: "",
              path: "",
              lastModified: 0,
              base64: "",
            }
          };
        }
        return img;
      }),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (formData.streamAt === "primary" && !formData.primaryTwitch) {
      newErrors.primaryTwitch =
        "Twitch primária é obrigatória quando selecionada como fonte de stream";
    }

    if (formData.streamAt === "secondary" && !formData.secondaryTwitch) {
      newErrors.secondaryTwitch =
        "Twitch secundária é obrigatória quando selecionada como fonte de stream";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const memberToSave = {
        ...formData,
        streamAt: formData.streamAt === "primary" ? formData.primaryTwitch : formData.secondaryTwitch
      };
      onSave(memberToSave);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {member ? `Editando ${member.name}` : "Adicionar membro"}
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
              />
              {errors.name && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Pronome
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: any) => handleChange("gender", value)}
              >
                <SelectTrigger id="gender" className="col-span-3">
                  <SelectValue placeholder="Selecione o pronome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ele/dele">ele/dele</SelectItem>
                  <SelectItem value="ela/dela">ela/dela</SelectItem>
                  <SelectItem value="elu/delu">elu/delu</SelectItem>
                  <SelectItem value="ile/dile">ile/dile</SelectItem>
                  <SelectItem value="other">other</SelectItem>
                </SelectContent>
              </Select>

              {errors.gender && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.gender}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="primaryTwitch" className="text-right">
                Twitch Primária (nome do usuário apenas)
              </Label>
              <Input
                id="primaryTwitch"
                value={formData.primaryTwitch || ""}
                onChange={(e) => handleChange("primaryTwitch", e.target.value)}
                className="col-span-3"
                placeholder="twitchusername"
              />
              {errors.primaryTwitch && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.primaryTwitch}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secondaryTwitch" className="text-right">
                Twitch Secundária (nome do usuário apenas)
              </Label>
              <Input
                id="secondaryTwitch"
                value={formData.secondaryTwitch || ""}
                onChange={(e) =>
                  handleChange("secondaryTwitch", e.target.value)
                }
                className="col-span-3"
                placeholder="twitchusername"
              />
              {errors.secondaryTwitch && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.secondaryTwitch}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="streamAt" className="text-right">
                Vai fazer stream em
              </Label>
              <Select
                value={formData.streamAt || "primary"}
                onValueChange={(value: "primary" | "secondary") => {
                  if (!value) {
                    return;
                  }
                  const twitchsBySource: Record<
                    "primary" | "secondary",
                    string | undefined
                  > = {
                    primary: formData.primaryTwitch,
                    secondary: formData.secondaryTwitch,
                  };

                  const selectedTwitch = twitchsBySource[value];

                  if (!selectedTwitch) {
                    return;
                  }

                  handleChange("streamAt", value);
                }}
                disabled={!formData.primaryTwitch && !formData.secondaryTwitch}
              >
                <SelectTrigger id="streamAt" className="col-span-3">
                  <SelectValue placeholder="Select stream source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="primary"
                    disabled={!formData.primaryTwitch}
                  >
                    Twitch Primária
                  </SelectItem>
                  <SelectItem
                    value="secondary"
                    disabled={!formData.secondaryTwitch}
                  >
                    Twitch Secundária
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">
                Link
              </Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => handleChange("link", e.target.value)}
                className="col-span-3"
                placeholder="https://example.com or https://linktr.ee/username"
              />
              {errors.link && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.link}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4" />
                  <Label>Imagens</Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddImage}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar imagem
                </Button>
              </div>

              <div className="space-y-4">
                {formData.images?.map((image) => (
                  <div key={image.id} className="flex items-start gap-4">
                    <div className="flex-1 flex items-center gap-4">
                      <ImageUpload
                        currentImage={image.file}
                        onImageUpload={(file) =>
                          handleImageUpload(image.id, file)
                        }
                      />
                      <div className="flex flex-row items-center gap-4 mb-2 w-full">
                        <Label htmlFor={`image-name-${image.id}`} className="text-right">
                          Nome da imagem
                        </Label>
                        <Input
                          id={`image-name-${image.id}`}
                          value={image.name}
                          onChange={(e) =>
                            handleImageNameChange(image.id, e.target.value)
                          }
                          className="col-span-3"
                          placeholder="Nome para exportação"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
