import "server-only";

/** Retorna somente uma origem pública canônica; nunca preserva credenciais na URL. */
export function obterOrigemSite(): URL | null {
  const valor =
    process.env.SITE_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");

  try {
    const url = new URL(valor);
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      return null;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") return null;
    return new URL(url.origin);
  } catch {
    return null;
  }
}

export function obterBaseMetadata(): URL {
  return obterOrigemSite() || new URL("http://localhost:3000");
}
