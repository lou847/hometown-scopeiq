"use client";

import { useState } from "react";
import { CreateProjectModal } from "./CreateProjectModal";

export function CreateProjectButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
      >
        + New Project
      </button>
      {open && <CreateProjectModal onClose={() => setOpen(false)} />}
    </>
  );
}
