import "server-only";

import { imagemGeradaPeloPainel, imagensDoCatalogo } from "@/lib/validation";

/* =========================================================================
   Integração com a API do GitHub (Contents API) — portado de server.js.
   Faz commit direto de arquivos no repositório configurado, sem disco.
   ========================================================================= */

const TEMPO_LIMITE_GITHUB_MS = 10_000;

export interface GithubConfig {
  token: string;
  repo: string; // "usuario/repositorio"
  branch: string;
  dataPath: string; // onde o catálogo JSON é gravado
  imagesDir: string; // pasta onde as imagens são gravadas
}

/** Lê e valida a configuração do GitHub a partir das variáveis de ambiente. */
export function lerConfigGitHub(): GithubConfig | { erro: string } {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const dataPath = process.env.GITHUB_DATA_PATH || "web/data/trends.json";
  const imagesDir = process.env.GITHUB_IMAGES_DIR || "web/public/imgs";

  if (!token || !repo) {
    return { erro: "Faltam variáveis GITHUB_TOKEN e/ou GITHUB_REPO." };
  }
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    return { erro: "GITHUB_REPO inválido. Use usuario/repositorio." };
  }
  if (
    !/^[A-Za-z0-9._/-]+$/.test(branch) ||
    branch.startsWith("/") ||
    branch.endsWith("/") ||
    branch.includes("..")
  ) {
    return { erro: "GITHUB_BRANCH inválida." };
  }
  if (
    !/^[A-Za-z0-9._/-]+\.json$/.test(dataPath) ||
    dataPath.startsWith("/") ||
    dataPath.includes("..")
  ) {
    return { erro: "GITHUB_DATA_PATH deve ser um caminho JSON relativo seguro." };
  }
  if (
    !/^[A-Za-z0-9._/-]+$/.test(imagesDir) ||
    imagesDir.startsWith("/") ||
    imagesDir.endsWith("/") ||
    imagesDir.includes("..")
  ) {
    return { erro: "GITHUB_IMAGES_DIR deve ser um caminho relativo seguro." };
  }
  return { token, repo, branch, dataPath, imagesDir };
}

function urlConteudoGitHub(cfg: GithubConfig, caminhoArquivo: string): string {
  const [dono, repositorio] = cfg.repo.split("/");
  const caminho = caminhoArquivo.split("/").map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${encodeURIComponent(dono)}/${encodeURIComponent(
    repositorio
  )}/contents/${caminho}`;
}

function cabecalhosGitHub(cfg: GithubConfig): HeadersInit {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "moda-vero-admin",
  };
}

/** Lê um arquivo do repositório. Retorna null se ainda não existe (404). */
export async function lerArquivoGitHub(
  cfg: GithubConfig,
  caminhoArquivo: string
): Promise<{ sha: string; conteudo: string } | null> {
  const resposta = await fetch(
    `${urlConteudoGitHub(cfg, caminhoArquivo)}?ref=${encodeURIComponent(cfg.branch)}`,
    {
      headers: cabecalhosGitHub(cfg),
      signal: AbortSignal.timeout(TEMPO_LIMITE_GITHUB_MS),
      cache: "no-store",
      redirect: "error",
    }
  );
  if (resposta.status === 404) return null;
  if (!resposta.ok) {
    throw new Error(`Não foi possível ler o arquivo atual no GitHub (${resposta.status}).`);
  }
  const atual = (await resposta.json()) as { sha?: unknown; content?: unknown };
  if (!atual || typeof atual.sha !== "string") {
    throw new Error("Resposta inválida ao ler o arquivo atual no GitHub.");
  }
  const conteudo =
    typeof atual.content === "string"
      ? Buffer.from(atual.content, "base64").toString("utf-8")
      : "";
  return { sha: atual.sha, conteudo };
}

/** Retorna o SHA atual do arquivo, ou null se ainda não existe (404). */
export async function lerShaArquivoGitHub(
  cfg: GithubConfig,
  caminhoArquivo: string
): Promise<string | null> {
  return (await lerArquivoGitHub(cfg, caminhoArquivo))?.sha ?? null;
}

export async function apagarArquivoGitHub(
  cfg: GithubConfig,
  opts: { caminhoArquivo: string; sha: string; mensagem: string }
): Promise<void> {
  const resposta = await fetch(urlConteudoGitHub(cfg, opts.caminhoArquivo), {
    method: "DELETE",
    headers: cabecalhosGitHub(cfg),
    signal: AbortSignal.timeout(TEMPO_LIMITE_GITHUB_MS),
    cache: "no-store",
    redirect: "error",
    body: JSON.stringify({ message: opts.mensagem, sha: opts.sha, branch: cfg.branch }),
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao apagar arquivo no GitHub (${resposta.status}).`);
  }
}

