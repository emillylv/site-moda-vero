// Verifica, num Chrome real, se a medição do site chega ao Google: carrega a
// página, aceita o banner de cookies, clica no CTA de agendamento e registra
// quais requisições o Google respondeu. Fala com o navegador pelo DevTools
// Protocol, sem dependências além do Node e de um Chrome instalado.
//
//   node scripts/verificar-medicao.mjs [url] [--salvar arquivo.md]

import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const CHROMES = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const ADS_ID = "11184553318";
const argumentos = process.argv.slice(2);
const indiceSalvar = argumentos.indexOf("--salvar");
const destino = indiceSalvar >= 0 ? argumentos[indiceSalvar + 1] : null;
const alvo = argumentos.find((a) => a.startsWith("http")) || "https://www.modabhvero.com.br/";

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function abrirChrome(perfil) {
  const executavel = CHROMES.find(Boolean);
  const processo = spawn(executavel, [
    "--headless=new",
    "--remote-debugging-port=0",
    "--no-first-run",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    `--user-data-dir=${perfil}`,
    "about:blank",
  ]);

  // O Chrome só informa a porta escolhida depois de subir, pela saída de erro.
  const endereco = await new Promise((resolve, reject) => {
    const limite = setTimeout(() => reject(new Error("Chrome não respondeu em 30s")), 30_000);
    let acumulado = "";
    processo.stderr.on("data", (pedaco) => {
      acumulado += pedaco;
      const achado = acumulado.match(/ws:\/\/([^/]+)\//);
      if (achado) {
        clearTimeout(limite);
        resolve(achado[1]);
      }
    });
    processo.on("exit", (codigo) => reject(new Error(`Chrome encerrou com código ${codigo}`)));
  });

  const alvos = await (await fetch(`http://${endereco}/json/list`)).json();
  const pagina = alvos.find((t) => t.type === "page");
  return { processo, socket: new WebSocket(pagina.webSocketDebuggerUrl) };
}

const respostas = [];
const violacoes = [];
let sequencia = 0;
const pendentes = new Map();

function comando(socket, method, params = {}) {
  const id = ++sequencia;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pendentes.set(id, resolve));
}

const perfil = await mkdtemp(path.join(tmpdir(), "verifica-medicao-"));
const { processo, socket } = await abrirChrome(perfil);

await new Promise((resolve) => socket.addEventListener("open", resolve));

socket.addEventListener("message", (evento) => {
  const msg = JSON.parse(evento.data);
  if (msg.id && pendentes.has(msg.id)) {
    pendentes.get(msg.id)(msg.result);
    pendentes.delete(msg.id);
    return;
  }
  if (msg.method === "Network.responseReceived") {
    const { url, status } = msg.params.response;
    if (/google|doubleclick/i.test(url)) respostas.push({ url, status });
  }
  if (msg.method === "Log.entryAdded" && /Content Security|Refused/i.test(msg.params.entry.text)) {
    violacoes.push(msg.params.entry.text.slice(0, 200));
  }
});

await comando(socket, "Network.enable");
await comando(socket, "Page.enable");
await comando(socket, "Runtime.enable");
await comando(socket, "Log.enable");

await comando(socket, "Page.navigate", { url: alvo });
await esperar(6000);

async function avaliar(expressao) {
  const r = await comando(socket, "Runtime.evaluate", {
    expression: expressao,
    returnByValue: true,
    awaitPromise: true,
  });
  return r?.result?.value;
}

const aceitou = await avaliar(`
  (() => {
    const b = [...document.querySelectorAll(".cookie-banner button")]
      .find((x) => /aceitar/i.test(x.textContent || ""));
    if (!b) return false;
    b.click();
    return true;
  })()
`);
await esperar(6000);

const containers = await avaliar(`
  Object.keys(window.google_tag_manager || {}).filter((k) => /^(G-|AW-)/.test(k)).join(", ")
`);

const marca = respostas.length;
const cta = await avaliar(`
  (() => {
    document.addEventListener("click", (e) => e.preventDefault(), true);
    const a = [...document.querySelectorAll("a")]
      .find((x) => (x.getAttribute("href") || "").includes("agendar%20uma%20consultoria"));
    if (!a) return null;
    a.click();
    return a.textContent.trim();
  })()
`);
await esperar(8000);

socket.close();
processo.kill();
// O perfil só pode ser apagado depois que o Chrome soltar os arquivos.
await new Promise((resolve) => processo.once("exit", resolve));
await rm(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });

const local = (u) => {
  const { host, pathname } = new URL(u);
  return host + pathname;
};
const okDe = (r) => r.status >= 200 && r.status < 400;
const pageview = respostas.filter((r) => /google-analytics\.com\/g\/collect/.test(r.url) && okDe(r));
const conversoes = respostas.slice(marca).filter((r) => /en=conversion|\/conversion\//.test(r.url) && okDe(r));
const containerAds = respostas.some((r) => r.url.includes(`id=AW-${ADS_ID}`));

const aprovado = pageview.length > 0 && conversoes.length > 0 && violacoes.length === 0;
const linhas = [
  `# Verificação de medição — ${alvo}`,
  "",
  `Gerado em ${new Date().toISOString()}`,
  "",
  `**Resultado: ${aprovado ? "APROVADO" : "REPROVADO"}**`,
  "",
  "| Verificação | Situação |",
  "| --- | --- |",
  `| Banner de cookies aceito | ${aceitou ? "sim" : "NÃO ENCONTRADO"} |`,
  `| Containers carregados | ${containers || "nenhum"} |`,
  `| Container do Ads (AW-${ADS_ID}) buscado | ${containerAds ? "sim" : "NÃO"} |`,
  `| Pageview do Analytics (/g/collect) | ${pageview.length ? `sim (${pageview.length})` : "NÃO"} |`,
  `| CTA de agendamento clicado | ${cta ? `"${cta}"` : "LINK NÃO ENCONTRADO"} |`,
  `| Pings de conversão aceitos | ${conversoes.length} |`,
  `| Violações de CSP | ${violacoes.length} |`,
  "",
  "## Pings de conversão",
  "",
  ...(conversoes.length
    ? [...new Set(conversoes.map((r) => `- HTTP ${r.status} \`${local(r.url)}\``))]
    : ["- nenhum"]),
  "",
  "## Violações de CSP",
  "",
  ...(violacoes.length ? violacoes.map((v) => `- ${v}`) : ["- nenhuma"]),
  "",
];
const relatorio = linhas.join("\n");

console.log(relatorio);
if (destino) {
  await writeFile(destino, relatorio, "utf8");
  console.log(`Relatório salvo em ${destino}`);
}
process.exit(aprovado ? 0 : 1);
