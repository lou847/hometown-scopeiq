import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { InvitationsTab } from "@/components/dashboard/InvitationsTab";
import { SubmissionsTab } from "@/components/dashboard/SubmissionsTab";

interface Props {
  params: Promise<{ "project-slug": string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { "project-slug": slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) return notFound();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  const { data: submissions } = await supabase
    .from("bid_submissions")
    .select("*")
    .eq("project_id", project.id)
    .order("submitted_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-gray-600">{project.address}</p>
        <p className="text-sm text-gray-500">GC: {project.gc_name}</p>
        <div className="flex gap-3 mt-3">
          <Link href={`/dashboard/${slug}/scope`} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50">
            Manage Scope
          </Link>
          <Link href={`/dashboard/${slug}/compare`} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50">
            Compare Bids
          </Link>
          <Link href={`/dashboard/${slug}/demo/electrical`} className="text-sm px-3 py-1.5 border border-amber-300 bg-amber-50 rounded hover:bg-amber-100">
            Preview Sub Form
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Invitations" value={invitations?.length ?? 0} />
        <SummaryCard label="Submissions" value={submissions?.length ?? 0} />
        <SummaryCard
          label="Flagged"
          value={submissions?.filter((s) => s.flagged_row_count > 0).length ?? 0}
        />
        <SummaryCard
          label="Incomplete"
          value={submissions?.filter((s) => s.is_lump_sum).length ?? 0}
        />
      </div>

      {/* Tabs */}
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Invitations</h2>
          <InvitationsTab invitations={invitations ?? []} projectId={project.id} />
        </section>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Submissions</h2>
            {(submissions?.length ?? 0) > 0 && (
              <a
                href={`/api/export?project_id=${project.id}`}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Export to Excel
              </a>
            )}
          </div>
          <SubmissionsTab submissions={submissions ?? []} projectSlug={slug} />
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
