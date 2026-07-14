/* =========================================================================
   PAINEL DA COLEÇÃO — lógica do editor visual
   Lê a coleção atual (trends-data.js), permite editar visualmente e
   gera um novo arquivo trends-data.js para download.
   ========================================================================= */

// Estado de trabalho em memória (cópia editável da coleção atual)
let estadoColecao = {
  colecao: "",
  itens: []
};

let proximoId = 1;

document.addEventListener("DOMContentLoaded", () => {
  carregarColecaoAtual();
  renderizarTudo();

  document.getElementById("input-nome-colecao").addEventListener("input", (evento) => {
    estadoColecao.colecao = evento.target.value;
    renderizarPreview();
  });

  document.getElementById("btn-adicionar-look").addEventListener("click", () => {
    adicionarLook();
  });

  document.getElementById("btn-gerar").addEventListener("click", gerarArquivo);
  document.getElementById("btn-copiar").addEventListener("click", copiarConteudo);
  document.getElementById("btn-baixar").addEventListener("click", baixarArquivo);
  document.getElementById("btn-publicar").addEventListener("click", publicarDireto);

  const lista = document.getElementById("lista-looks");
  lista.addEventListener("input", tratarEdicaoLista);
  lista.addEventListener("change", tratarEdicaoLista);
  lista.addEventListener("click", tratarCliqueLista);
});

function tratarEdicaoLista(evento) {
  const alvo = evento.target;
  const card = alvo.closest(".look-editor-card");
  if (!card) return;
  const id = Number(card.dataset.id);

  if (alvo.matches('input[type="file"]')) {
    préVisualizarArquivo(evento, id);
    return;
  }
  if (alvo.dataset.campo) {
    atualizarCampo(id, alvo.dataset.campo, alvo.value);
    if (alvo.dataset.campo === "imagem") atualizarThumb(id);
  }
}

function tratarCliqueLista(evento) {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;
  const card = botao.closest(".look-editor-card");
  const id = Number(card.dataset.id);
  if (botao.dataset.acao === "remover") removerLook(id);
  if (botao.dataset.acao === "subir") moverLook(id, -1);
  if (botao.dataset.acao === "descer") moverLook(id, 1);
}

/* ---------- Carregamento inicial ---------- */
function carregarColecaoAtual() {
  if (typeof colecaoTendencias !== "undefined") {
    estadoColecao.colecao = colecaoTendencias.colecao || "";
    estadoColecao.itens = (colecaoTendencias.itens || []).map((item) => ({
      id: proximoId++,
      imagem: item.imagem || "",
      imagemHover: item.imagemHover || "",
      titulo: item.titulo || "",
      etiqueta: item.etiqueta || ""
    }));
  }
  document.getElementById("input-nome-colecao").value = estadoColecao.colecao;
}

/* ---------- Manipulação de looks ---------- */
function adicionarLook() {
  estadoColecao.itens.push({
    id: proximoId++,
    imagem: "",
    imagemHover: "",
    titulo: "",
    etiqueta: "Tendência"
  });
  renderizarTudo();
  // Foca no campo de imagem do novo item
  const cards = document.querySelectorAll(".look-editor-card");
  const ultimo = cards[cards.length - 1];
  if (ultimo) ultimo.querySelector("input")?.focus();
}

function removerLook(id) {
  estadoColecao.itens = estadoColecao.itens.filter((item) => item.id !== id);
  renderizarTudo();
}

function moverLook(id, direcao) {
  const indice = estadoColecao.itens.findIndex((item) => item.id === id);
  const novoIndice = indice + direcao;
  if (novoIndice < 0 || novoIndice >= estadoColecao.itens.length) return;
  const [item] = estadoColecao.itens.splice(indice, 1);
  estadoColecao.itens.splice(novoIndice, 0, item);
  renderizarTudo();
}

function atualizarCampo(id, campo, valor) {
  const item = estadoColecao.itens.find((item) => item.id === id);
  if (item) item[campo] = valor;
  renderizarPreview();
}

/* ---------- Renderização do formulário (lista editável) ---------- */
function renderizarTudo() {
  renderizarLista();
  renderizarPreview();
}

