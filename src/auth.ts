import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.userId = `google_${profile.sub}`;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.userId = token.userId as string;
      return session;
    },
  },
});
