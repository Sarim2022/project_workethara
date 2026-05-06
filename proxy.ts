import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me_in_prod");

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(session, SECRET);
      const email = payload.email as string;
      const role = payload.role as string;

      // Domain-based route protection
      // If a member tries to access admin-only features or sections (if any were under /dashboard/admin)
      if (request.nextUrl.pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Hard check on domain for extra security
      if (role === "ADMIN" && !email.endsWith("@workspace.in")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect to dashboard if logged in
  if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup" || request.nextUrl.pathname === "/") {
    if (session) {
      try {
        await jwtVerify(session, SECRET);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch (err) {
        // invalid session
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/signup"],
};
