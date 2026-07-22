import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ds/Button";
import { AdminEditor } from "@/components/admin/AdminEditor";
import { obterSessaoAdmin } from "@/lib/server/adminAuth";

export const metadata: Metadata = {
  title: "Painel da Coleção · Verônica Chaves",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const sessao = await obterSessaoAdmin();
  if (!sessao) redirect("/admin/login");

  return (
    <div className="admin-body">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link href="/" className="logo">
            <span className="logo-nome">Verônica Chaves</span>
            <span className="logo-sub">Painel da coleção</span>
          </Link>
          <div className="admin-header-acoes">
            <ButtonLink href="/" variant="outline" size="sm">
              ← Ver site
            </ButtonLink>
            <form method="post" action="/api/admin/session/logout">
              <input type="hidden" name="csrf" value={sessao.csrf} />
              <button className="admin-sair" type="submit">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <AdminEditor csrfToken={sessao.csrf} />
      </main>

      <footer className="admin-footer">
        <p>Painel interno — não é exibido aos visitantes do site.</p>
      </footer>
    </div>
  );
}
