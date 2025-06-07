import { NextRequest, NextResponse } from "next/server";
import { parse } from "./utils";

export function appMiddleware(req: NextRequest) {
  const { path, fullPath } = parse(req);
  if (
    [
      "/",
      "/login",
     
      ,
    ].includes(path) ||
    ["/verify", "/invitations"].some((item) => path.startsWith(item))
  ) {
    return NextResponse.next(); // proceed with the request
  }

  // rewrite other urls
  return NextResponse.rewrite(new URL(`/app${fullPath}`, req.url));
}
