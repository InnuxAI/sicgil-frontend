"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { useQueryState } from "nuqs";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Moon, 
  Sun, 
  Monitor, 
  ChevronUp, 
  User, 
  CreditCard, 
  Bell, 
  LogOut 
} from "lucide-react";

export default function UserProfile() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const clearUserState = useStore((state) => state.clearUserState);
  const [, setSessionId] = useQueryState('session');

  const handleSignOut = async () => {
    try {
      // Sign out (clears auth token)
      await signOut();
      
      // Show success message
      toast.success("Signed out successfully");
      
      // Clear state (includes agent, team, db_id in clearUserState)
      clearUserState();
      setSessionId(null);
      
      // Navigate to login page (replace to prevent back navigation)
      router.replace("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-accent p-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
        <div className="flex-1">
          <div className="h-3 w-24 animate-pulse rounded bg-primary/20" />
          <div className="mt-1 h-2 w-32 animate-pulse rounded bg-primary/20" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-xl border border-primary/15 bg-accent p-3 transition-colors hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-primary/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-background">
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-medium text-primary truncate">
              {user.name}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {user.email}
            </div>
          </div>
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === 'dark' ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : theme === 'light' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Monitor className="mr-2 h-4 w-4" />
            )}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
