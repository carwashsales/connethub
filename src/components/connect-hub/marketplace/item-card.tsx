import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketplaceItem, users } from "@/lib/data";
import Image from "next/image";
import { MessageSquare } from "lucide-react";

type ItemCardProps = {
  item: MarketplaceItem;
};

export function ItemCard({ item }: ItemCardProps) {
  const seller = users.find(user => user.id === item.sellerId);

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
        <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
          <MessageSquare className="mr-2 h-4 w-4" />
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
