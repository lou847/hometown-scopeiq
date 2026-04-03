import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold tracking-tight mb-4">ScopeIQ</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
        AI-powered construction scope extraction &amp; bid management.
        Define scope before bids go out. Compare apples to apples.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Sign In
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 border border-black rounded-lg hover:bg-gray-50 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
