import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-forge-void">
      <aside className="w-60 shrink-0 border-r border-forge-border bg-forge-void flex flex-col">
        <div className="flex h-14 items-center gap-2 px-5 border-b border-forge-border">
          <div className="size-2 rounded-full bg-forge-violet" />
          <Link href="/dashboard" className="font-display text-sm font-bold text-forge-text">
            LearnForge
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavItem href="/dashboard" label="Dashboard" />
          <NavItem href="/courses" label="Courses" />
        </nav>
        <div className="p-3 border-t border-forge-border space-y-1">
          <div className="px-3 py-2 text-body-s text-forge-muted truncate">
            {session.user?.name ?? session.user?.email ?? "User"}
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-body-s text-forge-muted hover:bg-forge-surface hover:text-forge-text transition-colors"
          >
            Sign out
          </Link>
          {session.user?.role === "ADMIN" && (
            <Link
              href="/admin/courses"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-body-s text-forge-muted hover:bg-forge-surface hover:text-forge-text transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-forge-surface">
        <div className="mx-auto max-w-6xl p-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-body-m text-forge-muted hover:bg-forge-surface hover:text-forge-text transition-colors aria-[current=page]:bg-forge-surface aria-[current=page]:text-forge-text aria-[current=page]:border-l-4 aria-[current=page]:border-forge-violet aria-[current=page]:pl-2"
    >
      {label}
    </Link>
  );
}
