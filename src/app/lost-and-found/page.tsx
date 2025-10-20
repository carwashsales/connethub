import { ItemCard } from "@/components/connect-hub/lost-and-found/item-card";
import { ItemSearch } from "@/components/connect-hub/lost-and-found/item-search";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lostFoundItems } from "@/lib/data";
import { PlusCircle } from "lucide-react";

export default function LostAndFoundPage() {
  const lostItems = lostFoundItems.filter((item) => item.type === 'lost');
  const foundItems = lostFoundItems.filter((item) => item.type === 'found');

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs defaultValue="lost" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <TabsList>
            <TabsTrigger value="lost">Lost Items</TabsTrigger>
            <TabsTrigger value="found">Found Items</TabsTrigger>
          </TabsList>
          <div className="flex w-full sm:w-auto gap-2">
            <ItemSearch />
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Post an Item
            </Button>
          </div>
        </div>
        <TabsContent value="lost">
          <div className="space-y-4">
            {lostItems.length > 0 ? (
              lostItems.map((item) => <ItemCard key={item.id} item={item} />)
            ) : (
              <p className="text-center text-muted-foreground py-10">No lost items reported.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="found">
          <div className="space-y-4">
            {foundItems.length > 0 ? (
              foundItems.map((item) => <ItemCard key={item.id} item={item} />)
            ) : (
              <p className="text-center text-muted-foreground py-10">No found items reported.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
