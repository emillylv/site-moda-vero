import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
const N = 2 ** 15;
const R = 8;
const P = 3;
const TAMANHO_HASH = 64;
const MAX_MEMORIA = 48 * 1024 * 1024;

interface HashScrypt {
  salt: Buffer;
  hash: Buffer;
}

function analisarHash(valor: unknown): HashScrypt | null {
  if (typeof valor !== "string" || valor.length > 512) return null;
  const partes = valor.split("$");
  if (
    partes.length !== 6 ||
    partes[0] !== "scrypt" ||
    partes[1] !== String(N) ||
    partes[2] !== String(R) ||
    partes[3] !== String(P)
  ) {
    return null;
  }
  if (!/^[A-Za-z0-9_-]{22}$/.test(partes[4]) || !/^[A-Za-z0-9_-]{86}$/.test(partes[5])) {
    return null;
  }
  try {
    const salt = Buffer.from(partes[4], "base64url");
    const hash = Buffer.from(partes[5], "base64url");
    if (salt.length !== 16 || hash.length !== TAMANHO_HASH) return null;
    return { salt, hash };
  } catch {
    return null;
  }
}

async function derivar(senha: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      senha.normalize("NFKC"),
      salt,
      TAMANHO_HASH,
      { N, r: R, p: P, maxmem: MAX_MEMORIA },
      (erro, derivado) => (erro ? reject(erro) : resolve(derivado))
    );
  });
}

export function hashSenhaValido(valor: unknown): valor is string {
  return analisarHash(valor) !== null;
}

export async function criarHashSenha(senha: string): Promise<string> {
  if (typeof senha !== "string" || senha.length < 12 || Buffer.byteLength(senha, "utf8") > 1024) {
    throw new Error("A senha deve ter entre 12 e 1024 bytes.");
  }
  const salt = randomBytes(16);
  const hash = await derivar(senha, salt);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verificarSenha(senha: unknown, hashArmazenado: unknown): Promise<boolean> {
  if (typeof senha !== "string" || Buffer.byteLength(senha, "utf8") > 1024) return false;
  const parsed = analisarHash(hashArmazenado);
  if (!parsed) return false;
  const calculado = await derivar(senha, parsed.salt);
  return timingSafeEqual(calculado, parsed.hash);
}
