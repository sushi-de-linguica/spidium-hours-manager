import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const IntegrationCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  children,
  footer,
  className,
}: IntegrationCardProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 animate-scale-in",
        "border border-border/40 shadow-subtle hover:shadow-elevation",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-md flex items-center justify-center",
              iconColor
                ? `bg-${iconColor}/10 text-${iconColor}`
                : "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-medium">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
      {footer && (
        <CardFooter className="flex justify-end border-t bg-muted/30 py-3 px-6">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default IntegrationCard;
