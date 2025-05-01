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
import { IMember } from "@/domain";
import { ImageUpload } from "@/components/image-upload";

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
    imageFile: null,
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
        imageFile: null,
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

  const handleImageUpload = (file: any | null) => {
    setFormData({ ...formData, imageFile: file });
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
      <DialogContent className="sm:max-w-[500px]">
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
                onValueChange={(value: any) => {
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
                Link <span className="text-red-500">*</span>
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

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Profile Image</Label>
              <div className="col-span-3">
                <ImageUpload
                  currentImage={formData.imageFile}
                  onImageUpload={handleImageUpload}
                />
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
