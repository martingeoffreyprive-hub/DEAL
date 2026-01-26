"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Building2, UserPlus, Crown, Shield, User, Eye, Sparkles } from "lucide-react";
import { DealIconD, DealLoadingSpinner, DealEmptyState } from "@/components/brand";
import { staggerContainer, staggerItem, cardHover } from "@/components/animations/page-transition";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type OrgRole = "owner" | "admin" | "member" | "viewer";

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
  member_count: number;
}

interface Member {
  id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
}

const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Proprietaire",
  admin: "Administrateur",
  member: "Membre",
  viewer: "Lecteur",
};

const ROLE_COLORS: Record<OrgRole, string> = {
  owner: "bg-[#C9A962]/20 text-[#B89952] border-[#C9A962]/30",
  admin: "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/20",
  member: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  viewer: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const ROLE_ICONS: Record<OrgRole, React.ComponentType<{ className?: string }>> = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

export default function TeamPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("member");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const { data, error } = await supabase.rpc("get_user_organizations");
        if (!error && data) {
          setOrganizations(data);
          if (data.length > 0) setSelectedOrg(data[0]);
        }
      } catch (e) {
        console.error("Error fetching organizations:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrgs();
  }, [supabase]);

  useEffect(() => {
    if (!selectedOrg) return;

    async function fetchMembers() {
      setLoadingMembers(true);
      try {
        const { data } = await supabase
          .from("organization_members")
          .select("*")
          .eq("organization_id", selectedOrg!.id);
        setMembers(data || []);
      } catch (e) {
        console.error("Error fetching members:", e);
      } finally {
        setLoadingMembers(false);
      }
    }
    fetchMembers();
  }, [selectedOrg, supabase]);

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;
    setSubmitting(true);
    try {
      const slug = newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { error } = await supabase.rpc("create_organization", {
        p_name: newOrgName,
        p_slug: slug,
      });
      if (error) throw error;

      toast({ title: "Organisation creee", description: newOrgName });
      setCreateOrgOpen(false);
      setNewOrgName("");

      const { data: orgs } = await supabase.rpc("get_user_organizations");
      setOrganizations(orgs || []);
      if (orgs?.length) setSelectedOrg(orgs[0]);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Impossible de creer l'organisation";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedOrg) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("organization_invitations").insert({
        organization_id: selectedOrg.id,
        email: inviteEmail.toLowerCase(),
        role: inviteRole,
      });
      if (error) throw error;

      toast({
        title: "Invitation envoyee",
        description: `${inviteEmail} a ete invite comme ${ROLE_LABELS[inviteRole]}`,
      });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Impossible d'envoyer l'invitation";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <DealLoadingSpinner size="lg" text="Chargement de l'equipe..." />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <motion.div
        className="max-w-2xl mx-auto text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6 p-4 rounded-full bg-gradient-to-br from-[#1E3A5F]/10 to-[#C9A962]/10 w-fit mx-auto">
          <Building2 className="h-12 w-12 text-[#1E3A5F]" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[#0D1B2A]">Creez votre organisation</h1>
        <p className="text-muted-foreground mb-6">
          Creez une organisation pour collaborer avec votre equipe sur les devis.
        </p>
        <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872]">
              <Plus className="h-5 w-5" />
              Creer une organisation
              <Sparkles className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DealIconD size="xs" variant="primary" />
                Nouvelle organisation
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Nom de l&apos;organisation</Label>
                <Input
                  id="org-name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Mon entreprise"
                  className="focus-visible:ring-[#C9A962]/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOrgOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateOrg}
                disabled={submitting || !newOrgName.trim()}
                className="bg-[#1E3A5F] hover:bg-[#2D4A6F]"
              >
                {submitting && <DealLoadingSpinner size="sm" />}
                Creer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  const canManage = selectedOrg && ["owner", "admin"].includes(selectedOrg.role);

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A5F] via-[#2D4A6F] to-[#0D1B2A] p-6 md:p-8"
        variants={staggerItem}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A962]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A962]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C9A962]/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#C9A962]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Equipe
              </h1>
              <p className="text-white/70">
                Gerez les membres de votre organisation
              </p>
            </div>
          </div>
          {organizations.length > 1 && (
            <Select
              value={selectedOrg?.id}
              onValueChange={(id) =>
                setSelectedOrg(organizations.find((o) => o.id === id) || null)
              }
            >
              <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white hover:bg-white/20">
                <SelectValue placeholder="Organisation" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </motion.div>

      {selectedOrg && (
        <motion.div variants={staggerItem} {...cardHover}>
          <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#C9A962] to-[#D4B872]" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#1E3A5F]/10 to-[#C9A962]/10">
                    <Building2 className="h-6 w-6 text-[#1E3A5F]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1E3A5F]">{selectedOrg.name}</CardTitle>
                    <CardDescription>
                      {selectedOrg.member_count} membre
                      {selectedOrg.member_count > 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={ROLE_COLORS[selectedOrg.role]}>
                  {ROLE_LABELS[selectedOrg.role]}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent border-b border-[#C9A962]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DealIconD size="xs" variant="primary" />
                <CardTitle className="text-[#1E3A5F]">Membres</CardTitle>
              </div>
              {canManage && (
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872]">
                      <UserPlus className="h-4 w-4" />
                      Inviter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <DealIconD size="xs" variant="primary" />
                        Inviter un membre
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="collaborateur@exemple.com"
                          className="focus-visible:ring-[#C9A962]/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={inviteRole}
                          onValueChange={(v) => setInviteRole(v as OrgRole)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrateur</SelectItem>
                            <SelectItem value="member">Membre</SelectItem>
                            <SelectItem value="viewer">Lecteur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteOpen(false)}>
                        Annuler
                      </Button>
                      <Button
                        onClick={handleInvite}
                        disabled={submitting || !inviteEmail.trim()}
                        className="bg-[#1E3A5F] hover:bg-[#2D4A6F]"
                      >
                        {submitting && <DealLoadingSpinner size="sm" />}
                        Envoyer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingMembers ? (
              <div className="flex justify-center py-8">
                <DealLoadingSpinner size="md" />
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const RoleIcon = ROLE_ICONS[member.role];
                  return (
                    <motion.div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-[#C9A962]/10 bg-gradient-to-r from-[#1E3A5F]/5 to-transparent hover:from-[#1E3A5F]/10 transition-all"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-[#C9A962]/20">
                          <AvatarFallback className="bg-[#1E3A5F]/10 text-[#1E3A5F]">U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[#0D1B2A]">Membre</p>
                          <p className="text-sm text-muted-foreground">
                            Depuis{" "}
                            {new Date(member.joined_at).toLocaleDateString("fr-BE")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={ROLE_COLORS[member.role]}>
                        <RoleIcon className="mr-1 h-3 w-3" />
                        {ROLE_LABELS[member.role]}
                      </Badge>
                    </motion.div>
                  );
                })}
                {members.length === 0 && (
                  <DealEmptyState
                    title="Aucun membre"
                    description="Invitez des membres pour collaborer sur vos devis."
                    icon={<Users className="h-10 w-10 text-[#C9A962]" />}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
