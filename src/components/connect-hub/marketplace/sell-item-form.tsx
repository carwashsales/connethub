'use client';

import React, { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
import { createProductAction, type CreateProductState } from '@/lib/actions';
import { useUser, useFirestore } from '@/firebase/index';
import { Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import type { Product } from '@/lib/data';


function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-primary hover:bg-primary/90">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? (isEdit ? 'Saving...' : 'Listing Item...') : (isEdit ? 'Save Changes' : 'List Item for Sale')}
    </Button>
  );
}

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
  const isEdit = !!itemToEdit;

  const initialState: CreateProductState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createProductAction, initialState);

  useEffect(() => {
    async function handleFormSubmit() {
        if (state.message && state.message.includes('validated')) {
            const formData = new FormData(formRef.current!);
            const name = formData.get('name') as string;
            const description = formData.get('description') as string;
            const price = parseFloat(formData.get('price') as string);
            
            if (name && description && price && authUser && db) {
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
                }
            }
        } else if (state.errors) {
            toast({
              title: 'Error',
              description: state.message,
              variant: 'destructive',
            });
        }
    }
    handleFormSubmit();
  }, [state, toast, onOpenChange, authUser, db, isEdit, itemToEdit]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEdit ? "Edit Your Item" : "Sell Your Item"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of your item." : "Fill out the details below to list your item on the marketplace."}
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch} ref={formRef} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Item Name
            </Label>
            <Input id="name" name="name" className="col-span-3" required defaultValue={itemToEdit?.name} />
          </div>
          {state.errors?.name && (
            <p className="col-span-4 text-sm text-destructive text-right -mt-2">
              {state.errors.name.join(', ')}
            </p>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea id="description" name="description" className="col-span-3" required defaultValue={itemToEdit?.description} />
          </div>
          {state.errors?.description && (
            <p className="col-span-4 text-sm text-destructive text-right -mt-2">
              {state.errors.description.join(', ')}
            </p>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price ($)
            </Label>
            <Input id="price" name="price" type="number" step="0.01" className="col-span-3" required defaultValue={itemToEdit?.price} />
          </div>
           {state.errors?.price && (
            <p className="col-span-4 text-sm text-destructive text-right -mt-2">
              {state.errors.price.join(', ')}
            </p>
          )}

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
            <SubmitButton isEdit={isEdit} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
