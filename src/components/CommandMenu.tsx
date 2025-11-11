"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Calculator,
  Calendar,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  UserPlus,
  Search,
  Command as CommandIcon,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { useAuth } from "@/lib/auth/AuthContext"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()
  const { isAuthenticated, signOut } = useAuth()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Open command palette with Cmd/Ctrl + K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      
      // Home - Cmd/Ctrl + Shift + H
      if (e.key === "h" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        router.push("/")
      }
      
      // Dashboard - Cmd/Ctrl + Shift + D
      if (e.key === "d" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        router.push("/dashboard")
      }
      
      // Logout - Cmd/Ctrl + Shift + Q
      if (e.key === "q" && (e.metaKey || e.ctrlKey) && e.shiftKey && isAuthenticated) {
        e.preventDefault()
        signOut().then(() => router.push("/login"))
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [router, isAuthenticated, signOut])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <p className="text-sm text-muted-foreground fixed bottom-4 right-4 z-50 hidden md:flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border">
        Press{" "}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>{" "}
        to open command menu
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/"))}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
              <CommandShortcut>⌘⇧H</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              <CommandShortcut>⌘⇧D</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/test-blob"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Test Blob</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Account">
            {isAuthenticated ? (
              <CommandItem
                onSelect={() => runCommand(async () => {
                  await signOut()
                  router.push("/login")
                })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
                <CommandShortcut>⌘⇧Q</CommandShortcut>
              </CommandItem>
            ) : (
              <>
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/login"))}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/signup"))}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Sign Up</span>
                </CommandItem>
              </>
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>System</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => {
                runCommand(() => {
                  window.open("https://github.com/InnuxAI/sicgil-frontend", "_blank")
                })
              }}
            >
              <CommandIcon className="mr-2 h-4 w-4" />
              <span>View Source Code</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => {
                  window.location.reload()
                })
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Reload Page</span>
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
