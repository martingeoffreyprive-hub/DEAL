"use client";

import { ReactNode, isValidElement } from "react";
import { motion } from "framer-motion";
import { DealIconD } from "./DealIconD";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DealEmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon | ReactNode;
  showBrandIcon?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  } | ReactNode;
  className?: string;
}

export function DealEmptyState({
  title,
  description,
  icon,
  showBrandIcon = true,
  action,
  className,
}: DealEmptyStateProps) {
  // Render icon based on type
  const renderIcon = () => {
    if (!icon) {
      return <DealIconD size="lg" variant="primary" />;
    }

    // If it's a function (LucideIcon), render it as a component
    if (typeof icon === "function") {
      const IconComponent = icon as LucideIcon;
      return <IconComponent className="h-10 w-10 text-muted-foreground" />;
    }

    // If it's a valid React element, render it directly
    if (isValidElement(icon)) {
      return icon;
    }

    // Fallback to default icon
    return <DealIconD size="lg" variant="primary" />;
  };

  // Render action based on type
  const renderAction = () => {
    if (!action) return null;

    // If it's a valid React element, render it directly
    if (isValidElement(action)) {
      return action;
    }

    // If it's an object with label and onClick, render as Button
    if (typeof action === "object" && action !== null && "label" in action && "onClick" in action) {
      const actionObj = action as { label: string; onClick: () => void };
      return (
        <Button onClick={actionObj.onClick} className="gap-2">
          {actionObj.label}
        </Button>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {/* Icon Container */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="relative mb-6"
      >
        {showBrandIcon && (
          <div className="absolute -top-2 -right-2 opacity-30">
            <DealIconD size="sm" variant="primary" />
          </div>
        )}
        <div className="p-4 rounded-full bg-muted">
          {renderIcon()}
        </div>
      </motion.div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="max-w-md"
      >
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
      </motion.div>

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {renderAction()}
        </motion.div>
      )}
    </motion.div>
  );
}
