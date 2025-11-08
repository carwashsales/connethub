
'use client';

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Header } from "./header";
import type { UserProfile } from "@/lib/types";
import { useUser, useAuth } from "@/firebase/index";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { MailCheck } from "lucide-react";


function EmailVerificationBanner() {
    const { user } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    if (!user || user.emailVerified) {
        return null;
    }

    const handleResendVerification = async () => {
        if (!user) return;
        setIsSending(true);
        try {
            await sendEmailVerification(user);
            toast({
                title: "Verification Email Sent",
                description: "A new verification link has been sent to your email address.",
            });
        } catch (error: any) {
             toast({
                title: "Error Sending Email",
                description: "Could not send verification email. Please try again later.",
                variant: "destructive",
            });
            console.error("Error sending verification email:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-2">
            <Alert>
                <MailCheck className="h-4 w-4" />
                <AlertTitle>Verify Your Email</AlertTitle>
                <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p>Your email address is not verified. Please check your inbox for a verification link.</p>
                    <Button onClick={handleResendVerification} disabled={isSending} size="sm">
                        {isSending ? "Sending..." : "Resend Verification Email"}
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    );
}

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
            <EmailVerificationBanner />
            {children}
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
