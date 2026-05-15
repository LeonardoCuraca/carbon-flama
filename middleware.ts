import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextauth.token?.role as string;
    const urlPath = req.nextUrl.pathname;

    // Redirección simple si intenta entrar a dashboard sin estar logueado (ya manejado por withAuth)
    // Pero aquí podemos añadir lógica de protección de rutas por rol
    if (urlPath.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (urlPath.startsWith("/dashboard/mozo") && !["ADMIN", "MOZO"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (urlPath.startsWith("/dashboard/cocina") && !["ADMIN", "COCINA"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (urlPath.startsWith("/dashboard/caja") && !["ADMIN", "CAJA"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (urlPath.startsWith("/dashboard/inventario") && !["ADMIN", "INVENTARIO"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
