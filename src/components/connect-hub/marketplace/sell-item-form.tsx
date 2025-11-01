'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase/index';
import { Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { z } from 'zod';

const CreateProductSchema = z.object({
  name: z.string().min(1, 'Item name cannot be empty.'),
  description: z.string().min(1, 'Description cannot be empty.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
});


type SellItemFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: Product;
};

export function SellItemForm({ isOpen, onOpenChange, itemToEdit }: SellItemFormProps) {
  const { user: authUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!itemToEdit;


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authUser || !db) {
        toast({ title: 'Error', description: 'You must be logged in to sell an item.', variant: 'destructive' });
        return;
    }
    
    setLoading(true);

    const formData = new FormData(formRef.current!);
    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
    };
    
    const validatedFields = CreateProductSchema.safeParse(data);
    
    if (!validatedFields.success) {
      const errorMessages = validatedFields.error.flatten().fieldErrors;
      const firstError = Object.values(errorMessages).flat()[0] || 'Invalid data.';
      toast({
        title: 'Error Listing Item',
        description: firstError,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    const { name, description, price } = validatedFields.data;

    try {
        if (isEdit && itemToEdit) {
            const itemRef = doc(db, 'products', itemToEdit.id);
            await updateDoc(itemRef, { name, description, price });
            toast({ title: 'Success!', description: 'Item updated successfully!' });
        } else {
            const imageUrl = `https://picsum.photos/seed/${Math.random()}/600/400`;
            const imageHint = 'new item';

            await addDoc(collection(db, 'products'), {
                sellerId: authUser.uid,
                name,
                description,
                price,
                image: {
                    url: imageUrl,
                    hint: imageHint,
                },
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Success!', description: 'Item listed for sale successfully!' });
        }
        formRef.current?.reset();
        onOpenChange(false);
    } catch (error) {
        console.error("Error writing document: ", error);
        toast({
            title: 'Database Error',
            description: `Could not ${isEdit ? 'update' : 'list'} item.`,
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEdit ? "Edit Your Item" : "Sell Your Item"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of your item." : "Fill out the details below to list your item on the marketplace."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} ref={formRef} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Item Name
            </Label>
            <Input id="name" name="name" className="col-span-3" required defaultValue={itemToEdit?.name} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea id="description" name="description" className="col-span-3" required defaultValue={itemToEdit?.description} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price ($)
            </Label>
            <Input id="price" name="price" type="number" step="0.01" className="col-span-3" required defaultValue={itemToEdit?.price} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="picture" className="text-right">
              Picture
            </Label>
            <Input id="picture" type="file" className="col-span-3" disabled />
             <p className="col-span-4 text-xs text-muted-foreground text-center">
                Image upload is coming soon. A placeholder will be used.
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? (isEdit ? 'Saving...' : 'Listing Item...') : (isEdit ? 'Save Changes' : 'List Item')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
