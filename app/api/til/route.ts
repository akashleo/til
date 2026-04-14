import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { slugify } from "@/lib/utils";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isAdmin() {
  const cookieStore = cookies();
  return cookieStore.get("authToken") ? true : false;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isPublishedStr = searchParams.get("is_published");


  let query = supabaseAdmin
    .from("til")
    .select("*")
    .order("created_at", { ascending: false });

  if (isPublishedStr !== null) {
    const isPublished = isPublishedStr === "true";
    // Admin check if trying to access unpublished TILs
    if (!isPublished && !isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // For admins, don't filter by is_published - show all TILs
    if (!isAdmin()) {
      query = query.eq("is_published", isPublished);
    }
  } else {
    // No is_published filter specified - non-admins only see published
    if (!isAdmin()) {
      query = query.eq("is_published", true);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!isAdmin()) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { title, content, tags } = await request.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Title and Content are required" }, { status: 400 });
  }

  const tagList = tags
    ? tags.split(",").map((tag: string) => tag.trim())
    : [];
  const slug = slugify(title);

  const { data, error } = await supabaseAdmin
    .from("til")
    .insert([
      {
        title,
        content,
        tags: tagList,
        slug,
        is_published: false,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
