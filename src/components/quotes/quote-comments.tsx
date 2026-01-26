"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  MoreHorizontal,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Comment {
  id: string;
  quote_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface Presence {
  user_id: string;
  user_email: string;
  user_name: string;
  online_at: string;
}

interface QuoteCommentsProps {
  quoteId: string;
}

export function QuoteComments({ quoteId }: QuoteCommentsProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<Presence[]>([]);

  useEffect(() => {
    initializeComments();
    setupRealtimeSubscription();

    return () => {
      // Cleanup subscription
      supabase.channel(`quote-${quoteId}`).unsubscribe();
    };
  }, [quoteId]);

  const initializeComments = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch comments
      const { data, error } = await supabase
        .from("quote_comments")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq("quote_id", quoteId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedComments = (data || []).map((c: any) => ({
        ...c,
        user_name: c.profiles?.full_name || "Utilisateur",
        user_email: c.profiles?.email,
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user profile for presence
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const channel = supabase.channel(`quote-${quoteId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Listen for new comments
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quote_comments",
          filter: `quote_id=eq.${quoteId}`,
        },
        async (payload) => {
          // Fetch the full comment with user info
          const { data } = await supabase
            .from("quote_comments")
            .select(`
              *,
              profiles:user_id (
                full_name,
                email
              )
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const newComment = {
              ...data,
              user_name: data.profiles?.full_name || "Utilisateur",
              user_email: data.profiles?.email,
            };
            setComments((prev) => [...prev, newComment]);
            scrollToBottom();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "quote_comments",
          filter: `quote_id=eq.${quoteId}`,
        },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      )
      // Presence tracking
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: Presence[] = [];

        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          presences.forEach((presence) => {
            if (presence.user_id !== user.id) {
              users.push(presence);
            }
          });
        });

        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            user_email: user.email,
            user_name: profile?.full_name || user.email?.split("@")[0],
            online_at: new Date().toISOString(),
          });
        }
      });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setSending(true);
    try {
      const { error } = await supabase.from("quote_comments").insert({
        quote_id: quoteId,
        user_id: currentUser.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le commentaire",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("quote_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Commentaire supprimé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-cyan-500",
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Commentaires</CardTitle>
            {comments.length > 0 && (
              <Badge variant="secondary">{comments.length}</Badge>
            )}
          </div>

          {/* Online users presence */}
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {onlineUsers.slice(0, 3).map((user) => (
                  <Avatar
                    key={user.user_id}
                    className={`h-6 w-6 border-2 border-background ${getAvatarColor(user.user_id)}`}
                    title={user.user_name}
                  >
                    <AvatarFallback className="text-xs text-white">
                      {getInitials(user.user_name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {onlineUsers.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs">+{onlineUsers.length - 3}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">en ligne</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Comments list */}
        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun commentaire</p>
              <p className="text-xs">Soyez le premier à commenter ce devis</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`flex gap-3 ${
                  comment.user_id === currentUser?.id ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className={`h-8 w-8 ${getAvatarColor(comment.user_id)}`}>
                  <AvatarFallback className="text-xs text-white">
                    {getInitials(comment.user_name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-[80%] ${
                    comment.user_id === currentUser?.id ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block rounded-lg px-3 py-2 ${
                      comment.user_id === currentUser?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {comment.user_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                    {comment.user_id === currentUser?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(comment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* New comment form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newComment.trim() || sending}
            className="shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