function renderizarLista() {
  const lista = document.getElementById("lista-looks");

  if (estadoColecao.itens.length === 0) {
    lista.innerHTML = `<div class="lista-vazia">Nenhum look na coleção ainda. Clique em “+ Adicionar look” para começar.</div>`;
    return;
  }

  lista.innerHTML = estadoColecao.itens
    .map((item, indice) => {
      const temImagem = item.imagem && item.imagem.trim() !== "";
      return `
        <div class="look-editor-card" data-id="${item.id}">
          <div class="look-editor-thumb">
            ${temImagem
          ? `<img src="${escaparAtributo(item.imagem)}" alt="">`
          : ""
        }
            <span ${temImagem ? "hidden" : ""}>Prévia da foto principal</span>
            <input type="file" accept="image/*" title="Escolher foto para pré-visualizar (não envia o arquivo, apenas mostra aqui)"
              data-acao="preview-arquivo">
          </div>

          <div class="look-editor-campos">
            <div class="campo campo-largo">
              <label for="titulo-${item.id}">Título do look</label>
              <input type="text" id="titulo-${item.id}" value="${escaparAtributo(item.titulo)}"
                placeholder="Ex.: Alfaiataria leve"
                data-campo="titulo">
            </div>

            <div class="campo">
              <label for="imagem-${item.id}">Arquivo da foto principal</label>
              <input type="text" id="imagem-${item.id}" value="${escaparAtributo(item.imagem)}"
                placeholder="imgs/0001.jpg"
                data-campo="imagem">
            </div>

            <div class="campo">
              <label for="hover-${item.id}">Foto ao passar o mouse (opcional)</label>
              <input type="text" id="hover-${item.id}" value="${escaparAtributo(item.imagemHover)}"
                placeholder="imgs/0001-alt.jpg"
                data-campo="imagemHover">
            </div>

            <div class="campo campo-largo">
              <label for="etiqueta-${item.id}">Etiqueta</label>
              <select id="etiqueta-${item.id}" data-campo="etiqueta">
                ${["Tendência", "Novo", "Mais pedido", "Edição limitada", "Sem etiqueta"]
          .map((opcao) => {
            const valor = opcao === "Sem etiqueta" ? "" : opcao;
            const selecionado = (item.etiqueta || "") === valor ? "selected" : "";
            return `<option value="${escaparAtributo(valor)}" ${selecionado}>${opcao}</option>`;
          })
          .join("")}
              </select>
            </div>

            <div class="look-editor-acoes">
              <div class="look-editor-mover">
                <button type="button" class="botao-icone" title="Mover para cima"
                  data-acao="subir" ${indice === 0 ? "disabled" : ""}>↑</button>
                <button type="button" class="botao-icone" title="Mover para baixo"
                  data-acao="descer" ${indice === estadoColecao.itens.length - 1 ? "disabled" : ""}>↓</button>
              </div>
              <button type="button" class="botao-remover" data-acao="remover">Remover look</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  lista.querySelectorAll(".look-editor-thumb img").forEach((img) => {
    img.addEventListener("error", () => {
      img.hidden = true;
      const span = img.nextElementSibling;
      if (span) span.hidden = false;
    });
  });
}

function atualizarThumb(id) {
  // Re-renderiza apenas a miniatura correspondente ao caminho digitado
  const item = estadoColecao.itens.find((i) => i.id === id);
  if (!item) return;
  const card = document.querySelector(`.look-editor-card[data-id="${id}"]`);
  if (!card) return;
  const thumb = card.querySelector(".look-editor-thumb");
  const img = thumb.querySelector("img");
  const span = thumb.querySelector("span");
  if (item.imagem && item.imagem.trim() !== "") {
    if (img) {
      img.src = item.imagem;
      img.hidden = false;
    } else {
      const novaImg = document.createElement("img");
      novaImg.src = item.imagem;
      novaImg.alt = "";
      novaImg.onerror = function () { this.hidden = true; span.hidden = false; };
      thumb.insertBefore(novaImg, thumb.firstChild);
    }
    if (span) span.hidden = true;
  }
  renderizarPreview();
}

function préVisualizarArquivo(evento, id) {
  const arquivo = evento.target.files && evento.target.files[0];
  if (!arquivo) return;
  const url = URL.createObjectURL(arquivo);
  const card = document.querySelector(`.look-editor-card[data-id="${id}"]`);
  if (!card) return;
  const thumb = card.querySelector(".look-editor-thumb");
  let img = thumb.querySelector("img");
  if (!img) {
    img = document.createElement("img");
    thumb.insertBefore(img, thumb.firstChild);
  }
  img.src = url;
  img.hidden = false;
  const span = thumb.querySelector("span");
  if (span) span.hidden = true;
  // Nota: isto é só uma pré-visualização local. Lembre-se de colocar o
  // arquivo de verdade dentro da pasta /imgs e digitar o nome do arquivo
  // no campo "Arquivo da foto principal".
}

/* ---------- Prévia ao vivo (igual à seção do site) ---------- */
function renderizarPreview() {
  const preview = document.getElementById("preview-tendencias");

  if (estadoColecao.itens.length === 0) {
    preview.innerHTML = `<p class="admin-preview-vazio">A prévia vai aparecer aqui assim que você adicionar um look.</p>`;
    return;
  }

  preview.innerHTML = estadoColecao.itens
    .map((item, indice) => {
      const numero = String(indice + 1).padStart(2, "0");
      return `
        <article class="look-card">
          ${item.etiqueta ? `<span class="look-tag">${escaparHTML(item.etiqueta)}</span>` : ""}
          <div class="look-card-imagem">
            ${item.imagem
          ? `<img class="imagem-base" src="${escaparAtributo(item.imagem)}" alt="">`
          : `<div class="admin-preview-sem-foto">Sem foto definida</div>`
        }
          </div>
          <div class="look-card-legenda">
            <p class="look-card-titulo">${escaparHTML(item.titulo || "Sem título")}</p>
            <span class="look-card-indice">${numero}</span>
          </div>
        </article>
      `;
    })
    .join("");

  preview.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => { img.hidden = true; });
  });
}

/* ---------- Geração do arquivo final ---------- */
function gerarArquivo() {
  const erro = validarColecaoLocal();
  if (erro) {
    mostrarStatus(erro);
    return;
  }
  const conteudo = montarConteudoArquivo();
  const saida = document.getElementById("saida-codigo");
  saida.value = conteudo;
  document.getElementById("btn-copiar").disabled = false;
  document.getElementById("btn-baixar").disabled = false;
  mostrarStatus("Arquivo gerado! Copie o conteúdo ou baixe o arquivo abaixo.");
}

function montarConteudoArquivo() {
  const nomeColecao = estadoColecao.colecao || "Coleção atual";

  const blocoItens = estadoColecao.itens
    .map((item) => {
      return `    {
      imagem: ${formatarString(item.imagem)},
      imagemHover: ${formatarString(item.imagemHover || item.imagem)},
      titulo: ${formatarString(item.titulo)},
      etiqueta: ${formatarString(item.etiqueta)}
    }`;
    })
    .join(",\n");

  return `/* ===================================================================
   COLEÇÃO ATUAL — arquivo fácil de editar
   Gerado pelo painel visual (admin.html) em ${new Date().toLocaleString("pt-BR")}.
   Você também pode editar este arquivo manualmente: basta trocar o
   texto entre aspas " " de cada item.
   =================================================================== */

const colecaoTendencias = {
  colecao: ${formatarString(nomeColecao)},

  itens: [
${blocoItens}
  ]
};
`;
}

function formatarString(texto) {
  return JSON.stringify(texto || "").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

/* ---------- Ações de copiar / baixar ---------- */
function copiarConteudo() {
  const saida = document.getElementById("saida-codigo");
  if (!saida.value) return;

  navigator.clipboard
    .writeText(saida.value)
    .then(() => mostrarStatus("Conteúdo copiado para a área de transferência."))
    .catch(() => {
      saida.select();
      document.execCommand("copy");
      mostrarStatus("Conteúdo copiado para a área de transferência.");
    });
}

function baixarArquivo() {
  const conteudo = document.getElementById("saida-codigo").value;
  if (!conteudo) return;

  const blob = new Blob([conteudo], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "trends-data.js";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  mostrarStatus("Download iniciado. Substitua o arquivo trends-data.js na pasta do site por este.");
}

/* ---------- Publicação direta (via servidor) ---------- */
async function publicarDireto() {
  const campoToken = document.getElementById("input-token-publicar");
  const token = campoToken.value.trim();

  if (!token) {
    mostrarStatus("Informe a chave de acesso antes de publicar.");
    campoToken.focus();
    return;
  }
  if (estadoColecao.itens.length === 0) {
    mostrarStatus("Adicione pelo menos um look antes de publicar.");
    return;
  }
  const erroValidacao = validarColecaoLocal();
  if (erroValidacao) {
    mostrarStatus(erroValidacao);
    return;
  }

  const botao = document.getElementById("btn-publicar");
  botao.disabled = true;
  mostrarStatus("Publicando...");

  try {
    const resposta = await fetch("/api/catalog/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        colecao: estadoColecao.colecao,
        itens: estadoColecao.itens.map((item) => ({
          imagem: item.imagem,
          imagemHover: item.imagemHover,
          titulo: item.titulo,
          etiqueta: item.etiqueta,
        })),
      }),
    });

    if (resposta.status === 401) {
      mostrarStatus("Chave de acesso incorreta.");
      return;
    }
    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      mostrarStatus(corpo.mensagem || "Não foi possível publicar. Tente novamente.");
      return;
    }

    mostrarStatus("Publicado! O site vai atualizar em alguns minutos.");
    campoToken.value = "";
  } catch (erro) {
    mostrarStatus("Erro de conexão. Verifique sua internet e tente novamente.");
  } finally {
    botao.disabled = false;
  }
}

function mostrarStatus(mensagem) {
  const elemento = document.getElementById("mensagem-status");
  elemento.textContent = mensagem;
}

function validarColecaoLocal() {
  if (estadoColecao.colecao.length > 200) return "O nome da coleção deve ter no máximo 200 caracteres.";
  if (estadoColecao.itens.length > 200) return "A coleção deve ter no máximo 200 looks.";
  for (const item of estadoColecao.itens) {
    if (!caminhoImagemSeguro(item.imagem)) {
      return "Cada foto principal deve usar um arquivo seguro dentro de imgs/ (ex.: imgs/0001.jpg).";
    }
    if (item.imagemHover && !caminhoImagemSeguro(item.imagemHover)) {
      return "Cada foto de hover deve usar um arquivo seguro dentro de imgs/.";
    }
    if ((item.titulo || "").length > 200) return "Os títulos devem ter no máximo 200 caracteres.";
  }
  return null;
}

function caminhoImagemSeguro(caminho) {
  return typeof caminho === "string" && /^imgs\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:avif|gif|jpe?g|png|webp)$/i.test(caminho);
}

/* ---------- Utilitários ---------- */
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function escaparAtributo(texto) {
  return escaparHTML(texto).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
