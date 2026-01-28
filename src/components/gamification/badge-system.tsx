"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Zap,
  Target,
  Crown,
  Rocket,
  Medal,
  Award,
  Flame,
  TrendingUp,
  Users,
  FileCheck,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Badge definitions
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: "quotes" | "clients" | "speed" | "consistency" | "special";
  tier: "bronze" | "silver" | "gold" | "platinum";
  requirement: number;
  requirementLabel: string;
}

export const BADGES: BadgeDefinition[] = [
  // Quotes badges
  {
    id: "first-quote",
    name: "Premier Pas",
    description: "Créer votre premier devis",
    icon: Star,
    category: "quotes",
    tier: "bronze",
    requirement: 1,
    requirementLabel: "1 devis créé",
  },
  {
    id: "quotes-10",
    name: "Lancé",
    description: "Créer 10 devis",
    icon: Rocket,
    category: "quotes",
    tier: "bronze",
    requirement: 10,
    requirementLabel: "10 devis créés",
  },
  {
    id: "quotes-50",
    name: "Productif",
    description: "Créer 50 devis",
    icon: TrendingUp,
    category: "quotes",
    tier: "silver",
    requirement: 50,
    requirementLabel: "50 devis créés",
  },
  {
    id: "quotes-100",
    name: "Expert",
    description: "Créer 100 devis",
    icon: Medal,
    category: "quotes",
    tier: "gold",
    requirement: 100,
    requirementLabel: "100 devis créés",
  },
  {
    id: "quotes-500",
    name: "Légende",
    description: "Créer 500 devis",
    icon: Crown,
    category: "quotes",
    tier: "platinum",
    requirement: 500,
    requirementLabel: "500 devis créés",
  },
  // Signed quotes badges
  {
    id: "first-signed",
    name: "Première Victoire",
    description: "Faire signer votre premier devis",
    icon: Trophy,
    category: "quotes",
    tier: "bronze",
    requirement: 1,
    requirementLabel: "1 devis signé",
  },
  {
    id: "signed-25",
    name: "Négociateur",
    description: "Faire signer 25 devis",
    icon: FileCheck,
    category: "quotes",
    tier: "silver",
    requirement: 25,
    requirementLabel: "25 devis signés",
  },
  {
    id: "signed-100",
    name: "Closer",
    description: "Faire signer 100 devis",
    icon: Target,
    category: "quotes",
    tier: "gold",
    requirement: 100,
    requirementLabel: "100 devis signés",
  },
  // Speed badges
  {
    id: "speed-demon",
    name: "Éclair",
    description: "Créer un devis en moins de 2 minutes",
    icon: Zap,
    category: "speed",
    tier: "silver",
    requirement: 1,
    requirementLabel: "Devis en < 2min",
  },
  {
    id: "daily-5",
    name: "Machine",
    description: "Créer 5 devis en une journée",
    icon: Flame,
    category: "speed",
    tier: "gold",
    requirement: 5,
    requirementLabel: "5 devis/jour",
  },
  // Consistency badges
  {
    id: "streak-7",
    name: "Régulier",
    description: "Utiliser DEAL 7 jours consécutifs",
    icon: Clock,
    category: "consistency",
    tier: "bronze",
    requirement: 7,
    requirementLabel: "7 jours d'affilée",
  },
  {
    id: "streak-30",
    name: "Dévoué",
    description: "Utiliser DEAL 30 jours consécutifs",
    icon: Award,
    category: "consistency",
    tier: "gold",
    requirement: 30,
    requirementLabel: "30 jours d'affilée",
  },
  // Client badges
  {
    id: "clients-10",
    name: "Réseau",
    description: "Avoir 10 clients différents",
    icon: Users,
    category: "clients",
    tier: "bronze",
    requirement: 10,
    requirementLabel: "10 clients",
  },
  {
    id: "clients-50",
    name: "Connecté",
    description: "Avoir 50 clients différents",
    icon: Users,
    category: "clients",
    tier: "silver",
    requirement: 50,
    requirementLabel: "50 clients",
  },
  // Special badges
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Inscrit pendant la phase beta",
    icon: Sparkles,
    category: "special",
    tier: "platinum",
    requirement: 1,
    requirementLabel: "Membre beta",
  },
];

// Tier colors and styles
const TIER_STYLES = {
  bronze: {
    bg: "bg-amber-700/20",
    border: "border-amber-700/40",
    text: "text-amber-700",
    icon: "text-amber-600",
    glow: "shadow-amber-500/20",
  },
  silver: {
    bg: "bg-gray-400/20",
    border: "border-gray-400/40",
    text: "text-gray-500",
    icon: "text-gray-400",
    glow: "shadow-gray-400/20",
  },
  gold: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/40",
    text: "text-yellow-600",
    icon: "text-yellow-500",
    glow: "shadow-yellow-500/30",
  },
  platinum: {
    bg: "bg-purple-500/20",
    border: "border-purple-500/40",
    text: "text-purple-500",
    icon: "text-purple-400",
    glow: "shadow-purple-500/30",
  },
};

interface UserBadge {
  badgeId: string;
  earnedAt: string;
  progress?: number;
}

interface BadgeCardProps {
  badge: BadgeDefinition;
  userBadge?: UserBadge;
  showProgress?: boolean;
  currentProgress?: number;
}

