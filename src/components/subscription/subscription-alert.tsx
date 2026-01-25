"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { AlertTriangle, CreditCard, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionAlertProps {
  className?: string;
}

export function SubscriptionAlert({ className }: SubscriptionAlertProps) {
  const { subscription, loading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  if (loading || dismissed) return null;
  if (!subscription || subscription.status !== "past_due") return null;

  // Calculate days since past_due (using current_period_end as reference)
  const daysPastDue = subscription.current_period_end
    ? Math.floor(
        (Date.now() - new Date(subscription.current_period_end).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const isUrgent = daysPastDue >= 7;

  const handleUpdatePayment = async () => {
    setRedirecting(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening Stripe portal:", error);
      setRedirecting(false);
    }
  };

  return (
    <Alert
      variant="destructive"
      className={cn(
        "relative",
        isUrgent
          ? "bg-red-50 border-red-300 dark:bg-red-950/50 dark:border-red-800"
          : "bg-orange-50 border-orange-300 dark:bg-orange-950/50 dark:border-orange-800",
        className
      )}
    >
      <AlertTriangle
        className={cn(
          "h-5 w-5",
          isUrgent ? "text-red-600" : "text-orange-600"
        )}
      />
      <AlertTitle
        className={cn(
          "font-semibold",
          isUrgent
            ? "text-red-800 dark:text-red-200"
            : "text-orange-800 dark:text-orange-200"
        )}
      >
        {isUrgent ? "Action urgente requise" : "Paiement échoué"}
      </AlertTitle>
      <AlertDescription
        className={cn(
          isUrgent
            ? "text-red-700 dark:text-red-300"
            : "text-orange-700 dark:text-orange-300"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
          <p className="flex-1">
            {isUrgent
              ? `Votre paiement a échoué il y a ${daysPastDue} jours. Mettez à jour votre moyen de paiement pour conserver l'accès à votre abonnement.`
              : "Le dernier paiement pour votre abonnement a échoué. Veuillez mettre à jour votre moyen de paiement."}
          </p>
          <Button
            size="sm"
            variant={isUrgent ? "destructive" : "outline"}
            onClick={handleUpdatePayment}
            disabled={redirecting}
            className="shrink-0"
          >
            {redirecting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            Mettre à jour
          </Button>
        </div>
      </AlertDescription>
      {!isUrgent && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-orange-600 hover:text-orange-800 dark:text-orange-400"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}
