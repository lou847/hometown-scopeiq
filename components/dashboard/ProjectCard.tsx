import Link from "next/link";
import type { Project } from "@/lib/types";

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/dashboard/${project.slug}`}
      className="block border rounded-lg p-6 bg-white hover:shadow-md transition"
    >
      <h3 className="text-lg font-semibold">{project.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{project.address}</p>
      <p className="text-xs text-gray-400 mt-2">GC: {project.gc_name}</p>
      {project.pw_required && (
        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
          Prevailing Wage
        </span>
      )}
    </Link>
  );
}
