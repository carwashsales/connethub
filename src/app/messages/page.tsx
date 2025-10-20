import { ChatLayout } from "@/components/connect-hub/messages/chat-layout";
import { conversations, messages as allMessages, users } from "@/lib/data";

export default function MessagesPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
        <ChatLayout 
            conversations={conversations} 
            users={users} 
            messages={allMessages}
            currentUser={users[0]}
        />
    </div>
  );
}
