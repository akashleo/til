import Link from "next/link";
import { cookies } from "next/headers";
import Container from "./Container";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const session = cookies().get("authToken");
  const isLoggedIn = !!session?.value;

  return (
    <nav className="navbar">
      <Container>
        <div className="navbar-content">
          <Link href="/" className="nav-brand">
            <strong>TIL</strong>
          </Link>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link href="/til" className="nav-link">
              Public Blog
            </Link>
            {isLoggedIn && <LogoutButton />}
          </div>
        </div>
      </Container>
    </nav>
  );
}
