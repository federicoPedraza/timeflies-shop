"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Copy, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface CopyIdButtonProps {
  orderId: string;
  className?: string;
}

export function CopyIdButton({ orderId, className }: CopyIdButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className={`h-8 w-8 p-0 ${className}`}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "¡Copiado!" : "Copiar ID"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
