
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, ArrowLeft, MessageCircle } from "lucide-react";
import type { Conversation, Message, UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFirestore, useUser } from "@/firebase/index";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';

type ChatLayoutProps = {
  conversations: Conversation[];
  currentUser: UserProfile;
  defaultConversationId?: string | null;
};

function ChatMessages({ conversation, currentUser }: { conversation: Conversation, currentUser: UserProfile }) {
  const db = useFirestore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messagesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'conversations', conversation.id, 'messages'), orderBy('createdAt', 'asc'));
  }, [db, conversation.id]);

  const { data: messages, loading } = useCollection<Message>(messagesQuery);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const otherParticipant = Object.values(conversation.participants).find(p => p.uid !== currentUser.uid);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><p>Loading messages...</p></div>
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages && messages.length > 0 ? (
        messages.map((msg) => {
          const sender = msg.senderId === currentUser.uid ? currentUser : otherParticipant;
          const timestamp = msg.createdAt?.toDate ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : 'just now';

          return (
            <div key={msg.id} className={cn("flex gap-3", msg.senderId === currentUser.uid ? "justify-end" : "justify-start")}>
              {msg.senderId !== currentUser.uid && sender && (
                 <Avatar className="h-8 w-8">
                   <AvatarImage src={sender.avatar.url} alt={sender.name} data-ai-hint={sender.avatar.hint} />
                   <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                 </Avatar>
              )}
              <div className={cn(
                "max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2",
                msg.senderId === currentUser.uid
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              )}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs opacity-70 mt-1 text-right">{timestamp}</p>
              </div>
            </div>
          )
        })
      ) : (
         <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 font-semibold">No messages yet</h3>
              <p className="text-sm">Be the first to start the conversation!</p>
            </div>
          </div>
      )}
       <div ref={messagesEndRef} />
    </div>
  )
}

export function ChatLayout({ conversations, currentUser, defaultConversationId }: ChatLayoutProps) {
  const db = useFirestore();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (defaultConversationId) {
      const convo = conversations.find(c => c.id === defaultConversationId);
      if (convo) {
        setSelectedConversation(convo);
      }
    } else if (conversations.length > 0) {
      setSelectedConversation(null);
    }
  }, [defaultConversationId, conversations]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !db || !currentUser) return;

    const messageText = newMessage;
    setNewMessage("");

    const conversationRef = doc(db, 'conversations', selectedConversation.id);
    const messagesRef = collection(conversationRef, 'messages');

    await addDoc(messagesRef, {
      text: messageText,
      senderId: currentUser.uid,
      createdAt: serverTimestamp()
    });

    await updateDoc(conversationRef, {
      lastMessageText: messageText,
      lastMessageAt: serverTimestamp()
    });
  }
  
  const getOtherParticipant = (convo: Conversation) => {
    return Object.values(convo.participants).find(p => p.uid !== currentUser.uid);
  }

  return (
    <div className="flex h-full border-t">
      <div className={cn(
        "w-full md:w-1/3 flex-shrink-0 border-r bg-card md:flex flex-col",
        selectedConversation && "hidden"
      )}>
        <div className="flex h-full flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations" className="pl-10" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const otherUser = getOtherParticipant(conv);
              if (!otherUser) return null;

              const date = conv.lastMessageAt?.toDate ? formatDistanceToNow(conv.lastMessageAt.toDate(), { addSuffix: true }) : '';

              return (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50",
                    selectedConversation?.id === conv.id && "bg-secondary"
                  )}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <Avatar>
                    <AvatarImage src={otherUser.avatar.url} alt={otherUser.name} data-ai-hint={otherUser.avatar.hint}/>
                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{otherUser.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessageText}</p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right shrink-0">{date}</div>
                </div>
              );
            })}
             {conversations.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-2 font-semibold">No Conversations</h3>
                    <p className="text-sm">Contact a seller or another user to start a chat.</p>
                </div>
             )}
          </div>
        </div>
      </div>
      <div className={cn(
        "flex-1 flex-col",
        selectedConversation ? "flex" : "hidden md:flex"
      )}>
        {selectedConversation ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b">
               <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                  <ArrowLeft className="h-5 w-5" />
               </Button>
              <Avatar>
                <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar.url} alt={getOtherParticipant(selectedConversation)?.name} data-ai-hint={getOtherParticipant(selectedConversation)?.avatar.hint}/>
                <AvatarFallback>{getOtherParticipant(selectedConversation)?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">{getOtherParticipant(selectedConversation)?.name}</h2>
            </div>
            
            <ChatMessages conversation={selectedConversation} currentUser={currentUser} />

            <div className="p-4 border-t bg-card">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input 
                  placeholder="Type a message..." 
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground/30"/>
              <h3 className="mt-4 text-lg font-semibold">Select a conversation</h3>
              <p className="mt-1 text-sm">Choose a conversation from the list to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
