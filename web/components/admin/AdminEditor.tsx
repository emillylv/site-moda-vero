"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ds/Button";
import { Field, Input } from "@/components/ds/Input";
import {
  caminhoImagemValido,
  montarConteudoArquivo,
  type CatalogPayload,
} from "@/lib/validation";
import { colecaoTendencias, ETIQUETAS_VALIDAS } from "@/lib/trends";
import { CatalogPreview } from "./CatalogPreview";
import { LookEditorCard } from "./LookEditorCard";
import { PublishBar } from "./PublishBar";
import type { CampoLookEdicao, LookEdicao, StatusAdmin } from "./types";

interface AdminEditorProps {
  csrfToken: string;
}

function itensIniciais(): LookEdicao[] {
  return (colecaoTendencias.itens || []).map((item, indice) => ({
    id: indice + 1,
    imagem: item.imagem || "",
    imagemHover: item.imagemHover || "",
    titulo: item.titulo || "",
    etiqueta: item.etiqueta || "",
  }));
}

export function AdminEditor({ csrfToken }: AdminEditorProps) {
  const [nome, setNome] = useState(colecaoTendencias.colecao || "");
  const [itens, setItens] = useState<LookEdicao[]>(itensIniciais);
  const [publicando, setPublicando] = useState(false);
  const [status, setStatus] = useState<StatusAdmin>({ texto: "", tipo: "" });
  const [jsonGerado, setJsonGerado] = useState("");
  const proximoId = useRef(colecaoTendencias.itens.length + 1);

  function marcarComoAlterado() {
    setJsonGerado("");
  }

  function atualizarNome(valor: string) {
    setNome(valor);
    marcarComoAlterado();
  }

  function atualizarItem(id: number, campo: CampoLookEdicao, valor: string) {
    setItens((atual) =>
      atual.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    );
    marcarComoAlterado();
  }

  function adicionarLook() {
    if (itens.length >= 200) {
      setStatus({ texto: "A coleção pode ter no máximo 200 looks.", tipo: "erro" });
      return;
    }
    const id = proximoId.current++;
    setItens((atual) => [
      ...atual,
      { id, imagem: "", imagemHover: "", titulo: "", etiqueta: "Tendência" },
    ]);
    marcarComoAlterado();
  }

  function removerLook(id: number) {
    setItens((atual) => atual.filter((item) => item.id !== id));
    marcarComoAlterado();
  }

  function moverLook(id: number, direcao: -1 | 1) {
    setItens((atual) => {
      const indice = atual.findIndex((item) => item.id === id);
      const novoIndice = indice + direcao;
      if (indice < 0 || novoIndice < 0 || novoIndice >= atual.length) return atual;
      const copia = [...atual];
      const [item] = copia.splice(indice, 1);
      copia.splice(novoIndice, 0, item);
      return copia;
    });
    marcarComoAlterado();
  }

  function validarLocal(): string | null {
    if (nome.length > 200) return "O nome da coleção deve ter no máximo 200 caracteres.";
    if (itens.length > 200) return "A coleção deve ter no máximo 200 looks.";
    for (const item of itens) {
      if (!caminhoImagemValido(item.imagem)) {
        return "Cada foto principal deve usar um caminho seguro dentro de /imgs (ex.: /imgs/0001.jpg).";
      }
      if (item.imagemHover && !caminhoImagemValido(item.imagemHover)) {
        return "Cada foto de hover deve usar um caminho seguro dentro de /imgs.";
      }
      if (item.titulo.length > 200) return "Os títulos devem ter no máximo 200 caracteres.";
      if (!ETIQUETAS_VALIDAS.includes(item.etiqueta as (typeof ETIQUETAS_VALIDAS)[number])) {
        return "Há uma etiqueta inválida na coleção.";
      }
    }
    return null;
  }

  function montarPayload(): CatalogPayload {
    return {
      colecao: nome,
      itens: itens.map((item) => ({
        imagem: item.imagem,
        imagemHover: item.imagemHover,
        titulo: item.titulo,
        etiqueta: item.etiqueta,
      })),
    };
  }

  async function publicar() {
    if (!csrfToken) {
      setStatus({ texto: "Sua sessão não pôde ser validada. Recarregue a página.", tipo: "erro" });
      return;
    }
    if (itens.length === 0) {
      setStatus({ texto: "Adicione pelo menos um look antes de publicar.", tipo: "erro" });
      return;
    }
    const erroLocal = validarLocal();
    if (erroLocal) {
      setStatus({ texto: erroLocal, tipo: "erro" });
      return;
    }

    setPublicando(true);
    setStatus({ texto: "Publicando...", tipo: "" });
    try {
      const resposta = await fetch("/api/admin/catalog", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(montarPayload()),
      });
      if (!resposta.ok) {
        const mensagem =
          resposta.status === 401 || resposta.status === 403
            ? "Sua sessão expirou. Recarregue a página e entre novamente."
            : "Não foi possível publicar. Tente novamente.";
        setStatus({ texto: mensagem, tipo: "erro" });
        return;
      }

      setStatus({ texto: "Publicado! O site vai atualizar em alguns minutos.", tipo: "ok" });
    } catch {
      setStatus({
        texto: "Erro de conexão. Verifique sua internet e tente novamente.",
        tipo: "erro",
      });
    } finally {
      setPublicando(false);
    }
  }

  function gerarArquivo() {
    const erroLocal = validarLocal();
    if (erroLocal) {
      setStatus({ texto: erroLocal, tipo: "erro" });
      return;
    }
    setJsonGerado(montarConteudoArquivo(montarPayload()));
    setStatus({ texto: "Arquivo JSON gerado abaixo.", tipo: "ok" });
  }

  function baixarArquivo() {
    if (!jsonGerado) return;
    const blob = new Blob([jsonGerado], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trends.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function copiarConteudo() {
    if (!jsonGerado) return;
    try {
      await navigator.clipboard.writeText(jsonGerado);
      setStatus({ texto: "Conteúdo copiado.", tipo: "ok" });
    } catch {
      setStatus({ texto: "Não foi possível copiar automaticamente.", tipo: "erro" });
    }
  }

  return (
    <>
      <section className="admin-intro">
        <h1>Editar a coleção de tendências</h1>
        <p>
          Aqui você monta visualmente os looks que aparecem na seção <strong>Tendências</strong>{" "}
          do site, sem escrever código. Ao terminar, clique em{" "}
          <strong>“Publicar direto no site”</strong>.
        </p>
        <ol className="admin-passos-rapidos">
          <li>Envie uma foto diretamente em cada look ou informe um caminho em /imgs.</li>
          <li>Edite, adicione, reordene ou remova os looks.</li>
          <li>Confira a prévia e publique a coleção.</li>
        </ol>
      </section>

      <section className="admin-campo-colecao">
        <Field label="Nome da coleção atual" htmlFor="input-nome-colecao">
          <Input
            id="input-nome-colecao"
            value={nome}
            maxLength={200}
            placeholder="Ex.: Verão 2026"
            onChange={(evento) => atualizarNome(evento.target.value)}
          />
        </Field>
      </section>

      <section className="admin-editor">
        <div className="admin-coluna-lista">
          <div className="admin-coluna-cabecalho">
            <h2>Looks da coleção</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={adicionarLook}
              disabled={itens.length >= 200}
            >
              + Adicionar look
            </Button>
          </div>

          {itens.length === 0 ? (
            <div className="lista-vazia">
              Nenhum look na coleção ainda. Clique em “+ Adicionar look” para começar.
            </div>
          ) : (
            <div className="lista-looks">
              {itens.map((item, indice) => (
                <LookEditorCard
                  key={item.id}
                  item={item}
                  indice={indice}
                  total={itens.length}
                  csrfToken={csrfToken}
                  onChange={atualizarItem}
                  onMove={moverLook}
                  onRemove={removerLook}
                />
              ))}
            </div>
          )}
        </div>

        <CatalogPreview itens={itens} />
      </section>

      <PublishBar
        publicando={publicando}
        status={status}
        jsonGerado={jsonGerado}
        onPublish={publicar}
        onGenerate={gerarArquivo}
        onCopy={copiarConteudo}
        onDownload={baixarArquivo}
      />
    </>
  );
}
