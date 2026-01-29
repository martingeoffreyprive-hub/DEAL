"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { VoiceVisualizer, type VoiceState } from "./voice-visualizer";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export interface ChatMessage {
    id: string;
    type: "bot" | "user" | "tool";
    content: string;
    toolName?: string;
    timestamp: Date;
}

interface CopilotPanelProps {
    messages: ChatMessage[];
    voiceState: VoiceState;
    onSendMessage: (text: string) => void;
    onToggleVoice: () => void;
    voiceResponseEnabled: boolean;
    onToggleVoiceResponse: (enabled: boolean) => void;
    className?: string;
}

export function CopilotPanel({
    messages,
    voiceState,
    onSendMessage,
    onToggleVoice,
    voiceResponseEnabled,
    onToggleVoiceResponse,
    className,
}: CopilotPanelProps) {
    const [inputText, setInputText] = useState("");
    const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
        if (chatRef.current) {
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
  }, [messages]);

  const handleSend = () => {
        if (!inputText.trim()) return;
        onSendMessage(inputText.trim());
        setInputText("");
  };

  return (
        <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
          {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                        <div>
                                  <h3 className="text-sm font-bold">DEAL Copilote</h3>h3>
                                  <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                                              Connecte
                                  </div>div>
                        </div>div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>Reponse vocale</span>span>
                                  <Switch
                                                checked={voiceResponseEnabled}
                                                onCheckedChange={onToggleVoiceResponse}
                                                className="scale-75"
                                              />
                        </div>div>
                </div>div>
        
          {/* Chat messages */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                    <div
                                  key={msg.id}
                                  className={cn(
                                                  "max-w-[85%] p-3 px-4 rounded-2xl text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300",
                                                  msg.type === "bot" && "bg-muted border border-border self-start rounded-bl-sm",
                                                  msg.type === "user" && "bg-blue-950/40 border border-blue-500/20 self-end ml-auto rounded-br-sm",
                                                  msg.type === "tool" && "bg-purple-500/10 border border-purple-500/20 self-start max-w-[90%]"
                                                )}
                                >
                      {msg.type === "tool" && msg.toolName && (
                                                <div className="text-purple-400 font-semibold text-[10px] uppercase tracking-wider mb-1">
                                                  {msg.toolName}
                                                </div>div>
                                )}
                                <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                    </div>div>
                  ))}
              </div>div>
        
          {/* Voice Visualizer */}
              <VoiceVisualizer state={voiceState} />
        
          {/* Input mode badges */}
              <div className="flex gap-1.5 px-4 pt-1">
                      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                                Entree vocale
                      </span>span>
                      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Reponse ecrite
                      </span>span>
              </div>div>
        
          {/* Input area */}
              <div className="flex gap-2 items-center p-4 border-t border-border/50">
                      <Input
                                  value={inputText}
                                  onChange={(e) => setInputText(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                  placeholder="Tapez ou parlez..."
                                  className="flex-1 bg-muted/50 border-border/50 rounded-xl"
                                />
                      <Button
                                  size="icon"
                                  onClick={onToggleVoice}
                                  className={cn(
                                                "rounded-full w-10 h-10 shrink-0",
                                                voiceState === "listening"
                                                  ? "bg-gradient-to-br from-emerald-500 to-blue-500 animate-pulse"
                                                  : "bg-gradient-to-br from-red-500 to-orange-500"
                                              )}
                                >
                                <Mic className="h-4 w-4 text-white" />
                      </Button>Button>
              </div>div>
        </div>div>
      );
}</div>
