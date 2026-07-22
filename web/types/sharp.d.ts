// sharp 0.35 fornece declarações, mas sua export map atual não expõe o campo
// `types` ao moduleResolution=bundler. Esta superfície mínima mantém o código
// tipado até o pacote publicar a condição correspondente.
declare module "sharp" {
  interface SharpOptions {
    animated?: boolean;
    failOn?: "none" | "truncated" | "error" | "warning";
    limitInputPixels?: number | boolean;
  }

  interface Metadata {
    width?: number;
    height?: number;
    pages?: number;
  }

  interface ResizeOptions {
    width?: number;
    height?: number;
    fit?: "contain" | "cover" | "fill" | "inside" | "outside";
    withoutEnlargement?: boolean;
  }

  interface WebpOptions {
    quality?: number;
    effort?: number;
  }

  interface Sharp {
    metadata(): Promise<Metadata>;
    rotate(): Sharp;
    resize(options: ResizeOptions): Sharp;
    webp(options?: WebpOptions): Sharp;
    toBuffer(): Promise<Buffer>;
  }

  export default function sharp(input: Buffer, options?: SharpOptions): Sharp;
}
