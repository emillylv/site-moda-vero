"use client";

import { useState } from "react";
import "./admin.css";
import { Button } from "@/components/ds/Button";
import { Field, Input, Select, Textarea } from "@/components/ds/Input";
import {
  caminhoImagemValido,
  montarConteudoArquivo,
  type CatalogPayload,
} from "@/lib/validation";
import { colecaoTendencias, ETIQUETAS_VALIDAS, type Colecao } from "@/lib/trends";

interface LookEdicao {
  id: number;
  imagem: string;
  imagemHover: string;
  titulo: string;
  etiqueta: string;
}

const OPCOES_ETIQUETA = [
  { valor: "Tendência", rotulo: "Tendência" },
  { valor: "Novo", rotulo: "Novo" },
  { valor: "Mais pedido", rotulo: "Mais pedido" },
  { valor: "Edição limitada", rotulo: "Edição limitada" },
  { valor: "", rotulo: "Sem etiqueta" },
];

let contadorId = 1;

function estadoInicial(colecao: Colecao): { nome: string; itens: LookEdicao[] } {
  return {
    nome: colecao.colecao || "",
    itens: (colecao.itens || []).map((item) => ({
      id: contadorId++,
      imagem: item.imagem || "",
      imagemHover: item.imagemHover || "",
      titulo: item.titulo || "",
      etiqueta: item.etiqueta || "",
    })),
  };
}

const inicial = estadoInicial(colecaoTendencias);

