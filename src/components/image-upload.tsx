import type React from "react";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IFile } from "@/domain";

interface ImageUploadProps {
  currentImage: any | null | undefined;
  onImageUpload: (file: IFile | null) => void;
}

export function ImageUpload({ currentImage, onImageUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size should not exceed 2MB");
      return;
    }

    // In a real app, you would upload the file to your server or cloud storage
    // For this example, we'll create a local URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newFile: any = {
          name: file.name,
          url: e.target.result as string,
          type: file.type,
          size: file.size,
        };
        onImageUpload(newFile);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    onImageUpload(null);
  };

  return (
    <div className="w-full">
      {currentImage ? (
        <div className="relative w-32 h-32">
          <img
            src={currentImage.url || "/placeholder.svg"}
            alt="Profile"
            className="w-full h-full object-cover rounded-md"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              Drag and drop an image, or{" "}
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer text-primary hover:underline"
              >
                <span>browse</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF up to 2MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