export function BadgeCard({ badge, userBadge, showProgress = false, currentProgress = 0 }: BadgeCardProps) {
  const isEarned = !!userBadge;
  const tierStyle = TIER_STYLES[badge.tier];
  const Icon = badge.icon;
  const progress = Math.min((currentProgress / badge.requirement) * 100, 100);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-4 rounded-xl border-2 transition-all",
        isEarned
          ? `${tierStyle.bg} ${tierStyle.border} shadow-lg ${tierStyle.glow}`
          : "bg-muted/30 border-muted-foreground/10 opacity-60"
      )}
    >
      {/* Locked overlay */}
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50 backdrop-blur-[1px]">
          <Lock className="w-6 h-6 text-muted-foreground/50" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isEarned ? tierStyle.bg : "bg-muted"
          )}
        >
          <Icon className={cn("w-6 h-6", isEarned ? tierStyle.icon : "text-muted-foreground")} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn("font-semibold truncate", isEarned ? tierStyle.text : "text-muted-foreground")}>
              {badge.name}
            </h4>
            {isEarned && (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {badge.description}
          </p>

          {/* Progress bar */}
          {showProgress && !isEarned && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{currentProgress} / {badge.requirement}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* Earned date */}
          {isEarned && userBadge && (
            <p className="text-xs text-muted-foreground mt-1">
              Obtenu le {new Date(userBadge.earnedAt).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
      </div>

      {/* Tier badge */}
      <Badge
        variant="outline"
        className={cn(
          "absolute -top-2 -right-2 text-[10px] capitalize",
          isEarned ? `${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}` : "bg-muted text-muted-foreground"
        )}
      >
        {badge.tier}
      </Badge>
    </motion.div>
  );
}

interface BadgeGridProps {
  userBadges: UserBadge[];
  stats?: {
    totalQuotes?: number;
    signedQuotes?: number;
    totalClients?: number;
    currentStreak?: number;
  };
  category?: BadgeDefinition["category"] | "all";
  showLocked?: boolean;
}

export function BadgeGrid({
  userBadges,
  stats = {},
  category = "all",
  showLocked = true,
}: BadgeGridProps) {
  const filteredBadges = useMemo(() => {
    if (category === "all") return BADGES;
    return BADGES.filter((b) => b.category === category);
  }, [category]);

  const earnedBadgeIds = new Set(userBadges.map((b) => b.badgeId));

  // Get progress for each badge
  const getProgress = (badge: BadgeDefinition): number => {
    switch (badge.id) {
      case "first-quote":
      case "quotes-10":
      case "quotes-50":
      case "quotes-100":
      case "quotes-500":
        return stats.totalQuotes || 0;
      case "first-signed":
      case "signed-25":
      case "signed-100":
        return stats.signedQuotes || 0;
      case "clients-10":
      case "clients-50":
        return stats.totalClients || 0;
      case "streak-7":
      case "streak-30":
        return stats.currentStreak || 0;
      default:
        return 0;
    }
  };

  const displayBadges = showLocked
    ? filteredBadges
    : filteredBadges.filter((b) => earnedBadgeIds.has(b.id));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayBadges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          userBadge={userBadges.find((ub) => ub.badgeId === badge.id)}
          showProgress={!earnedBadgeIds.has(badge.id)}
          currentProgress={getProgress(badge)}
        />
      ))}
    </div>
  );
}

interface BadgeSummaryProps {
  userBadges: UserBadge[];
}

export function BadgeSummary({ userBadges }: BadgeSummaryProps) {
  const earnedCount = userBadges.length;
  const totalCount = BADGES.length;
  const progress = (earnedCount / totalCount) * 100;

  // Count by tier
  const tierCounts = useMemo(() => {
    const earned = new Set(userBadges.map((b) => b.badgeId));
    return {
      bronze: BADGES.filter((b) => b.tier === "bronze" && earned.has(b.id)).length,
      silver: BADGES.filter((b) => b.tier === "silver" && earned.has(b.id)).length,
      gold: BADGES.filter((b) => b.tier === "gold" && earned.has(b.id)).length,
      platinum: BADGES.filter((b) => b.tier === "platinum" && earned.has(b.id)).length,
    };
  }, [userBadges]);

  return (
    <Card className="border-[#E85A5A]/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-[#E85A5A]" />
          Vos Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{earnedCount} / {totalCount}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Tier breakdown */}
        <div className="grid grid-cols-4 gap-2">
          {(["bronze", "silver", "gold", "platinum"] as const).map((tier) => {
            const style = TIER_STYLES[tier];
            const count = tierCounts[tier];
            const total = BADGES.filter((b) => b.tier === tier).length;

            return (
              <div
                key={tier}
                className={cn(
                  "text-center p-2 rounded-lg",
                  style.bg
                )}
              >
                <p className={cn("text-lg font-bold", style.text)}>
                  {count}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {tier}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// New badge notification component
interface NewBadgeNotificationProps {
  badge: BadgeDefinition;
  isOpen: boolean;
  onClose: () => void;
}

export function NewBadgeNotification({ badge, isOpen, onClose }: NewBadgeNotificationProps) {
  const tierStyle = TIER_STYLES[badge.tier];
  const Icon = badge.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
        >
          <Card
            className={cn(
              "border-2 shadow-xl cursor-pointer",
              tierStyle.border,
              tierStyle.glow
            )}
            onClick={onClose}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className={cn("w-14 h-14 rounded-xl flex items-center justify-center", tierStyle.bg)}
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Icon className={cn("w-7 h-7", tierStyle.icon)} />
                </motion.div>
                <div>
                  <p className="text-xs text-muted-foreground">Nouveau badge !</p>
                  <p className={cn("font-bold", tierStyle.text)}>{badge.name}</p>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
