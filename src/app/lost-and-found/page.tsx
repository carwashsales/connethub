'use client';

import React, { useMemo, useState } from 'react';
import { ItemCard } from "@/components/connect-hub/lost-and-found/item-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { useFirestore, useUser } from '@/firebase/index';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { LostFoundItem } from '@/lib/types';
import { PostLostFoundItemForm } from '@/components/connect-hub/lost-and-found/post-lost-found-item-form';
import { SearchBar } from '@/components/connect-hub/shared/search-bar';

function ItemList({ items, loading, searchTerm }: { items: LostFoundItem[] | null, loading: boolean, searchTerm: string }) {
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchTerm) return items;

    return items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);


  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card">
            <div className="h-48 sm:h-auto sm:w-1/3 md:w-1/4 rounded bg-muted animate-pulse" />
            <div className="flex-grow space-y-3">
              <div className="h-6 w-1/2 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!filteredItems || filteredItems.length === 0) {
    return <p className="text-center text-muted-foreground py-10">{searchTerm ? "No items match your search." : "No items reported yet."}</p>;
  }

  return (
    <div className="space-y-4">
      {filteredItems.map((item) => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}


export default function LostAndFoundPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: lostItems, loading: loadingLost } = useCollection<LostFoundItem>(
    db ? query(collection(db, "lostAndFoundItems"), where("type", "==", "lost"), orderBy("createdAt", "desc")) : null
  );
  
  const { data: foundItems, loading: loadingFound } = useCollection<LostFoundItem>(
    db ? query(collection(db, "lostAndFoundItems"), where("type", "==", "found"), orderBy("createdAt", "desc")) : null
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <PostLostFoundItemForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} />
      <Tabs defaultValue="lost" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <TabsList>
            <TabsTrigger value="lost">Lost Items</TabsTrigger>
            <TabsTrigger value="found">Found Items</TabsTrigger>
          </TabsList>
          <div className="flex w-full sm:w-auto gap-2">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search lost & found..." />
            {user && !user.isAnonymous && (
              <Button onClick={() => setIsFormOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Post an Item
              </Button>
            )}
          </div>
        </div>
        <TabsContent value="lost">
          <ItemList items={lostItems} loading={loadingLost} searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="found">
          <ItemList items={foundItems} loading={loadingFound} searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
