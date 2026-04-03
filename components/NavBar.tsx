"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NavBar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Extract project slug from path if we're inside a project
  const slugMatch = pathname.match(/^\/dashboard\/([^/]+)/);
  const projectSlug =
    slugMatch && slugMatch[1] !== "settings" ? slugMatch[1] : null;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const linkClass = (href: string) =>
    `px-3 py-1.5 text-sm rounded transition ${
      pathname === href
        ? "bg-black text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Link href="/dashboard" className="font-bold text-lg mr-4">
          ScopeIQ
        </Link>
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          Projects
        </Link>
        {projectSlug && (
          <>
            <Link
              href={`/dashboard/${projectSlug}`}
              className={linkClass(`/dashboard/${projectSlug}`)}
            >
              Project
            </Link>
            <Link
              href={`/dashboard/${projectSlug}/scope`}
              className={linkClass(`/dashboard/${projectSlug}/scope`)}
            >
              Scope
            </Link>
            <Link
              href={`/dashboard/${projectSlug}/compare`}
              className={linkClass(`/dashboard/${projectSlug}/compare`)}
            >
              Compare
            </Link>
          </>
        )}
        <Link
          href="/dashboard/settings"
          className={linkClass("/dashboard/settings")}
        >
          Settings
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">{userEmail}</span>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 border rounded"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
