import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ds/Button";
import { AdminEditor } from "@/components/admin/AdminEditor";

export const metadata: Metadata = {
  title: "Painel da Coleção · Verônica Chaves",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="admin-body">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link href="/" className="logo">
            <span className="logo-nome">Verônica Chaves</span>
            <span className="logo-sub">Painel da coleção</span>
          </Link>
          <ButtonLink href="/" variant="outline" size="sm">
            ← Ver site
          </ButtonLink>
        </div>
      </header>

      <main className="admin-main">
        <AdminEditor />
      </main>

      <footer className="admin-footer">
        <p>Painel interno — não é exibido aos visitantes do site.</p>
      </footer>
    </div>
  );
}
