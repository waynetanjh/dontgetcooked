import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authApi } from "@/lib/api";
import { loginSchema } from "@/lib/validations";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      telegramUsername?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    telegramUsername?: string;
    accessToken: string;
  }

  interface JWT {
    accessToken?: string;
    id?: string;
    telegramUsername?: string;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validatedFields = loginSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          // Call backend API to authenticate
          const response = await authApi.login({ email, password });

          if (response.data?.token && response.data?.user) {
            return {
              id: response.data.user.id,
              name: response.data.user.telegramUsername || response.data.user.email,
              email: response.data.user.email,
              telegramUsername: response.data.user.telegramUsername,
              accessToken: response.data.token,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.telegramUsername = user.telegramUsername;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string | undefined;
        session.user.id = token.id as string;
        session.user.telegramUsername = token.telegramUsername as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
