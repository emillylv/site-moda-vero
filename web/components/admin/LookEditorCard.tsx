"use client";

import { useState } from "react";
import { Field, Input, Select } from "@/components/ds/Input";
import { caminhoImagemValido } from "@/lib/validation";
import { ETIQUETAS_VALIDAS } from "@/lib/trends";
import { ImageUploader } from "./ImageUploader";
import type { CampoLookEdicao, LookEdicao } from "./types";

interface LookEditorCardProps {
  item: LookEdicao;
  indice: number;
  total: number;
  csrfToken: string;
  onChange: (id: number, campo: CampoLookEdicao, valor: string) => void;
  onMove: (id: number, direcao: -1 | 1) => void;
  onRemove: (id: number) => void;
}

function rotuloEtiqueta(valor: string): string {
  return valor || "Sem etiqueta";
}

export function LookEditorCard({
  item,
  indice,
  total,
  csrfToken,
  onChange,
  onMove,
  onRemove,
}: LookEditorCardProps) {
  const [previewLocal, setPreviewLocal] = useState<string | null>(null);
  const imagemSegura = caminhoImagemValido(item.imagem) ? item.imagem : null;
  const imagemPreview = previewLocal || imagemSegura;

  return (
    <div className="look-editor-card">
      <div className="look-editor-thumb">
        {imagemPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagemPreview} alt={`Prévia de ${item.titulo || `look ${indice + 1}`}`} />
        ) : (
          <span>Prévia da foto principal</span>
        )}
      </div>

      <div className="look-editor-campos">
        <div className="campo-largo">
          <Field label="Título do look" htmlFor={`titulo-${item.id}`}>
            <Input
              id={`titulo-${item.id}`}
              value={item.titulo}
              maxLength={200}
              placeholder="Ex.: Alfaiataria leve"
              onChange={(evento) => onChange(item.id, "titulo", evento.target.value)}
            />
          </Field>
        </div>

        <Field label="Foto principal" htmlFor={`imagem-${item.id}`}>
          <Input
            id={`imagem-${item.id}`}
            value={item.imagem}
            maxLength={300}
            placeholder="/imgs/0001.jpg"
            onChange={(evento) => onChange(item.id, "imagem", evento.target.value)}
          />
        </Field>

        <Field label="Foto ao passar o mouse" htmlFor={`hover-${item.id}`}>
          <Input
            id={`hover-${item.id}`}
            value={item.imagemHover}
            maxLength={300}
            placeholder="/imgs/0001-alt.jpg"
            onChange={(evento) => onChange(item.id, "imagemHover", evento.target.value)}
          />
        </Field>

        <div className="campo-largo">
          <ImageUploader
            id={`upload-${item.id}`}
            csrfToken={csrfToken}
            onPreviewChange={setPreviewLocal}
            onUploaded={(caminho) => onChange(item.id, "imagem", caminho)}
          />
        </div>

        <div className="campo-largo">
          <Field label="Etiqueta" htmlFor={`etiqueta-${item.id}`}>
            <Select
              id={`etiqueta-${item.id}`}
              value={item.etiqueta}
              onChange={(evento) => onChange(item.id, "etiqueta", evento.target.value)}
            >
              {ETIQUETAS_VALIDAS.map((etiqueta) => (
                <option key={etiqueta || "sem-etiqueta"} value={etiqueta}>
                  {rotuloEtiqueta(etiqueta)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="look-editor-acoes">
          <div className="look-editor-mover">
            <button
              type="button"
              className="botao-icone"
              title="Mover para cima"
              aria-label={`Mover ${item.titulo || `look ${indice + 1}`} para cima`}
              disabled={indice === 0}
              onClick={() => onMove(item.id, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              className="botao-icone"
              title="Mover para baixo"
              aria-label={`Mover ${item.titulo || `look ${indice + 1}`} para baixo`}
              disabled={indice === total - 1}
              onClick={() => onMove(item.id, 1)}
            >
              ↓
            </button>
          </div>
          <button type="button" className="botao-remover" onClick={() => onRemove(item.id)}>
            Remover look
          </button>
        </div>
      </div>
    </div>
  );
}
