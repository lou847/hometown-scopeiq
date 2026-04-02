import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SubmissionDetail } from "@/components/submission/SubmissionDetail";

interface Props {
  params: Promise<{ "project-slug": string; "sub-id": string }>;
}

export default async function SubmissionDetailPage({ params }: Props) {
  const { "sub-id": subId } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("bid_submissions")
    .select("*, bid_scope_responses(*, scope_items(*)), bid_labor_rows(*)")
    .eq("id", subId)
    .single();

  if (!submission) return notFound();

  return (
    <div className="max-w-5xl mx-auto p-8">
      <SubmissionDetail submission={submission} />
    </div>
  );
}
