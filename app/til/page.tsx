import Link from "next/link";
import Container from "@/components/Container";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { formatDate, getPreviewText } from "@/lib/utils";
import { TIL } from "@/types/til";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PublicBlog() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: tils, error } = await supabase
    .from("til")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Container>
        <p>error loading tils: {error.message}</p>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ paddingBottom: "4rem" }}>        
        {tils?.length === 0 ? (
          <p style={{ color: "var(--secondary)" }}>no published tils yet.</p>
        ) : (
          <div>
            {tils?.map((til: TIL) => (
              <div key={til.id} className="card">
                <small style={{ color: "var(--secondary)" }}>
                  {formatDate(til.created_at)}
                </small>
                <h2 style={{ margin: "0.5rem 0" }}>
                  <Link href={`/til/${til.slug}`} style={{ color: "var(--primary)" }}>
                    {til.title}
                  </Link>
                </h2>
                <p style={{ color: "var(--secondary)", marginBottom: "1rem", lineHeight: "1.6" }}>
                  {getPreviewText(til.content, 25)}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {til.tags.map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
