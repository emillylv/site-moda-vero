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
  // Uma prévia por foto: a do arquivo recém-escolhido (blob local) tem
  // precedência sobre o caminho já publicado, para o envio ser visível na hora.
  const [previewPrincipal, setPreviewPrincipal] = useState<string | null>(null);
  const [previewHover, setPreviewHover] = useState<string | null>(null);
  const nomeLook = item.titulo || `look ${indice + 1}`;
  const imagemPreview =
    previewPrincipal || (caminhoImagemValido(item.imagem) ? item.imagem : null);
  const hoverPreview =
    previewHover || (caminhoImagemValido(item.imagemHover) ? item.imagemHover : null);

  return (
    <div className="look-editor-card">
      <div className="look-editor-thumbs">
        <div className="look-editor-thumb-bloco">
          <div className="look-editor-thumb">
            {imagemPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagemPreview} alt={`Prévia da foto principal de ${nomeLook}`} />
            ) : (
              <span>Sem foto</span>
            )}
          </div>
          <span className="look-editor-thumb-rotulo">Principal</span>
        </div>

        <div className="look-editor-thumb-bloco">
          <div className="look-editor-thumb">
            {hoverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hoverPreview} alt={`Prévia da foto de hover de ${nomeLook}`} />
            ) : (
              <span>Sem foto</span>
            )}
          </div>
          <span className="look-editor-thumb-rotulo">Ao passar o mouse</span>
        </div>
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

        <fieldset className="look-editor-foto">
          <legend>Foto principal</legend>
          <p className="look-editor-foto-ajuda">
            É a que aparece na vitrine. Envie um arquivo ou informe um caminho em /imgs.
          </p>
          <Field label="Caminho da imagem" htmlFor={`imagem-${item.id}`}>
            <Input
              id={`imagem-${item.id}`}
              value={item.imagem}
              maxLength={300}
              placeholder="/imgs/0001.jpg"
              onChange={(evento) => onChange(item.id, "imagem", evento.target.value)}
            />
          </Field>
          <ImageUploader
            id={`upload-${item.id}`}
            rotulo="Enviar nova foto principal"
            csrfToken={csrfToken}
            onPreviewChange={setPreviewPrincipal}
            onUploaded={(caminho) => onChange(item.id, "imagem", caminho)}
          />
        </fieldset>

        <fieldset className="look-editor-foto">
          <legend>Foto ao passar o mouse</legend>
          <p className="look-editor-foto-ajuda">
            Opcional: troca com a principal quando o visitante passa o mouse. Deixe em
            branco para o look ficar com uma foto só.
          </p>
          <Field label="Caminho da imagem" htmlFor={`hover-${item.id}`}>
            <Input
              id={`hover-${item.id}`}
              value={item.imagemHover}
              maxLength={300}
              placeholder="/imgs/0001-alt.jpg"
              onChange={(evento) => onChange(item.id, "imagemHover", evento.target.value)}
            />
          </Field>
          <ImageUploader
            id={`upload-hover-${item.id}`}
            rotulo="Enviar nova foto de hover"
            csrfToken={csrfToken}
            onPreviewChange={setPreviewHover}
            onUploaded={(caminho) => onChange(item.id, "imagemHover", caminho)}
          />
        </fieldset>

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
