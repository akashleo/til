import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

interface TilPageProps {
  params: {
    slug: string;
  };
}

export default async function TilPage({ params }: TilPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { slug } = params;

  const { data: til, error } = await supabase
    .from("til")
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
          ← back to all tils
        </Link>
        
        <article>
          <div style={{ marginBottom: "1rem" }}>
            <small style={{ color: "var(--secondary)" }}>
              published on {formatDate(til.created_at)}
            </small>
          </div>
          
          <h1 style={{ marginBottom: "2rem", lineHeight: "1.3" }}>
            {til.title}
          </h1>
          
          <div style={{ marginBottom: "2rem" }}>
            <MarkdownRenderer content={til.content} />
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
