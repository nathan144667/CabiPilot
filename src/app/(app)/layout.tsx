import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  FolderOpen,
  Send,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard", label: "Dossiers", icon: FolderOpen },
  { href: "/relances", label: "Relances", icon: Send },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

function initialsFromEmail(email: string | null | undefined): string {
  if (!email) return "??";
  const local = email.split("@")[0] || "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? null;
  const displayName = email ? email.split("@")[0] : "Invité";
  const initials = initialsFromEmail(email);

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
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col text-xs">
            <span className="truncate font-medium" title={email ?? undefined}>
              {displayName}
            </span>
            <span className="truncate text-muted-foreground" title={email ?? undefined}>
              {email ?? "non connecté"}
            </span>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title="Se déconnecter"
              className="flex size-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="size-4" />
              <span className="sr-only">Se déconnecter</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      <Toaster position="bottom-right" />
    </div>
  );
}
