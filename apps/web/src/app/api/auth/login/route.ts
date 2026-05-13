import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const input = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  if (!input?.email || !input.password) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: error.message } },
      { status: 401 },
    );
  }

  return NextResponse.json({ success: true });
}
