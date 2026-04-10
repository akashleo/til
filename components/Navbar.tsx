import Link from "next/link";
import Container from "./Container";

export default function Navbar() {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <Container>
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            TIL
          </Link>
          <div className="flex gap-6">
            <Link href="/til" className="text-sm font-medium text-zinc-600 hover:text-black">
              Blog
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-black">
              Dashboard
            </Link>
          </div>
        </div>
      </Container>
    </nav>
  );
}
