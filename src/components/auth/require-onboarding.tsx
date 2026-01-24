"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface RequireOnboardingProps {
  children: React.ReactNode;
}

export function RequireOnboarding({ children }: RequireOnboardingProps) {
  const [checking, setChecking] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkOnboarding = async () => {
      // Skip check for certain paths
      if (pathname?.startsWith("/onboarding") || pathname?.startsWith("/pricing")) {
        setChecking(false);
        setOnboardingCompleted(true);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!profile?.onboarding_completed) {
        router.push("/onboarding");
        return;
      }

      setOnboardingCompleted(true);
      setChecking(false);
    };

    checkOnboarding();
  }, [router, pathname, supabase]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!onboardingCompleted) {
    return null;
  }

  return <>{children}</>;
}