export async function commitArquivoGitHub(
  cfg: GithubConfig,
  opts: { caminhoArquivo: string; conteudoBase64: string; mensagem: string; sha?: string }
): Promise<void> {
  const corpo: Record<string, unknown> = {
    message: opts.mensagem,
    content: opts.conteudoBase64,
    branch: cfg.branch,
  };
  if (opts.sha) corpo.sha = opts.sha;

  const resposta = await fetch(urlConteudoGitHub(cfg, opts.caminhoArquivo), {
    method: "PUT",
    headers: cabecalhosGitHub(cfg),
    signal: AbortSignal.timeout(TEMPO_LIMITE_GITHUB_MS),
    cache: "no-store",
    redirect: "error",
    body: JSON.stringify(corpo),
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao publicar no GitHub (${resposta.status}).`);
  }
}

function analisarCatalogo(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

/**
 * Apaga as imagens que o catálogo anterior usava e o novo não usa mais.
 * Só remove arquivos que o próprio painel gerou (ver `imagemGeradaPeloPainel`)
 * e nunca deixa uma falha aqui derrubar a publicação: o catálogo já foi
 * gravado, e uma imagem órfã a mais é inofensiva perto de perder o commit.
 */
async function apagarImagensOrfas(
  cfg: GithubConfig,
  conteudoAnterior: string,
  conteudoNovo: string
): Promise<string[]> {
  const anterior = analisarCatalogo(conteudoAnterior);
  const novo = analisarCatalogo(conteudoNovo);
  // Sem conseguir ler os dois lados não há diferença confiável: não apaga nada.
  if (!anterior || !novo) return [];

  const emUso = imagensDoCatalogo(novo);
  const orfas = [...imagensDoCatalogo(anterior)].filter(
    (caminho) => !emUso.has(caminho) && imagemGeradaPeloPainel(caminho)
  );

  const removidas: string[] = [];
  for (const caminho of orfas) {
    const arquivo = `${cfg.imagesDir}/${caminho.slice("/imgs/".length)}`;
    try {
      const atual = await lerArquivoGitHub(cfg, arquivo);
      if (!atual) continue;
      await apagarArquivoGitHub(cfg, {
        caminhoArquivo: arquivo,
        sha: atual.sha,
        mensagem: `Remove imagem ${caminho.slice("/imgs/".length)} sem uso no catálogo`,
      });
      removidas.push(caminho);
    } catch (erro) {
      console.error(
        "Não foi possível remover imagem órfã:",
        erro instanceof Error ? erro.message : "erro"
      );
    }
  }
  return removidas;
}

/** Grava o catálogo JSON e recolhe as imagens que ele deixou de usar. */
export async function publicarCatalogoNoGitHub(
  cfg: GithubConfig,
  conteudo: string
): Promise<{ removidas: string[] }> {
  const atual = await lerArquivoGitHub(cfg, cfg.dataPath);
  if (!atual) {
    throw new Error("Arquivo de catálogo não encontrado no GitHub.");
  }
  await commitArquivoGitHub(cfg, {
    caminhoArquivo: cfg.dataPath,
    conteudoBase64: Buffer.from(conteudo, "utf-8").toString("base64"),
    mensagem: "Atualiza catálogo de tendências via painel admin",
    sha: atual.sha,
  });

  return { removidas: await apagarImagensOrfas(cfg, atual.conteudo, conteudo) };
}
