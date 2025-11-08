
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Header } from "./header";
import type { UserProfile } from "@/lib/types";

export function AppLayout({ children, user }: { children: React.ReactNode, user: UserProfile | null }) {
  return (
    <SidebarProvider>
        <Sidebar>
          <SidebarNav user={user} />
        </Sidebar>
        <SidebarInset>
          <Header>
            <SidebarTrigger />
          </Header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
