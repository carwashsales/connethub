
import { SidebarProvider, Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Header } from "./header";
import type { UserProfile } from "@/lib/types";

export function AppLayout({ children, user }: { children: React.ReactNode, user: UserProfile | null }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarNav user={user} />
        </Sidebar>
        <div className="flex flex-col flex-1">
          <Header>
            <SidebarTrigger />
          </Header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
