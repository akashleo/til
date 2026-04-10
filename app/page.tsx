import Link from "next/link";
import Container from "@/components/Container";

export default function Home() {
  return (
    <Container>
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
          Today I Learned
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "var(--secondary)",
            marginBottom: "2rem",
          }}
        >
          A minimal personal knowledge tracking tool. Keep track of your daily
          learnings and share them with the world.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/til">
            <button className="primary">Read Public Blog</button>
          </Link>
          <Link href="/dashboard">
            <button>Manage Dashboard</button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
