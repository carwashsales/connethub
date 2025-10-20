import { ItemCard } from "@/components/connect-hub/marketplace/item-card";
import { marketplaceItems } from "@/lib/data";

export default function MarketplacePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {marketplaceItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
