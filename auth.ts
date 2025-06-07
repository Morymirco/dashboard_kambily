import { jwtDecode } from "jwt-decode";
import NextAuth, { User } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";


declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      token_type: "access" | "refresh";
      exp: number;
      iat: number;
      user_id: number;
    };
  }
}

const providers: Provider[] = [
  Credentials({
    credentials: { password: {}, email: {} },
    async authorize(credentials) {
      try {
        const tokens = await authService.login({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        (await cookies()).set("accessToken", tokens.access);
        (await cookies()).set("refreshToken", tokens.refresh);

        const user: User = jwtDecode(tokens.access);

        return user;
      } catch (error: any) {
        throw error;
      }
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    session: ({ session, token }) => {
      return { expires: session.expires, user: token as any };
    },
  },
});
