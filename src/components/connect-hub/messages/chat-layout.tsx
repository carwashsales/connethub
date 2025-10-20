"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send } from "lucide-react";
import type { Conversation, Message, User } from "@/lib/data";
import { cn } from "@/lib/utils";

type ChatLayoutProps = {
  conversations: Conversation[];
  users: User[];
  messages: { [key: string]: Message[] };
  currentUser: User;
};

export function ChatLayout({ conversations, users, messages, currentUser }: ChatLayoutProps) {
  const [selectedUserId, setSelectedUserId] = useState(conversations[0]?.userId);
  const selectedConversationMessages = messages[selectedUserId] || [];
  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="flex h-full border-t">
      <div className="w-1/3 flex-shrink-0 border-r bg-card">
        <div className="flex h-full flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations" className="pl-10" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const user = users.find(u => u.id === conv.userId);
              if (!user) return null;
              return (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50",
                    selectedUserId === user.id && "bg-secondary"
                  )}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <Avatar>
                    <AvatarImage src={user.avatar.url} alt={user.name} data-ai-hint={user.avatar.hint}/>
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{conv.timestamp}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b">
              <Avatar>
                <AvatarImage src={selectedUser.avatar.url} alt={selectedUser.name} data-ai-hint={selectedUser.avatar.hint}/>
                <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConversationMessages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.senderId === currentUser.id ? "justify-end" : "justify-start")}>
                  {msg.senderId !== currentUser.id && (
                     <Avatar className="h-8 w-8">
                       <AvatarImage src={selectedUser.avatar.url} alt={selectedUser.name} data-ai-hint={selectedUser.avatar.hint} />
                       <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                     </Avatar>
                  )}
                  <div className={cn(
                    "max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2",
                    msg.senderId === currentUser.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  )}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-card">
              <form className="flex items-center gap-2">
                <Input placeholder="Type a message..." className="flex-1" />
                <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
