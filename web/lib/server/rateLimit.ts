import "server-only";

import crypto from "node:crypto";
import { isIP } from "node:net";

interface Registro {
  contador: number;
  reiniciaEm: number;
}

const MAX_CHAVES = 5_000;
const baldes = new Map<string, Registro>();
let chamadas = 0;

function limpar(agora: number) {
  chamadas += 1;
  if (chamadas % 128 !== 0 && baldes.size < MAX_CHAVES) return;
  for (const [chave, registro] of baldes) {
    if (agora >= registro.reiniciaEm) baldes.delete(chave);
  }
}

export function verificarLimite(chaveRecebida: string, max: number, janelaMs: number) {
  const agora = Date.now();
  limpar(agora);
  let chave = chaveRecebida;
  if (!baldes.has(chave) && baldes.size >= MAX_CHAVES) chave = "limite:excedente";

  const atual = baldes.get(chave);
  if (!atual || agora >= atual.reiniciaEm) {
    const reiniciaEm = agora + janelaMs;
    baldes.set(chave, { contador: 1, reiniciaEm });
    return { permitido: true, restante: Math.max(0, max - 1), reiniciaEm };
  }
  atual.contador += 1;
  return {
    permitido: atual.contador <= max,
    restante: Math.max(0, max - atual.contador),
    reiniciaEm: atual.reiniciaEm,
  };
}

function primeiroIpValido(valor: string | null): string | null {
  if (!valor) return null;
  const ip = valor.split(",", 1)[0].trim();
  return isIP(ip) ? ip : null;
}

export function chaveCliente(req: Request): string {
  // Só confie em headers encaminhados quando o deploy garante que o proxy os
  // sobrescreve. Sem isso, um balde global é mais seguro que um XFF forjável.
  let ip: string | null = null;
  if (process.env.TRUST_PROXY === "1") {
    ip = primeiroIpValido(req.headers.get("x-real-ip"));
    if (!ip) ip = primeiroIpValido(req.headers.get("x-forwarded-for"));
  }
  return crypto.createHash("sha256").update(ip || "origem-global").digest("base64url").slice(0, 22);
}
