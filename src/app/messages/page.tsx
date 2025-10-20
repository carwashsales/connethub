import { ChatLayout } from "@/components/connect-hub/messages/chat-layout";
import { conversations, messages as allMessages, users } from "@/lib/data";

export default function MessagesPage() {
  const currentUser = users.find(u => u.id === 'user-1');

  // In a real app, you'd likely fetch this based on the logged-in user
  if (!currentUser) {
    return <div>User not found</div>;
  }
  
  return (
    <div className="h-[calc(100vh-4rem)]">
        <ChatLayout 
            conversations={conversations} 
            users={users} 
            messages={allMessages}
            currentUser={currentUser}
        />
    </div>
  );
}
