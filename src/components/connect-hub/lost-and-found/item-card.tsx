import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LostFoundItem } from "@/lib/data";
import { MapPin, Calendar, Phone } from "lucide-react";
import Image from "next/image";

type ItemCardProps = {
  item: LostFoundItem;
};

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-48 sm:h-auto sm:w-1/3 md:w-1/4 flex-shrink-0">
          <Image
            src={item.image.url}
            alt={item.name}
            fill
            className="object-cover"
            data-ai-hint={item.image.hint}
          />
        </div>
        <div className="flex-grow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
              <Badge variant={item.type === 'lost' ? 'destructive' : 'secondary'} className="capitalize bg-primary text-primary-foreground">
                {item.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{item.description}</p>
            <div className="space-y-2 text-sm text-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <span>{item.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                <span>{item.contact}</span>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
