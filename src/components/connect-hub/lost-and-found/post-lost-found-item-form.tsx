'use client';

import React, { useRef, useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { LostFoundItem } from '@/lib/types';


type PostLostFoundItemFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: LostFoundItem;
};

export function PostLostFoundItemForm({ isOpen, onOpenChange, itemToEdit }: PostLostFoundItemFormProps) {
  const { user: authUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [itemType, setItemType] = useState<'lost' | 'found'>(itemToEdit?.type || 'lost');
  const isEdit = !!itemToEdit;

  useEffect(() => {
    if (itemToEdit) {
      setItemType(itemToEdit.type);
    } else {
      setItemType('lost');
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current || !authUser || !db) return;
    
    setLoading(true);
    
    const formData = new FormData(formRef.current);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const contact = formData.get('contact') as string;

    if (!name || !description || !location || !contact) {
      toast({
        title: 'Error',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      if (isEdit && itemToEdit) {
        const itemRef = doc(db, 'lostAndFoundItems', itemToEdit.id);
        await updateDoc(itemRef, {
            name,
            description,
            type: itemType,
            location,
            contact,
        });
        toast({ title: 'Success!', description: 'Item updated successfully!' });
      } else {
        const imageUrl = `https://picsum.photos/seed/${Math.random()}/600/400`;
        const imageHint = 'item';

        await addDoc(collection(db, 'lostAndFoundItems'), {
          userId: authUser.uid,
          name,
          description,
          type: itemType,
          location,
          contact,
          image: {
              url: imageUrl,
              hint: imageHint,
          },
          createdAt: serverTimestamp(),
        });
        toast({ title: 'Success!', description: 'Item posted successfully!' });
      }
      
      formRef.current?.reset();
      onOpenChange(false);

    } catch (error) {
      console.error("Error writing document: ", error);
      toast({
        title: 'Database Error',
        description: `Could not ${isEdit ? 'update' : 'post'} item.`,
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
          <DialogTitle className="font-headline">{isEdit ? 'Edit Item' : 'Report an Item'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the details of your item.' : 'Fill out the details below to post a lost or found item.'}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Type</Label>
            <RadioGroup
              defaultValue={itemType}
              className="col-span-3 flex gap-4"
              value={itemType}
              onValueChange={(value: 'lost' | 'found') => setItemType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lost" id="r-lost" />
                <Label htmlFor="r-lost">Lost</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="found" id="r-found" />
                <Label htmlFor="r-found">Found</Label>
              </div>
            </RadioGroup>
          </div>

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
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input id="location" name="location" placeholder="e.g., Central Park" className="col-span-3" required defaultValue={itemToEdit?.location} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              Contact Info
            </Label>
            <Input id="contact" name="contact" placeholder="e.g., Your phone or email" className="col-span-3" required defaultValue={itemToEdit?.contact} />
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
              {loading ? (isEdit ? 'Saving...' : 'Posting...') : (isEdit ? 'Save Changes' : 'Post Item')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
