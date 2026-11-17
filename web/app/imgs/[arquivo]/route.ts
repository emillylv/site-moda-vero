import { lerImagemSalva } from "@/lib/armazenamento";
import { diretorioDados } from "@/lib/server/dados";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* As fotos do repositório (public/imgs) são servidas pelo próprio Next antes
   de chegar aqui; esta rota só atende as que o painel gravou no volume. */
export async function GET(_req: Request, { params }: { params: Promise<{ arquivo: string }> }) {
  const { arquivo } = await params;
  const dir = diretorioDados();

  let imagem: Buffer | null = null;
  if (dir) {
    try {
      imagem = await lerImagemSalva(dir, arquivo);
    } catch (erro) {
      console.error("Falha ao ler imagem do volume:", erro instanceof Error ? erro.message : "erro");
    }
  }
  if (!imagem) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  return new Response(new Uint8Array(imagem), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(imagem.length),
      // O nome é um UUID novo a cada envio: o conteúdo de uma URL nunca muda.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
