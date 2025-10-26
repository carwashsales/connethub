
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
  timestamp: string;
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
