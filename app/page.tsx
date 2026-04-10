import Container from "@/components/Container";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-white">
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-zinc-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
            width={200}
            height={200}
            x="50%"
            y={-1}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          strokeWidth={0}
          fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)"
        />
      </svg>
      <Container className="py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          <div className="flex">
            <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-zinc-600 ring-1 ring-zinc-900/10 hover:ring-zinc-900/20">
              <span className="font-semibold text-black">New</span>
              <span className="h-4 w-px bg-zinc-900/10" aria-hidden="true" />
              <Link href="/til" className="flex items-center gap-x-1">
                Explore the blog
                <svg
                  className="h-4 w-4 text-zinc-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
            Today I Learned.
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            A simple, fast way to track your daily learnings and share them with the world.
            Built with Next.js, Tailwind CSS, and Supabase.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/dashboard"
              className="btn btn-primary"
            >
              Go to Dashboard
            </Link>
            <Link href="/til" className="text-sm font-semibold leading-6 text-zinc-900">
              Read Blog <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
