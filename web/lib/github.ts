import "server-only";

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

/** Retorna o SHA atual do arquivo, ou null se ainda não existe (404). */
export async function lerShaArquivoGitHub(
  cfg: GithubConfig,
  caminhoArquivo: string
): Promise<string | null> {
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
  const atual = (await resposta.json()) as { sha?: unknown };
  if (!atual || typeof atual.sha !== "string") {
    throw new Error("Resposta inválida ao ler o arquivo atual no GitHub.");
  }
  return atual.sha;
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

/** Grava o conteúdo do catálogo JSON no caminho configurado. */
export async function publicarCatalogoNoGitHub(
  cfg: GithubConfig,
  conteudo: string
): Promise<void> {
  const sha = await lerShaArquivoGitHub(cfg, cfg.dataPath);
  if (!sha) {
    throw new Error("Arquivo de catálogo não encontrado no GitHub.");
  }
  await commitArquivoGitHub(cfg, {
    caminhoArquivo: cfg.dataPath,
    conteudoBase64: Buffer.from(conteudo, "utf-8").toString("base64"),
    mensagem: "Atualiza catálogo de tendências via painel admin",
    sha,
  });
}
