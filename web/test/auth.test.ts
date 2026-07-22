import assert from "node:assert/strict";
import test from "node:test";
import { criarHashSenha, verificarSenha } from "../lib/security/password.ts";
import {
  criarTokenSessao,
  csrfValido,
  DURACAO_SESSAO_SEGUNDOS,
  verificarTokenSessao,
} from "../lib/security/sessionToken.ts";

const segredo = "s".repeat(48);
const hashSenha = "scrypt$32768$8$3$hash-de-teste$nao-usado-diretamente";

test("sessão assinada expira e não aceita adulteração ou rotação de credenciais", () => {
  const agora = Date.UTC(2026, 6, 22, 12, 0, 0);
  const { token, sessao } = criarTokenSessao(segredo, hashSenha, agora);

  assert.deepEqual(verificarTokenSessao(token, segredo, hashSenha, agora), sessao);
  assert.equal(csrfValido(sessao.csrf, sessao), true);
  assert.equal(csrfValido(`${sessao.csrf}x`, sessao), false);
  assert.equal(verificarTokenSessao(`${token}x`, segredo, hashSenha, agora), null);
  assert.equal(verificarTokenSessao(token, "x".repeat(48), hashSenha, agora), null);
  assert.equal(verificarTokenSessao(token, segredo, `${hashSenha}-rotacionado`, agora), null);
  assert.equal(
    verificarTokenSessao(token, segredo, hashSenha, agora + DURACAO_SESSAO_SEGUNDOS * 1000),
    null
  );
});

test("hash scrypt verifica a senha sem armazená-la em texto puro", async () => {
  const senha = "uma senha longa de teste 2026";
  const hash = await criarHashSenha(senha);

  assert.match(hash, /^scrypt\$32768\$8\$3\$/);
  assert.equal(hash.includes(senha), false);
  assert.equal(await verificarSenha(senha, hash), true);
  assert.equal(await verificarSenha("senha incorreta", hash), false);
  assert.equal(await verificarSenha(senha, "hash-malformado"), false);
});
