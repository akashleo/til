import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isAdmin() {
  const cookieStore = cookies();
  return cookieStore.get("authToken") ? true : false;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = params;
  const updates = await request.json();

  const { data, error } = await supabaseAdmin
    .from("til")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = params;

  const { error } = await supabaseAdmin.from("til").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
