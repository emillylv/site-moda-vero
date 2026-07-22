"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ds/Button";
import { Field, Input } from "@/components/ds/Input";
import { caminhoImagemValido } from "@/lib/validation";

const MAX_IMAGEM_BYTES = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const ACCEPT_IMAGENS = [...TIPOS_PERMITIDOS].join(",");

interface ImageUploaderProps {
  id: string;
  csrfToken: string;
  onPreviewChange: (url: string) => void;
  onUploaded: (caminho: string) => void;
}

interface RespostaUpload {
  status?: unknown;
  caminho?: unknown;
}

function lerArquivoComoBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    leitor.onload = () => {
      if (typeof leitor.result !== "string") {
        reject(new Error("Não foi possível ler a imagem."));
        return;
      }

      const separador = leitor.result.indexOf(",");
      if (separador < 0) {
        reject(new Error("Formato de imagem inválido."));
        return;
      }
      resolve(leitor.result.slice(separador + 1));
    };
    leitor.readAsDataURL(arquivo);
  });
}

async function lerResposta(resposta: Response): Promise<RespostaUpload> {
  const corpo: unknown = await resposta.json().catch(() => null);
  return corpo && typeof corpo === "object" && !Array.isArray(corpo)
    ? (corpo as RespostaUpload)
    : {};
}

export function ImageUploader({
  id,
  csrfToken,
  onPreviewChange,
  onUploaded,
}: ImageUploaderProps) {
  const [enviando, setEnviando] = useState(false);
  const [arquivoPendente, setArquivoPendente] = useState<File | null>(null);
  const [status, setStatus] = useState<{ texto: string; tipo: "ok" | "erro" | "" }>({
    texto: "",
    tipo: "",
  });
  const urlPreview = useRef<string | null>(null);
  const requisicao = useRef<AbortController | null>(null);
  const inputArquivo = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      requisicao.current?.abort();
      if (urlPreview.current) URL.revokeObjectURL(urlPreview.current);
    };
  }, []);

  function definirPreview(arquivo: File) {
    if (urlPreview.current) URL.revokeObjectURL(urlPreview.current);
    const url = URL.createObjectURL(arquivo);
    urlPreview.current = url;
    onPreviewChange(url);
  }

  function selecionarImagem(evento: ChangeEvent<HTMLInputElement>) {
    const input = evento.currentTarget;
    inputArquivo.current = input;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    const tipo = arquivo.type.toLowerCase();
    if (!TIPOS_PERMITIDOS.has(tipo)) {
      setStatus({
        texto: "Escolha uma imagem JPEG, PNG, WebP, GIF ou AVIF.",
        tipo: "erro",
      });
      setArquivoPendente(null);
      input.value = "";
      return;
    }
    if (arquivo.size === 0 || arquivo.size > MAX_IMAGEM_BYTES) {
      setStatus({ texto: "A imagem deve ter no máximo 5 MiB.", tipo: "erro" });
      setArquivoPendente(null);
      input.value = "";
      return;
    }

    definirPreview(arquivo);
    setArquivoPendente(arquivo);
    setStatus({
      texto: "Revise a prévia e confirme o envio. Nada foi transmitido ainda.",
      tipo: "",
    });
  }

  async function enviarImagem() {
    const arquivo = arquivoPendente;
    if (!arquivo) return;
    if (!csrfToken) {
      setStatus({ texto: "Sua sessão não pôde ser validada. Recarregue a página.", tipo: "erro" });
      return;
    }

    setEnviando(true);
    setStatus({ texto: "Enviando imagem...", tipo: "" });

    const controlador = new AbortController();
    requisicao.current?.abort();
    requisicao.current = controlador;

    try {
      const conteudo = await lerArquivoComoBase64(arquivo);
      const resposta = await fetch("/api/admin/images", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ conteudo }),
        signal: controlador.signal,
      });
      if (!resposta.ok) {
        const mensagem =
          resposta.status === 401 || resposta.status === 403
            ? "Sua sessão expirou. Recarregue a página e entre novamente."
            : "Não foi possível enviar a imagem.";
        setStatus({ texto: mensagem, tipo: "erro" });
        return;
      }

      const corpo = await lerResposta(resposta);

      if (
        corpo.status !== "ok" ||
        typeof corpo.caminho !== "string" ||
        !caminhoImagemValido(corpo.caminho)
      ) {
        setStatus({ texto: "O servidor retornou uma resposta de upload inválida.", tipo: "erro" });
        return;
      }

      onUploaded(corpo.caminho);
      if (urlPreview.current) URL.revokeObjectURL(urlPreview.current);
      urlPreview.current = null;
      onPreviewChange(corpo.caminho);
      setArquivoPendente(null);
      if (inputArquivo.current) inputArquivo.current.value = "";
      setStatus({
        texto: "Imagem enviada ao repositório. Publique a coleção para exibi-la no site.",
        tipo: "ok",
      });
    } catch (erro) {
      if ((erro as Error).name !== "AbortError") {
        setStatus({ texto: "Erro de conexão ao enviar a imagem.", tipo: "erro" });
      }
    } finally {
      if (requisicao.current === controlador) requisicao.current = null;
      setEnviando(false);
    }
  }

  return (
    <Field label="Enviar nova foto principal" htmlFor={id}>
      <Input
        id={id}
        type="file"
        accept={ACCEPT_IMAGENS}
        disabled={enviando}
        aria-describedby={`${id}-status`}
        onChange={selecionarImagem}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!arquivoPendente || enviando}
        onClick={enviarImagem}
      >
        {enviando ? "Enviando..." : "Confirmar envio da foto"}
      </Button>
      <p
        id={`${id}-status`}
        className="admin-mensagem-status"
        role="status"
        aria-live="polite"
        data-tipo={status.tipo}
      >
        {status.texto}
      </p>
    </Field>
  );
}
