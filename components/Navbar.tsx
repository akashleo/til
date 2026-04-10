import Link from "next/link";
import Container from "./Container";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Container>
        <div className="navbar-content">
          <Link href="/" className="nav-brand">
            <strong>TIL</strong>
          </Link>
          <div className="nav-links">
            <Link href="/til" className="nav-link">
              Public Blog
            </Link>
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </div>
        </div>
      </Container>
    </nav>
  );
}
