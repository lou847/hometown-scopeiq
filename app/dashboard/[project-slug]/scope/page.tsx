import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ScopeReviewTable } from "@/components/scope/ScopeReviewTable";

interface Props {
  params: Promise<{ "project-slug": string }>;
}

export default async function ScopeReviewPage({ params }: Props) {
  const { "project-slug": slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) return notFound();

  const { data: scopeItems } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", project.id)
    .order("trade")
    .order("sort_order");

  const { data: documents } = await supabase
    .from("project_documents")
    .select("*")
    .eq("project_id", project.id)
    .order("uploaded_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Scope Review</h1>
        <p className="text-gray-600">{project.name}</p>
      </div>

      <ScopeReviewTable
        projectId={project.id}
        scopeItems={scopeItems ?? []}
        documents={documents ?? []}
      />
    </div>
  );
}
