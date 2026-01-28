import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { SkipLink } from "@/components/ui/skip-link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile (use maybeSingle to handle missing profiles)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Redirect to onboarding if profile doesn't exist or onboarding not completed
  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      <SkipLink href="#main-content" />

      {/* Header - fixed at top */}
      <Header user={user} profile={profile} />

      {/* Content area - fills remaining space */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - desktop only */}
        <Sidebar />

        {/* Main scrollable content */}
        <main
          id="main-content"
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain"
          tabIndex={-1}
        >
          <div className="p-3 pb-20 sm:p-4 sm:pb-24 md:p-6 lg:p-8 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom nav - fixed at bottom, mobile only */}
      <BottomNavigation />
    </div>
  );
}
