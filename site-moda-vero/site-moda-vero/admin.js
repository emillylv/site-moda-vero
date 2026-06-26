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
});

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
          ? `<img src="${escaparAtributo(item.imagem)}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`
          : ""
        }
            <span style="${temImagem ? "display:none" : "display:flex"}">Prévia da foto principal</span>
            <input type="file" accept="image/*" title="Escolher foto para pré-visualizar (não envia o arquivo, apenas mostra aqui)"
              onchange="préVisualizarArquivo(event, ${item.id})">
          </div>

          <div class="look-editor-campos">
            <div class="campo campo-largo">
              <label for="titulo-${item.id}">Título do look</label>
              <input type="text" id="titulo-${item.id}" value="${escaparAtributo(item.titulo)}"
                placeholder="Ex.: Alfaiataria leve"
                oninput="atualizarCampo(${item.id}, 'titulo', this.value)">
            </div>

            <div class="campo">
              <label for="imagem-${item.id}">Arquivo da foto principal</label>
              <input type="text" id="imagem-${item.id}" value="${escaparAtributo(item.imagem)}"
                placeholder="imgs/0001.jpg"
                oninput="atualizarCampo(${item.id}, 'imagem', this.value); atualizarThumb(${item.id})">
            </div>

            <div class="campo">
              <label for="hover-${item.id}">Foto ao passar o mouse (opcional)</label>
              <input type="text" id="hover-${item.id}" value="${escaparAtributo(item.imagemHover)}"
                placeholder="imgs/0001-alt.jpg"
                oninput="atualizarCampo(${item.id}, 'imagemHover', this.value)">
            </div>

            <div class="campo campo-largo">
              <label for="etiqueta-${item.id}">Etiqueta</label>
              <select id="etiqueta-${item.id}" onchange="atualizarCampo(${item.id}, 'etiqueta', this.value)">
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
                  onclick="moverLook(${item.id}, -1)" ${indice === 0 ? "disabled" : ""}>↑</button>
                <button type="button" class="botao-icone" title="Mover para baixo"
                  onclick="moverLook(${item.id}, 1)" ${indice === estadoColecao.itens.length - 1 ? "disabled" : ""}>↓</button>
              </div>
              <button type="button" class="botao-remover" onclick="removerLook(${item.id})">Remover look</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
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
      img.style.display = "block";
    } else {
      const novaImg = document.createElement("img");
      novaImg.src = item.imagem;
      novaImg.alt = "";
      novaImg.onerror = function () { this.style.display = "none"; span.style.display = "flex"; };
      thumb.insertBefore(novaImg, thumb.firstChild);
    }
    if (span) span.style.display = "none";
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
  img.style.display = "block";
  const span = thumb.querySelector("span");
  if (span) span.style.display = "none";
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
          ? `<img class="imagem-base" src="${escaparAtributo(item.imagem)}" alt="" onerror="this.style.opacity=0">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--papel-fundo);color:var(--tinta-suave);font-size:0.78rem;text-align:center;padding:12px;">Sem foto definida</div>`
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
}

/* ---------- Geração do arquivo final ---------- */
function gerarArquivo() {
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
  const seguro = (texto || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${seguro}"`;
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

function mostrarStatus(mensagem) {
  const elemento = document.getElementById("mensagem-status");
  elemento.textContent = mensagem;
}

/* ---------- Utilitários ---------- */
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function escaparAtributo(texto) {
  return (texto || "").replace(/"/g, "&quot;");
}
