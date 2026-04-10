import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

export async function GET() {
  const { data, error } = await supabase
    .from("tils")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { content, tags } = await request.json();

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const tagList = tags
    ? tags.split(",").map((tag: string) => tag.trim())
    : [];
  const slug = slugify(content);

  const { data, error } = await supabase
    .from("tils")
    .insert([
      {
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
