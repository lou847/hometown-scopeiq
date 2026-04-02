"use client";

import { createClient } from "@/lib/supabase/client";
import type { ScopeItem, Trade } from "@/lib/types";

interface Props {
  projectId: string;
  trade: Trade;
  items: ScopeItem[];
}

export function ScopePublishButton({ projectId: _projectId, trade, items }: Props) {
  const published = items.every((i) => i.published);
  const unpublishedCount = items.filter((i) => !i.published).length;

  async function handlePublish() {
    const supabase = createClient();
    const ids = items.filter((i) => !i.published).map((i) => i.id);

    await supabase
      .from("scope_items")
      .update({ published: true, published_at: new Date().toISOString() })
      .in("id", ids);

    window.location.reload();
  }

  if (published) {
    return (
      <span className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded capitalize">
        {trade.replace("_", " ")} — Published
      </span>
    );
  }

  return (
    <button
      onClick={handlePublish}
      className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 capitalize"
    >
      Publish {trade.replace("_", " ")} ({unpublishedCount} items)
    </button>
  );
}
