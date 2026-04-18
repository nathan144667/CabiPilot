import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  FolderOpen,
  Send,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard", label: "Dossiers", icon: FolderOpen },
  { href: "/relances", label: "Relances", icon: Send },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 px-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-sm">
            CP
          </div>
          <span className="font-heading text-base font-semibold tracking-tight">
            CabiPilot
          </span>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Separator />

        {/* User */}
        <div className="flex items-center gap-2.5 p-4">
          <Avatar size="sm">
            <AvatarFallback>NC</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-xs">
            <span className="font-medium">Nath C.</span>
            <span className="text-muted-foreground">Admin</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
