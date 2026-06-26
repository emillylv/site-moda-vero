/* =========================================================================
   VERÔNICA CHAVES — script principal do site
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Ano automático no rodapé ---------- */
  const anoEl = document.getElementById("ano-atual");
  if (anoEl) anoEl.textContent = "· " + new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  const menuToggle = document.getElementById("menu-toggle");
  const navPrincipal = document.getElementById("nav-principal");

  if (menuToggle && navPrincipal) {
    menuToggle.addEventListener("click", () => {
      const aberto = navPrincipal.classList.toggle("aberto");
      menuToggle.classList.toggle("ativo", aberto);
      menuToggle.setAttribute("aria-expanded", aberto ? "true" : "false");
      menuToggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });

    // Fecha o menu ao clicar em um link
    navPrincipal.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navPrincipal.classList.remove("aberto");
        menuToggle.classList.remove("ativo");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Marquee de marcas (duplica para rolagem contínua circular) ---------- */
  const marcas = document.getElementById("marcas-imgs");
  if (marcas) {
    Array.from(marcas.children).forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("img[loading]").forEach((img) => img.removeAttribute("loading"));
      marcas.appendChild(clone);
    });
  }

  /* ---------- Renderiza a coleção de tendências a partir de trends-data.js ---------- */
  renderizarTendencias();

  /* ---------- Animação de entrada dos cards ao rolar a página ---------- */
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("em-vista");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".look-card").forEach((card) => observador.observe(card));

});

/**
 * Lê o objeto global `colecaoTendencias` (definido em trends-data.js)
 * e monta os cards da seção "Tendências" dinamicamente.
 * Para trocar a coleção, basta editar trends-data.js — não é
 * necessário mexer neste arquivo.
 */
function renderizarTendencias() {
  const grade = document.getElementById("grade-tendencias");
  const nomeColecaoEl = document.getElementById("nome-colecao");

  if (!grade || typeof colecaoTendencias === "undefined") return;

  if (nomeColecaoEl && colecaoTendencias.colecao) {
    nomeColecaoEl.textContent = colecaoTendencias.colecao;
  }

  const itens = colecaoTendencias.itens || [];

  grade.innerHTML = itens
    .map((item, indice) => {
      const numero = String(indice + 1).padStart(2, "0");
      const temHover = item.imagemHover && item.imagemHover !== item.imagem;

      return `
        <article class="look-card">
          ${item.etiqueta ? `<span class="look-tag">${escaparHTML(item.etiqueta)}</span>` : ""}
          <div class="look-card-imagem">
            <img class="imagem-base" src="${escaparHTML(item.imagem)}" alt="${escaparHTML(item.titulo || "Look da coleção")}" loading="lazy">
            ${temHover ? `<img class="imagem-hover" src="${escaparHTML(item.imagemHover)}" alt="" loading="lazy">` : ""}
          </div>
          <div class="look-card-legenda">
            <p class="look-card-titulo">${escaparHTML(item.titulo || "")}</p>
            <span class="look-card-indice">${numero}</span>
          </div>
        </article>
      `;
    })
    .join("");

  // Reobserva os novos cards para a animação de entrada
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("em-vista");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  grade.querySelectorAll(".look-card").forEach((card) => observador.observe(card));
}

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}
