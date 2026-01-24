"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { getAllLocalePacks, type LocaleCode } from "@/lib/locale-packs";

interface LocaleSelectorProps {
  showLabel?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function LocaleSelector({
  showLabel = false,
  size = "default",
  className = "",
}: LocaleSelectorProps) {
  const { locale, setLocale } = useLocale();
  const allLocales = getAllLocalePacks();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <Globe className="h-4 w-4 text-muted-foreground" />
      )}
      <Select value={locale} onValueChange={(v) => setLocale(v as LocaleCode)}>
        <SelectTrigger className={size === "sm" ? "h-8 w-32 text-xs" : "w-40"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allLocales.map((pack) => (
            <SelectItem key={pack.code} value={pack.code}>
              <span className="flex items-center gap-2">
                <span>{pack.flag}</span>
                <span>{pack.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
