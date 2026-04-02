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
          <h2 className="text-xl font-semibold mb-4">Submissions</h2>
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
