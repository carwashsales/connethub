'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestore, useUser } from "@/firebase/index";
import { doc, getDocs, query, collection, where, addDoc, serverTimestamp } from "firebase/firestore";
import type { Product } from "@/lib/data";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useDoc } from "@/firebase/firestore/use-doc";
import type { UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";


type ItemCardProps = {
  item: Product;
};

export function ItemCard({ item }: ItemCardProps) {
  const  db  = useFirestore();
  const { user: authUser } = useUser();
  const router = useRouter();
  
  const { data: seller } = useDoc<UserProfile>(
    db && item.sellerId ? doc(db, 'users', item.sellerId) : null
  );

  const handleContactSeller = async () => {
    if (!db || !authUser || !seller || authUser.uid === seller.uid) return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, 
      where('participantIds', 'array-contains', authUser.uid)
    );

    const querySnapshot = await getDocs(q);
    let existingConversation = null;

    querySnapshot.forEach(doc => {
      const conversation = doc.data();
      if (conversation.participantIds.includes(seller.uid)) {
        existingConversation = { id: doc.id, ...conversation };
      }
    });

    if (existingConversation) {
      router.push(`/messages?conversationId=${existingConversation.id}`);
    } else {
      const newConversation = await addDoc(conversationsRef, {
        participantIds: [authUser.uid, seller.uid],
        lastMessageAt: serverTimestamp(),
        lastMessageText: ''
      });
      router.push(`/messages?conversationId=${newConversation.id}`);
    }
  };

  const contactButton = (
    <Button 
      size="sm" 
      variant="ghost" 
      className="text-primary hover:bg-primary/10" 
      disabled={!authUser || authUser.uid === item.sellerId}
      onClick={handleContactSeller}
      >
      <MessageSquare className="mr-2 h-4 w-4" />
      Contact
    </Button>
  );

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
            <Image
            src={item.image.url}
            alt={item.name}
            fill
            className="object-cover"
            data-ai-hint={item.image.hint}
            />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="font-headline text-lg mb-2">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{item.description}</CardDescription>
        <p className="mt-4 text-xl font-bold text-primary">${item.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 bg-secondary/30">
        <div className="flex items-center gap-2">
            {seller && (
                <>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={seller.avatar.url} alt={seller.name} data-ai-hint={seller.avatar.hint} />
                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{seller.name}</span>
                </>
            )}
        </div>
        
        <TooltipProvider>
            {(!authUser) ? (
            <Tooltip>
                <TooltipTrigger asChild>
                <span tabIndex={0}>{contactButton}</span>
                </TooltipTrigger>
                <TooltipContent>
                <p>Please log in to contact seller.</p>
                </TooltipContent>
            </Tooltip>
            ) : (
            contactButton
            )}
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