export function AdminEditor() {
  const [nome, setNome] = useState(inicial.nome);
  const [itens, setItens] = useState<LookEdicao[]>(inicial.itens);
  const [token, setToken] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [status, setStatus] = useState<{ texto: string; tipo: "ok" | "erro" | "" }>({
    texto: "",
    tipo: "",
  });
  const [codigoGerado, setCodigoGerado] = useState("");

  function atualizarItem(id: number, campo: keyof LookEdicao, valor: string) {
    setItens((atual) =>
      atual.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    );
  }

  function adicionarLook() {
    setItens((atual) => [
      ...atual,
      { id: contadorId++, imagem: "", imagemHover: "", titulo: "", etiqueta: "Tendência" },
    ]);
  }

  function removerLook(id: number) {
    setItens((atual) => atual.filter((item) => item.id !== id));
  }

  function moverLook(id: number, direcao: -1 | 1) {
    setItens((atual) => {
      const indice = atual.findIndex((i) => i.id === id);
      const novo = indice + direcao;
      if (novo < 0 || novo >= atual.length) return atual;
      const copia = [...atual];
      const [item] = copia.splice(indice, 1);
      copia.splice(novo, 0, item);
      return copia;
    });
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
    }
    return null;
  }

  function payload(): CatalogPayload {
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
    const t = token.trim();
    if (!t) {
      setStatus({ texto: "Informe a chave de acesso antes de publicar.", tipo: "erro" });
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
      const resposta = await fetch("/api/catalog/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(payload()),
      });
      if (resposta.status === 401) {
        setStatus({ texto: "Chave de acesso incorreta.", tipo: "erro" });
        return;
      }
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}));
        setStatus({
          texto: corpo.mensagem || "Não foi possível publicar. Tente novamente.",
          tipo: "erro",
        });
        return;
      }
      setStatus({ texto: "Publicado! O site vai atualizar em alguns minutos.", tipo: "ok" });
      setToken("");
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
    setCodigoGerado(montarConteudoArquivo(payload()));
    setStatus({ texto: "Arquivo gerado abaixo.", tipo: "ok" });
  }

  function baixarArquivo() {
    if (!codigoGerado) return;
    const blob = new Blob([codigoGerado], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trends.ts";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function copiarCodigo() {
    if (!codigoGerado) return;
    try {
      await navigator.clipboard.writeText(codigoGerado);
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
          <strong>“Publicar direto no site”</strong> e informe sua chave de acesso.
        </p>
        <ol className="admin-passos-rapidos">
          <li>
            Envie as fotos novas para a pasta <code>public/imgs</code> do site (ou pela API de
            upload).
          </li>
          <li>Edite, adicione ou remova looks aqui embaixo.</li>
          <li>Publique — o site atualiza sozinho em alguns minutos.</li>
        </ol>
      </section>

      <section className="admin-campo-colecao">
        <Field label="Nome da coleção atual" htmlFor="input-nome-colecao">
          <Input
            id="input-nome-colecao"
            value={nome}
            placeholder="Ex.: Verão 2026"
            onChange={(e) => setNome(e.target.value)}
          />
        </Field>
      </section>

      <section className="admin-editor">
        <div className="admin-coluna-lista">
          <div className="admin-coluna-cabecalho">
            <h2>Looks da coleção</h2>
            <Button variant="primary" size="sm" onClick={adicionarLook}>
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
                <div className="look-editor-card" key={item.id}>
                  <div className="look-editor-thumb">
                    {item.imagem ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imagem} alt="" />
                    ) : (
                      <span>Prévia da foto principal</span>
                    )}
                  </div>
                  <div className="look-editor-campos">
                    <div className="campo-largo">
                      <Field label="Título do look" htmlFor={`titulo-${item.id}`}>
                        <Input
                          id={`titulo-${item.id}`}
                          value={item.titulo}
                          placeholder="Ex.: Alfaiataria leve"
                          onChange={(e) => atualizarItem(item.id, "titulo", e.target.value)}
                        />
                      </Field>
                    </div>
                    <Field label="Foto principal" htmlFor={`imagem-${item.id}`}>
                      <Input
                        id={`imagem-${item.id}`}
                        value={item.imagem}
                        placeholder="/imgs/0001.jpg"
                        onChange={(e) => atualizarItem(item.id, "imagem", e.target.value)}
                      />
                    </Field>
                    <Field label="Foto ao passar o mouse" htmlFor={`hover-${item.id}`}>
                      <Input
                        id={`hover-${item.id}`}
                        value={item.imagemHover}
                        placeholder="/imgs/0001-alt.jpg"
                        onChange={(e) => atualizarItem(item.id, "imagemHover", e.target.value)}
                      />
                    </Field>
                    <div className="campo-largo">
                      <Field label="Etiqueta" htmlFor={`etiqueta-${item.id}`}>
                        <Select
                          id={`etiqueta-${item.id}`}
                          value={item.etiqueta}
                          onChange={(e) => atualizarItem(item.id, "etiqueta", e.target.value)}
                        >
                          {OPCOES_ETIQUETA.map((op) => (
                            <option key={op.rotulo} value={op.valor}>
                              {op.rotulo}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                    <div className="look-editor-acoes">
                      <div className="look-editor-mover">
                        <button
                          type="button"
                          className="botao-icone"
                          title="Mover para cima"
                          disabled={indice === 0}
                          onClick={() => moverLook(item.id, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="botao-icone"
                          title="Mover para baixo"
                          disabled={indice === itens.length - 1}
                          onClick={() => moverLook(item.id, 1)}
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        type="button"
                        className="botao-remover"
                        onClick={() => removerLook(item.id)}
                      >
                        Remover look
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-coluna-preview">
          <h2>Prévia no site</h2>
          <p className="admin-preview-legenda">
            É assim que vai aparecer na seção Tendências.
          </p>
          {itens.length === 0 ? (
            <p className="admin-preview-vazio">
              A prévia vai aparecer aqui assim que você adicionar um look.
            </p>
          ) : (
            <div className="grade-tendencias admin-preview-grade">
              {itens.map((item, indice) => (
                <article className="look-card em-vista" key={item.id}>
                  {item.etiqueta ? <span className="look-tag">{item.etiqueta}</span> : null}
                  <div className="look-card-imagem">
                    {item.imagem ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="imagem-base" src={item.imagem} alt="" />
                    ) : (
                      <div className="admin-preview-sem-foto">Sem foto definida</div>
                    )}
                  </div>
                  <div className="look-card-legenda">
                    <p className="look-card-titulo">{item.titulo || "Sem título"}</p>
                    <span className="look-card-indice">
                      {String(indice + 1).padStart(2, "0")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="admin-exportar">
        <h2>Publicar a coleção</h2>
        <p>
          Quando a coleção estiver pronta, clique em <strong>“Publicar direto no site”</strong> e
          informe sua chave de acesso. O site é atualizado automaticamente em alguns minutos.
        </p>

        <div className="admin-exportar-acoes">
          <Input
            type="password"
            className="admin-input-token"
            value={token}
            placeholder="Chave de acesso"
            autoComplete="off"
            minLength={32}
            spellCheck={false}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button variant="primary" onClick={publicar} disabled={publicando}>
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
            <Button variant="outline" size="sm" onClick={gerarArquivo}>
              Gerar arquivo
            </Button>
            <Button variant="outline" size="sm" onClick={copiarCodigo} disabled={!codigoGerado}>
              Copiar conteúdo
            </Button>
            <Button variant="outline" size="sm" onClick={baixarArquivo} disabled={!codigoGerado}>
              Baixar trends.ts
            </Button>
          </div>
          <Textarea
            className="admin-saida-codigo"
            readOnly
            rows={14}
            value={codigoGerado}
            placeholder="O conteúdo gerado vai aparecer aqui depois que você clicar em “Gerar arquivo”."
          />
        </details>
      </section>
    </>
  );
}
