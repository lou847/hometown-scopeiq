import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CompareView } from "@/components/comparison/CompareView";

interface Props {
  params: Promise<{ "project-slug": string }>;
}

export default async function ComparePage({ params }: Props) {
  const { "project-slug": slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) return notFound();

  const { data: submissions } = await supabase
    .from("bid_submissions")
    .select("*, bid_scope_responses(*), bid_labor_rows(*)")
    .eq("project_id", project.id)
    .order("submitted_at");

  const { data: scopeItems } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", project.id)
    .eq("published", true)
    .order("trade")
    .order("sort_order");

  const { data: referenceBids } = await supabase
    .from("reference_bids")
    .select("*")
    .eq("project_id", project.id);

  return (
    <div className="max-w-full mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Side-by-Side Comparison</h1>
        <p className="text-gray-600">{project.name}</p>
      </div>

      <CompareView
        submissions={submissions ?? []}
        scopeItems={scopeItems ?? []}
        referenceBids={referenceBids ?? []}
      />
    </div>
  );
}
