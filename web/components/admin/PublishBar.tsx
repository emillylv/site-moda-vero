import { Button } from "@/components/ds/Button";
import { Textarea } from "@/components/ds/Input";
import type { StatusAdmin } from "./types";

interface PublishBarProps {
  publicando: boolean;
  status: StatusAdmin;
  jsonGerado: string;
  onPublish: () => void;
  onGenerate: () => void;
  onCopy: () => void;
  onDownload: () => void;
}

export function PublishBar({
  publicando,
  status,
  jsonGerado,
  onPublish,
  onGenerate,
  onCopy,
  onDownload,
}: PublishBarProps) {
  return (
    <section className="admin-exportar">
      <h2>Publicar a coleção</h2>
      <p>
        Quando a coleção estiver pronta, clique em <strong>“Publicar direto no site”</strong>. O
        site é atualizado automaticamente em alguns minutos.
      </p>

      <div className="admin-exportar-acoes">
        <Button variant="primary" onClick={onPublish} disabled={publicando}>
          {publicando ? "Publicando..." : "Publicar direto no site"}
        </Button>
      </div>
      <p
        className="admin-mensagem-status"
        role="status"
        aria-live="polite"
        data-tipo={status.tipo}
      >
        {status.texto}
      </p>

      <details className="admin-exportar-alternativa">
        <summary>Prefere gerar o arquivo manualmente?</summary>
        <div className="admin-exportar-acoes">
          <Button variant="outline" size="sm" onClick={onGenerate}>
            Gerar arquivo
          </Button>
          <Button variant="outline" size="sm" onClick={onCopy} disabled={!jsonGerado}>
            Copiar conteúdo
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload} disabled={!jsonGerado}>
            Baixar trends.json
          </Button>
        </div>
        <Textarea
          className="admin-saida-codigo"
          readOnly
          rows={14}
          value={jsonGerado}
          placeholder="O JSON gerado vai aparecer aqui depois que você clicar em “Gerar arquivo”."
        />
      </details>
    </section>
  );
}
