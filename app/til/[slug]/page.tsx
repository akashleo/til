import { supabase } from "@/lib/supabase";
import Container from "@/components/Container";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function TilDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: til, error } = await supabase
    .from("tils")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (error || !til) {
    notFound();
  }

  return (
    <Container className="py-20">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/til"
          className="text-sm font-medium text-zinc-500 hover:text-black mb-8 inline-block"
        >
          ← Back to all TILs
        </Link>
        <article className="space-y-8">
          <header className="space-y-4">
            <time
              className="text-sm text-zinc-400 block"
              dateTime={til.created_at}
            >
              {formatDate(til.created_at)}
            </time>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
              {til.content.substring(0, 100)}{til.content.length > 100 ? "..." : ""}
            </h1>
          </header>
          <div className="prose prose-zinc max-w-none">
            <p className="text-lg text-zinc-700 whitespace-pre-wrap leading-relaxed">
              {til.content}
            </p>
          </div>
          <footer className="pt-8 border-t">
            <div className="flex flex-wrap gap-2">
              {til.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </footer>
        </article>
      </div>
    </Container>
  );
}
