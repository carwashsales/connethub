'use client';

import { ItemCard } from "@/components/connect-hub/marketplace/item-card";
import { SellItemForm } from "@/components/connect-hub/marketplace/sell-item-form";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { Product } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import React from 'react';
import { collection } from 'firebase/firestore';

export default function MarketplacePage() {
  const db = useFirestore();
  const { data: marketplaceItems, loading } = useCollection<Product>(
    db ? collection(db, "products") : null
  );
  const { user } = useUser();
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-headline">For Sale</h1>
        {user && !user.isAnonymous && (
          <Button onClick={() => setIsFormOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Sell Your Item
          </Button>
        )}
      </div>

      <SellItemForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <div className="h-48 w-full rounded-lg bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {marketplaceItems && marketplaceItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {marketplaceItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No items for sale yet. Be the first to list something!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
