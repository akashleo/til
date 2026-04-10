import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

interface TilPageProps {
  params: {
    slug: string;
  };
}

export default async function TilPage({ params }: TilPageProps) {
  const { slug } = params;

  const { data: til, error } = await supabase
    .from("tils")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !til) {
    notFound();
  }

  return (
    <Container>
      <div style={{ paddingBottom: "4rem" }}>
        <Link href="/til" style={{ color: "var(--secondary)", display: "block", marginBottom: "2rem" }}>
          ← Back to all TILs
        </Link>
        
        <article>
          <div style={{ marginBottom: "1rem" }}>
            <small style={{ color: "var(--secondary)" }}>
              Published on {formatDate(til.created_at)}
            </small>
          </div>
          
          <h1 style={{ marginBottom: "2rem", lineHeight: "1.3" }}>
            {til.content.split("\n")[0]}
          </h1>
          
          <div style={{ fontSize: "1.2rem", whiteSpace: "pre-wrap", marginBottom: "2rem" }}>
            {til.content}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
            {til.tags.map((tag: string) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        </article>
      </div>
    </Container>
  );
}
