'use client';

import { ItemCard } from "@/components/connect-hub/marketplace/item-card";
import { SellItemForm } from "@/components/connect-hub/marketplace/sell-item-form";
import { Button } from "@/components/ui/button";
import { useFirestore, useUser } from "@/firebase/index";
import { Product } from "@/lib/types";
import { PlusCircle, ShoppingBag } from "lucide-react";
import React, { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from "@/firebase/firestore/use-collection";
import { SearchBar } from "@/components/connect-hub/shared/search-bar";
import { Skeleton } from "@/components/ui/skeleton";

function MarketplaceSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
    );
}


export default function MarketplacePage() {
  console.log("MarketplacePage: Rendering...");
  const db = useFirestore();
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: allMarketplaceItems, loading } = useCollection<Product>(productsQuery);
  const { user } = useUser();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  console.log("MarketplacePage state:", { loading, hasItems: !!allMarketplaceItems });

  const marketplaceItems = useMemo(() => {
    if (!allMarketplaceItems) return [];
    if (!searchTerm) return allMarketplaceItems;

    return allMarketplaceItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allMarketplaceItems, searchTerm]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold font-headline">For Sale</h1>
        <div className="flex w-full sm:w-auto gap-2">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search for items..." />
            {user && !user.isAnonymous && (
            <Button onClick={() => setIsFormOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Sell
            </Button>
            )}
        </div>
      </div>

      <SellItemForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} />

      {loading ? (
        <MarketplaceSkeleton />
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
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">
                {searchTerm ? "No Items Match Your Search" : "The Marketplace is Empty"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm ? "Try a different search term or check back later." : "Why not be the first to sell something?"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
