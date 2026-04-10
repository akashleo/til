import { supabase } from "@/lib/supabase";
import Container from "@/components/Container";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const revalidate = 60; // Revalidate every minute

export default async function TilPage() {
  const { data: tils, error } = await supabase
    .from("tils")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Container className="py-20">
        <p className="text-red-500">Failed to load TILs.</p>
      </Container>
    );
  }

  return (
    <Container className="py-20">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Today I Learned</h1>
          <p className="text-xl text-zinc-500">
            A collection of small things I've learned recently.
          </p>
        </header>

        <div className="space-y-10">
          {tils?.length === 0 ? (
            <p className="text-zinc-500 italic">No published TILs yet.</p>
          ) : (
            tils?.map((til) => (
              <article key={til.id} className="group relative flex flex-col items-start">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-800">
                  <Link href={`/til/${til.slug}`}>
                    <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
                    <span className="relative z-10">{til.content.substring(0, 100)}{til.content.length > 100 ? "..." : ""}</span>
                  </Link>
                </h2>
                <time className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 pl-3.5" dateTime={til.created_at}>
                  <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                    <span className="h-4 w-0.5 rounded-full bg-zinc-200" />
                  </span>
                  {formatDate(til.created_at)}
                </time>
                <p className="relative z-10 mt-2 text-sm text-zinc-600">
                  {til.content.substring(0, 160)}{til.content.length > 160 ? "..." : ""}
                </p>
                <div className="relative z-10 mt-4 flex flex-wrap gap-2">
                  {til.tags.map((tag: string) => (
                    <span key={tag} className="text-xs font-medium text-zinc-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </Container>
  );
}
