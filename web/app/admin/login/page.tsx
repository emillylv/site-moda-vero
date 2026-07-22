import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { obterSessaoAdmin } from "@/lib/server/adminAuth";

export const metadata: Metadata = {
  title: "Acesso administrativo · Verônica Chaves",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

interface LoginProps {
  searchParams: Promise<{ erro?: string }>;
}

export default async function LoginPage({ searchParams }: LoginProps) {
  if (await obterSessaoAdmin()) redirect("/admin");
  const { erro } = await searchParams;

  return (
    <main className="admin-login">
      <section className="admin-login-card" aria-labelledby="titulo-login">
        <p className="admin-login-marca">Verônica Chaves</p>
        <h1 id="titulo-login">Acesso administrativo</h1>
        <p>Entre para gerenciar a coleção. A credencial é verificada somente no servidor.</p>

        <form method="post" action="/api/admin/session" className="admin-login-form">
          <label htmlFor="senha-admin">Senha</label>
          <input
            id="senha-admin"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={12}
            maxLength={1024}
            required
            autoFocus
          />
          <button type="submit">Entrar</button>
        </form>

        {erro ? (
          <p className="admin-login-erro" role="alert">
            Não foi possível entrar. Verifique a senha e tente novamente mais tarde.
          </p>
        ) : null}

        <Link href="/">← Voltar ao site</Link>
      </section>
    </main>
  );
}
