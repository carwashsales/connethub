import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { users } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
    const user = users[0];
    const coverImage = PlaceHolderImages.find(img => img.id === 'profile-cover');

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="overflow-hidden shadow-lg">
                <div className="relative h-48 md:h-64 w-full">
                    {coverImage && (
                         <Image 
                            src={coverImage.imageUrl} 
                            alt="Profile cover" 
                            fill
                            className="object-cover"
                            data-ai-hint={coverImage.imageHint}
                        />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                </div>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-24 space-y-4 sm:space-y-0 sm:space-x-6">
                        <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary">
                            <AvatarImage src={user.avatar.url} alt={user.name} data-ai-hint={user.avatar.hint} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left pt-4">
                            <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
                            <p className="text-muted-foreground mt-1">{user.bio}</p>
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-xl font-headline font-semibold">Contact Information</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-accent" />
                                <a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-accent" />
                                <span>(123) 456-7890</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
