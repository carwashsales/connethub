import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export type User = {
  id: string;
  name: string;
  avatar: { url: string; hint: string };
  bio: string;
  email: string;
};

export type Post = {
  id: string;
  authorId: string;
  content: string;
  image?: { url: string; hint: string };
  timestamp: string;
  likes: number;
  comments: number;
};

export type MarketplaceItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  sellerId: string;
  image: { url: string; hint: string };
};

export type LostFoundItem = {
  id: string;
  type: 'lost' | 'found';
  name: string;
  description: string;
  location: string;
  date: string;
  contact: string;
  image: { url: string; hint: string };
};

export type Conversation = {
  id: string;
  userId: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
};

export type Message = {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  isRead: boolean;
};

export const users: User[] = [
  { id: 'user-1', name: 'Sarah Miller', avatar: { url: findImage('user-1')?.imageUrl!, hint: findImage('user-1')?.imageHint! }, bio: 'Community gardener and book lover.', email: 'sarah.m@example.com' },
  { id: 'user-2', name: 'John Davis', avatar: { url: findImage('user-2')?.imageUrl!, hint: findImage('user-2')?.imageHint! }, bio: 'Local musician and coffee enthusiast.', email: 'john.d@example.com' },
  { id: 'user-3', name: 'Emily White', avatar: { url: findImage('user-3')?.imageUrl!, hint: findImage('user-3')?.imageHint! }, bio: 'Tech student and avid hiker.', email: 'emily.w@example.com' },
  { id: 'user-4', name: 'Michael Brown', avatar: { url: findImage('user-4')?.imageUrl!, hint: findImage('user-4')?.imageHint! }, bio: 'Retired teacher, enjoys reading and chess.', email: 'michael.b@example.com' },
  { id: 'user-5', name: 'Jessica Green', avatar: { url: findImage('user-5')?.imageUrl!, hint: findImage('user-5')?.imageHint! }, bio: 'Freelance graphic designer.', email: 'jessica.g@example.com' },
];

export const posts: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-1',
    content: 'Just spent a wonderful morning at the community garden! The tomatoes are finally starting to ripen. 🍅',
    image: { url: findImage('post-image-1')?.imageUrl!, hint: findImage('post-image-1')?.imageHint! },
    timestamp: '2h ago',
    likes: 42,
    comments: 8,
  },
  {
    id: 'post-2',
    authorId: 'user-2',
    content: 'Discovered a new local gem, "The Daily Grind". Their espresso is fantastic! Highly recommend.',
    image: { url: findImage('post-image-2')?.imageUrl!, hint: findImage('post-image-2')?.imageHint! },
    timestamp: '5h ago',
    likes: 89,
    comments: 15,
  },
  {
    id: 'post-3',
    authorId: 'user-4',
    content: 'Our book club had a lively discussion about "The Midnight Library" last night. What an interesting concept! What are your thoughts?',
    image: { url: findImage('post-image-3')?.imageUrl!, hint: findImage('post-image-3')?.imageHint! },
    timestamp: '1d ago',
    likes: 35,
    comments: 12,
  },
];

export const marketplaceItems: MarketplaceItem[] = [
  { id: 'item-1', name: 'Vintage Bicycle', description: 'Classic cruiser bicycle in great condition. Recently tuned up.', price: 150, sellerId: 'user-3', image: { url: findImage('marketplace-item-1')?.imageUrl!, hint: findImage('marketplace-item-1')?.imageHint! } },
  { id: 'item-2', name: 'Handmade Wooden Chair', description: 'Solid oak chair, perfect for a study or reading nook.', price: 250, sellerId: 'user-4', image: { url: findImage('marketplace-item-2')?.imageUrl!, hint: findImage('marketplace-item-2')?.imageHint! } },
  { id: 'item-3', name: 'Acoustic Guitar', description: 'Yamaha acoustic guitar with a warm tone. Comes with a soft case.', price: 180, sellerId: 'user-2', image: { url: findImage('marketplace-item-3')?.imageUrl!, hint: findImage('marketplace-item-3')?.imageHint! } },
  { id: 'item-4', name: 'Set of Classic Novels', description: 'A collection of 10 classic literature paperbacks.', price: 40, sellerId: 'user-1', image: { url: findImage('marketplace-item-4')?.imageUrl!, hint: findImage('marketplace-item-4')?.imageHint! } },
  { id: 'item-5', name: 'Leather Backpack', description: 'Stylish and durable leather backpack. Barely used.', price: 75, sellerId: 'user-5', image: { url: findImage('marketplace-item-5')?.imageUrl!, hint: findImage('marketplace-item-5')?.imageHint! } },
  { id: 'item-6', name: 'Ceramic Plant Pot', description: 'Large ceramic pot with a unique glaze. Perfect for indoor plants.', price: 30, sellerId: 'user-1', image: { url: findImage('marketplace-item-6')?.imageUrl!, hint: findImage('marketplace-item-6')?.imageHint! } },
];

