/* =========================================================================
   Rate limiter simples em memória (best-effort).
   Nota: em ambientes serverless com várias instâncias, o estado não é
   compartilhado. Para produção com escala, use um store externo (Redis).
   ========================================================================= */

interface Registro {
  contador: number;
  reiniciaEm: number;
}

const baldes = new Map<string, Registro>();

export interface ResultadoLimite {
  permitido: boolean;
  restante: number;
  reiniciaEm: number;
}

/**
 * Retorna se a requisição está dentro do limite para a chave informada.
 * @param chave  identificador (ex.: IP)
 * @param max    máximo de requisições na janela
 * @param janelaMs  tamanho da janela em ms
 */
export function verificarLimite(
  chave: string,
  max: number,
  janelaMs: number
): ResultadoLimite {
  const agora = Date.now();
  const registro = baldes.get(chave);

  if (!registro || agora > registro.reiniciaEm) {
    const reiniciaEm = agora + janelaMs;
    baldes.set(chave, { contador: 1, reiniciaEm });
    return { permitido: true, restante: max - 1, reiniciaEm };
  }

  registro.contador += 1;
  const permitido = registro.contador <= max;
  return {
    permitido,
    restante: Math.max(0, max - registro.contador),
    reiniciaEm: registro.reiniciaEm,
  };
}

/** Extrai um identificador de cliente a partir dos cabeçalhos da requisição. */
export function chaveCliente(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "desconhecido";
}
