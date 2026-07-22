import "server-only";

import { csrfValido, type AdminSession } from "@/lib/security/sessionToken";
import { obterOrigemSite } from "@/lib/server/siteUrl";

export interface FalhaCorpo {
  ok: false;
  status: 400 | 413 | 415;
  mensagem: string;
}

export interface CorpoOk<T> {
  ok: true;
  valor: T;
}

export function urlConfiavel(caminho: string): URL {
  const origem = obterOrigemSite();
  if (!origem) throw new Error("SITE_URL não está configurada com uma origem segura.");
  return new URL(caminho, origem);
}

export function origemMutacaoValida(req: Request): boolean {
  const esperada = obterOrigemSite();
  const origem = req.headers.get("origin");
  const fetchSite = req.headers.get("sec-fetch-site");
  if (!esperada || !origem || origem !== esperada.origin) return false;
  if (fetchSite && fetchSite !== "same-origin") return false;

  const usaProxy = process.env.TRUST_PROXY === "1";
  const hostRecebido = (usaProxy ? req.headers.get("x-forwarded-host") : req.headers.get("host"))
    ?.split(",", 1)[0]
    .trim()
    .toLowerCase();
  if (!hostRecebido || hostRecebido !== esperada.host.toLowerCase()) return false;
  if (usaProxy) {
    const protocolo = req.headers.get("x-forwarded-proto")?.split(",", 1)[0].trim();
    if (!protocolo || `${protocolo}:` !== esperada.protocol) return false;
  }
  return true;
}

export function requisicaoAdminValida(
  req: Request,
  sessao: AdminSession,
  csrf: unknown
): boolean {
  return origemMutacaoValida(req) && csrfValido(csrf, sessao);
}

function tipoConteudo(req: Request): string {
  return (req.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase();
}

export async function lerTextoLimitado(
  req: Request,
  limiteBytes: number,
  tipoEsperado: string
): Promise<CorpoOk<string> | FalhaCorpo> {
  if (tipoConteudo(req) !== tipoEsperado) {
    return { ok: false, status: 415, mensagem: `Use Content-Type ${tipoEsperado}.` };
  }
  if (req.headers.get("content-encoding")) {
    return { ok: false, status: 415, mensagem: "Corpo comprimido não é aceito." };
  }
  const declarado = req.headers.get("content-length");
  if (declarado) {
    const tamanho = Number(declarado);
    if (!Number.isSafeInteger(tamanho) || tamanho < 0) {
      return { ok: false, status: 400, mensagem: "Content-Length inválido." };
    }
    if (tamanho > limiteBytes) {
      return { ok: false, status: 413, mensagem: "Corpo da requisição grande demais." };
    }
  }

  if (!req.body) return { ok: true, valor: "" };
  const leitor = req.body.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await leitor.read();
      if (done) break;
      total += value.byteLength;
      if (total > limiteBytes) {
        try {
          await leitor.cancel();
        } catch {
          // O limite excedido continua sendo o erro principal, mesmo se o cancelamento falhar.
        }
        return { ok: false, status: 413, mensagem: "Corpo da requisição grande demais." };
      }
      partes.push(value);
    }
    const bytes = Buffer.concat(partes.map((parte) => Buffer.from(parte)), total);
    return { ok: true, valor: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, status: 400, mensagem: "Corpo da requisição inválido." };
  } finally {
    leitor.releaseLock();
  }
}

export async function lerJsonLimitado<T = unknown>(
  req: Request,
  limiteBytes: number
): Promise<CorpoOk<T> | FalhaCorpo> {
  const texto = await lerTextoLimitado(req, limiteBytes, "application/json");
  if (!texto.ok) return texto;
  try {
    return { ok: true, valor: JSON.parse(texto.valor) as T };
  } catch {
    return { ok: false, status: 400, mensagem: "Corpo JSON inválido." };
  }
}