export const lostFoundItems: LostFoundItem[] = [
  { id: 'lf-1', type: 'lost', name: 'Set of keys', description: 'A set of three keys on a green carabiner. Lost somewhere near the central park.', location: 'Central Park', date: '2024-07-20', contact: 'Contact John D.', image: { url: findImage('lost-item-1')?.imageUrl!, hint: findImage('lost-item-1')?.imageHint! } },
  { id: 'lf-2', type: 'found', name: 'Black Wallet', description: 'A black leather wallet with various cards. Found on the bench near the bus stop on Main St.', location: 'Main St. Bus Stop', date: '2024-07-19', contact: 'Contact Admin', image: { url: findImage('found-item-1')?.imageUrl!, hint: findImage('found-item-1')?.imageHint! } },
  { id: 'lf-3', type: 'lost', name: 'Golden Retriever Puppy', description: 'His name is "Buddy". He is very friendly and was last seen in the Oakwood neighborhood.', location: 'Oakwood', date: '2024-07-21', contact: 'Contact Sarah M.', image: { url: findImage('lost-item-2')?.imageUrl!, hint: findImage('lost-item-2')?.imageHint! } },
  { id: 'lf-4', type: 'found', name: 'Silver Necklace', description: 'Found a silver necklace with a heart pendant at the library.', location: 'Public Library', date: '2024-07-21', contact: 'Contact Emily W.', image: { url: findImage('found-item-2')?.imageUrl!, hint: findImage('found-item-2')?.imageHint! } },
];

export const conversations: Conversation[] = [
  { id: 'conv-1', userId: 'user-2', lastMessage: 'Sure, I can meet you at 3 PM.', timestamp: '10:42 AM', unreadCount: 0 },
  { id: 'conv-2', userId: 'user-3', lastMessage: 'That sounds great! Thanks!', timestamp: 'Yesterday', unreadCount: 2 },
  { id: 'conv-3', userId: 'user-4', lastMessage: 'Did you finish reading the book?', timestamp: '2 days ago', unreadCount: 0 },
  { id: 'conv-4', userId: 'user-5', lastMessage: 'Here are the design mockups.', timestamp: '3 days ago', unreadCount: 0 },
];

export const messages: { [key: string]: Message[] } = {
  'user-2': [
    { id: 'msg-1', text: 'Hey, is the guitar still available?', senderId: 'user-1', timestamp: '10:30 AM', isRead: true },
    { id: 'msg-2', text: 'Hi! Yes, it is.', senderId: 'user-2', timestamp: '10:31 AM', isRead: true },
    { id: 'msg-3', text: 'Great! Could I come see it this afternoon?', senderId: 'user-1', timestamp: '10:35 AM', isRead: true },
    { id: 'msg-4', text: 'Sure, I can meet you at 3 PM.', senderId: 'user-2', timestamp: '10:42 AM', isRead: true },
  ],
  'user-3': [
    { id: 'msg-5', text: 'Hello! I am interested in the vintage bike.', senderId: 'user-1', timestamp: 'Yesterday', isRead: true },
    { id: 'msg-6', text: 'That sounds great! Thanks!', senderId: 'user-3', timestamp: 'Yesterday', isRead: true },
    { id: 'msg-7', text: 'Let me know when you are free.', senderId: 'user-3', timestamp: 'Yesterday', isRead: false },
    { id: 'msg-8', text: 'I am available tomorrow morning.', senderId: 'user-3', timestamp: 'Yesterday', isRead: false },
  ],
  'user-4': [
    { id: 'msg-9', text: 'Did you finish reading the book?', senderId: 'user-4', timestamp: '2 days ago', isRead: true },
  ],
  'user-5': [
    { id: 'msg-10', text: 'Here are the design mockups.', senderId: 'user-5', timestamp: '3 days ago', isRead: true },
  ],
};
