import "server-only";

import { cookies } from "next/headers";
import { verificarSenha, hashSenhaValido } from "@/lib/security/password";
import {
  criarTokenSessao,
  DURACAO_SESSAO_SEGUNDOS,
  segredoSessaoValido,
  verificarTokenSessao,
  type AdminSession,
} from "@/lib/security/sessionToken";

const COOKIE_PRODUCAO = "__Host-vero-admin";
const COOKIE_DESENVOLVIMENTO = "vero-admin";

interface ConfigAdmin {
  hashSenha: string;
  segredo: string;
}

function lerConfig(): ConfigAdmin | null {
  const hashSenha = process.env.ADMIN_PASSWORD_HASH;
  const segredo = process.env.ADMIN_SESSION_SECRET;
  if (!hashSenhaValido(hashSenha) || !segredoSessaoValido(segredo)) return null;
  return { hashSenha, segredo };
}

export function nomeCookieAdmin(): string {
  return process.env.NODE_ENV === "production" ? COOKIE_PRODUCAO : COOKIE_DESENVOLVIMENTO;
}

export function opcoesCookieAdmin() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
    priority: "high" as const,
  };
}

export async function autenticarSenhaAdmin(senha: unknown): Promise<boolean> {
  const config = lerConfig();
  if (!config) return false;
  return verificarSenha(senha, config.hashSenha);
}

export function novaSessaoAdmin(): { token: string; sessao: AdminSession } | null {
  const config = lerConfig();
  if (!config) return null;
  return criarTokenSessao(config.segredo, config.hashSenha);
}

export async function obterSessaoAdmin(): Promise<AdminSession | null> {
  const config = lerConfig();
  if (!config) return null;
  const token = (await cookies()).get(nomeCookieAdmin())?.value;
  return verificarTokenSessao(token, config.segredo, config.hashSenha);
}
