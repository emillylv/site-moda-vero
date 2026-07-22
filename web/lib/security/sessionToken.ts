import crypto from "node:crypto";

export const DURACAO_SESSAO_SEGUNDOS = 8 * 60 * 60;

export interface AdminSession {
  v: 1;
  exp: number;
  csrf: string;
  auth: string;
}

function assinatura(conteudo: string, segredo: string): string {
  return crypto.createHmac("sha256", segredo).update(conteudo, "utf8").digest("base64url");
}

function iguaisEmTempoConstante(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function segredoSessaoValido(segredo: unknown): segredo is string {
  return typeof segredo === "string" && Buffer.byteLength(segredo, "utf8") >= 32;
}

export function versaoAutenticacao(hashSenha: string, segredo: string): string {
  return crypto
    .createHmac("sha256", segredo)
    .update(`auth:${hashSenha}`, "utf8")
    .digest("base64url")
    .slice(0, 22);
}

export function criarTokenSessao(
  segredo: string,
  hashSenha: string,
  agora = Date.now()
): { token: string; sessao: AdminSession } {
  if (!segredoSessaoValido(segredo)) throw new Error("Segredo de sessão inválido.");

  const sessao: AdminSession = {
    v: 1,
    exp: Math.floor(agora / 1000) + DURACAO_SESSAO_SEGUNDOS,
    csrf: crypto.randomBytes(32).toString("base64url"),
    auth: versaoAutenticacao(hashSenha, segredo),
  };
  const payload = Buffer.from(JSON.stringify(sessao), "utf8").toString("base64url");
  return { token: `${payload}.${assinatura(payload, segredo)}`, sessao };
}

export function verificarTokenSessao(
  token: unknown,
  segredo: string,
  hashSenha: string,
  agora = Date.now()
): AdminSession | null {
  if (typeof token !== "string" || token.length > 1024 || !segredoSessaoValido(segredo)) {
    return null;
  }

  const partes = token.split(".");
  if (partes.length !== 2) return null;
  const [payload, recebida] = partes;
  if (!payload || !recebida || !iguaisEmTempoConstante(recebida, assinatura(payload, segredo))) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<AdminSession>;
    if (
      parsed.v !== 1 ||
      typeof parsed.exp !== "number" ||
      !Number.isSafeInteger(parsed.exp) ||
      parsed.exp <= Math.floor(agora / 1000) ||
      typeof parsed.csrf !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(parsed.csrf) ||
      typeof parsed.auth !== "string" ||
      !iguaisEmTempoConstante(parsed.auth, versaoAutenticacao(hashSenha, segredo))
    ) {
      return null;
    }
    return parsed as AdminSession;
  } catch {
    return null;
  }
}

export function csrfValido(recebido: unknown, sessao: AdminSession): boolean {
  return typeof recebido === "string" && iguaisEmTempoConstante(recebido, sessao.csrf);
}
