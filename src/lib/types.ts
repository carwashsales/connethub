
export type UserProfile = {
  id: string;
  uid: string;
  name: string;
  email: string;
  avatar: {
    url: string;
    hint: string;
  };
  bio: string;
};

export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    sellerId: string;
    image: {
        url: string;
        hint: string;
    };
    createdAt: any;
};

export type Post = {
  id: string;
  authorId: string;
  content: string;
  image?: { url: string; hint: string };
  createdAt: any;
  likes: number;
  comments: number;
};

export type LostFoundItem = {
  id: string;
  type: 'lost' | 'found';
  name: string;
  description: string;
  location: string;
  contact: string;
  userId: string;
  image: { url: string; hint: string };
  createdAt: any;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  participants: { [key: string]: UserProfile };
  lastMessageText?: string;
  lastMessageAt?: any;
};

export type Message = {
  id: string;
  text: string;
  createdAt: any;
  senderId: string;
};
