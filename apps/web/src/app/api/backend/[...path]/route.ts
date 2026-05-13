import { NextResponse } from "next/server";
import { backendApiUrl } from "@/lib/api/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  return proxyBackend(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxyBackend(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxyBackend(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxyBackend(request, context);
}

async function proxyBackend(request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { path } = await context.params;
  const sourceUrl = new URL(request.url);
  const targetUrl = new URL(`/${path.join("/")}${sourceUrl.search}`, backendApiUrl);

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);
  headers.delete("host");
  headers.delete("cookie");

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
