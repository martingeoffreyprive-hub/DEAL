"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QUOTE_STATUSES, type QuoteStatus } from "@/types/database";
import { useLocaleContext } from "@/contexts/locale-context";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_email?: string;
  status: QuoteStatus;
  total: number;
  created_at: string;
  sector?: string;
}

interface QuoteCarouselProps {
  quotes: Quote[];
  title?: string;
  emptyMessage?: string;
}

export function QuoteCarousel({
  quotes,
  title = "Devis récents",
  emptyMessage = "Aucun devis pour le moment",
}: QuoteCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { formatCurrency, formatDate } = useLocaleContext();

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 280; // Approximate card width + gap
    const scrollAmount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const getStatusConfig = (status: QuoteStatus) => {
    switch (status) {
      case "draft":
        return {
          icon: Clock,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
        };
      case "sent":
        return {
          icon: Send,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
        };
      case "accepted":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
        };
      default:
        return {
          icon: FileText,
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
        };
    }
  };

  if (quotes.length === 0) {
    return null;
  }

  return (
    <div className="relative max-w-full overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Link href="/quotes">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Voir tout
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <AnimatePresence>
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              aria-label="Défiler à gauche"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right Arrow */}
        <AnimatePresence>
          {showRightArrow && quotes.length > 3 && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              aria-label="Défiler à droite"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Gradient Overlays */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none" />
        )}
        {showRightArrow && quotes.length > 3 && (
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none" />
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {quotes.map((quote, index) => {
            const statusConfig = getStatusConfig(quote.status);
            const StatusIcon = statusConfig.icon;
            const isHovered = hoveredId === quote.id;

            return (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px]"
                onMouseEnter={() => setHoveredId(quote.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link href={`/quotes/${quote.id}`}>
                  <Card
                    className={cn(
                      "h-full transition-all duration-300 overflow-hidden",
                      "hover:shadow-xl hover:shadow-primary/5",
                      "border-2",
                      isHovered ? statusConfig.borderColor : "border-transparent"
                    )}
                  >
                    {/* Status Bar */}
                    <div
                      className={cn(
                        "h-1 transition-all duration-300",
                        isHovered ? statusConfig.bgColor.replace("/10", "/50") : statusConfig.bgColor
                      )}
                    />

                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            statusConfig.bgColor
                          )}
                        >
                          <StatusIcon className={cn("w-5 h-5", statusConfig.color)} />
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            statusConfig.color,
                            statusConfig.borderColor,
                            statusConfig.bgColor
                          )}
                        >
                          {QUOTE_STATUSES[quote.status]}
                        </Badge>
                      </div>

                      {/* Client & Quote Number */}
                      <div className="mb-3">
                        <h4 className="font-semibold text-sm truncate">
                          {quote.client_name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {quote.quote_number}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-[#252B4A] dark:text-white">
                            {formatCurrency(Number(quote.total))}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(quote.created_at)}
                          </p>
                        </div>

                        {/* Hover Action */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: isHovered ? 1 : 0,
                            scale: isHovered ? 1 : 0.8,
                          }}
                          className="flex items-center gap-1 text-xs text-primary"
                        >
                          <Eye className="w-3 h-3" />
                          Voir
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}

          {/* "Create New" Card at the end */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: quotes.length * 0.05 }}
            className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px]"
          >
            <Link href="/quotes/new">
              <Card className="h-full border-2 border-dashed border-[#E85A5A]/30 hover:border-[#E85A5A]/60 transition-colors bg-[#E85A5A]/5 hover:bg-[#E85A5A]/10">
                <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center min-h-[160px]">
                  <div className="w-12 h-12 rounded-full bg-[#E85A5A]/10 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-[#E85A5A]" />
                  </div>
                  <p className="font-medium text-[#E85A5A]">Nouveau devis</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Créer un devis rapidement
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
