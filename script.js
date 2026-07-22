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

  const itens = (Array.isArray(colecaoTendencias.itens) ? colecaoTendencias.itens : [])
    .filter((item) => item && caminhoImagemSeguro(item.imagem));
  const fragmento = document.createDocumentFragment();

  itens.forEach((item, indice) => {
    const card = document.createElement("article");
    card.className = "look-card";

    if (item.etiqueta) {
      const etiqueta = document.createElement("span");
      etiqueta.className = "look-tag";
      etiqueta.textContent = String(item.etiqueta);
      card.appendChild(etiqueta);
    }

    const imagemContainer = document.createElement("div");
    imagemContainer.className = "look-card-imagem";
    const imagemBase = document.createElement("img");
    imagemBase.className = "imagem-base";
    imagemBase.src = item.imagem;
    imagemBase.alt = typeof item.titulo === "string" ? item.titulo : "Look da coleção";
    imagemBase.loading = "lazy";
    imagemContainer.appendChild(imagemBase);

    if (caminhoImagemSeguro(item.imagemHover) && item.imagemHover !== item.imagem) {
      const imagemHover = document.createElement("img");
      imagemHover.className = "imagem-hover";
      imagemHover.src = item.imagemHover;
      imagemHover.alt = "";
      imagemHover.loading = "lazy";
      imagemContainer.appendChild(imagemHover);
    }
    card.appendChild(imagemContainer);

    const legenda = document.createElement("div");
    legenda.className = "look-card-legenda";
    const titulo = document.createElement("p");
    titulo.className = "look-card-titulo";
    titulo.textContent = typeof item.titulo === "string" ? item.titulo : "";
    const numero = document.createElement("span");
    numero.className = "look-card-indice";
    numero.textContent = String(indice + 1).padStart(2, "0");
    legenda.append(titulo, numero);
    card.appendChild(legenda);
    fragmento.appendChild(card);
  });

  grade.replaceChildren(fragmento);

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

function caminhoImagemSeguro(caminho) {
  return typeof caminho === "string" && /^imgs\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:avif|gif|jpe?g|png|webp)$/i.test(caminho);
}
