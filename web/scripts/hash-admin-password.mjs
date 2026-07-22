import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { Writable } from "node:stream";
import { promisify } from "node:util";
import readline from "node:readline/promises";

const scrypt = promisify(scryptCallback);
const parametros = { N: 2 ** 15, r: 8, p: 3, maxmem: 48 * 1024 * 1024 };

let ocultar = false;
const saida = new Writable({
  write(chunk, encoding, callback) {
    if (!ocultar) process.stdout.write(chunk, encoding);
    callback();
  },
});
const terminal = readline.createInterface({ input: process.stdin, output: saida, terminal: true });

async function perguntar(rotulo) {
  process.stdout.write(rotulo);
  ocultar = true;
  const valor = await terminal.question("");
  ocultar = false;
  process.stdout.write("\n");
  return valor;
}

try {
  if (!process.stdin.isTTY) throw new Error("Execute este comando em um terminal interativo.");
  const senha = await perguntar("Nova senha administrativa: ");
  const confirmacao = await perguntar("Confirme a senha: ");
  if (senha !== confirmacao) throw new Error("As senhas não coincidem.");
  if (senha.length < 12 || Buffer.byteLength(senha, "utf8") > 1024) {
    throw new Error("Use uma senha com pelo menos 12 caracteres e no máximo 1024 bytes.");
  }

  const salt = randomBytes(16);
  const hash = await scrypt(senha.normalize("NFKC"), salt, 64, parametros);
  process.stdout.write(
    `\nADMIN_PASSWORD_HASH=scrypt$${parametros.N}$${parametros.r}$${parametros.p}$${salt.toString("base64url")}$${hash.toString("base64url")}\n`
  );
  process.stdout.write("ADMIN_SESSION_SECRET deve ser gerado separadamente com: openssl rand -base64 48\n");
} catch (erro) {
  process.stderr.write(`${erro instanceof Error ? erro.message : "Falha ao gerar hash."}\n`);
  process.exitCode = 1;
} finally {
  terminal.close();
}
