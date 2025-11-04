"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { useQueryState } from "nuqs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "@/components/ui/icon";

export default function UserProfile() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const clearUserState = useStore((state) => state.clearUserState);
  const [, setAgentId] = useQueryState('agent');
  const [, setTeamId] = useQueryState('team');
  const [, setSessionId] = useQueryState('session');
  const [, setDbId] = useQueryState('db_id');

  const handleSignOut = async () => {
    try {
      // Sign out (clears auth token)
      await signOut();
      
      // Show success message
      toast.success("Signed out successfully");
      
      // Clear state and params synchronously
      clearUserState();
      setAgentId(null);
      setTeamId(null);
      setSessionId(null);
      setDbId(null);
      
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
          <Icon type="chevron-up" size="xs" className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Icon type="user" size="xs" className="mr-2" />
          <span>Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icon type="sheet" size="xs" className="mr-2" />
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icon type="check" size="xs" className="mr-2" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
          <Icon type="x" size="xs" className="mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
