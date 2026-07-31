"use client";

import { useId, useState, type FormEvent } from "react";
import { Field, Input } from "@/components/ds/Input";
import { registrarAgendamentoWhatsapp } from "@/lib/analytics";
import { whatsapp } from "@/lib/links";

/* Os dois campos entram numa mensagem de WhatsApp, não num banco: o limite
   existe para a conversa não abrir com um parágrafo colado no lugar do nome. */
const LIMITE_CAMPO = 80;

/* A frase repete "agendar uma consultoria" de propósito — é por ela que a
   medição do site reconhece o pedido de agendamento. */
function montarMensagem(nome: string, cidade: string): string {
  return `Olá, Verônica! Meu nome é ${nome}, sou de ${cidade} e gostaria de agendar uma consultoria.`;
}

export function AgendamentoForm() {
  const idNome = useId();
  const idCidade = useId();
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    // O `required` dos campos já barra o envio vazio; aqui assumimos a
    // navegação, porque o destino depende do que foi digitado.
    evento.preventDefault();

    const nomeLimpo = nome.trim();
    const cidadeLimpa = cidade.trim();
    // Só espaços passam pelo `required` do navegador — volta para o campo.
    if (!nomeLimpo || !cidadeLimpa) {
      document.getElementById(nomeLimpo ? idCidade : idNome)?.focus();
      return;
    }

    const destino = whatsapp(montarMensagem(nomeLimpo, cidadeLimpa));
    registrarAgendamentoWhatsapp();

    // O WhatsApp abre em aba nova, como no resto do site. Se o navegador
    // bloquear a janela, seguimos na mesma aba em vez de não fazer nada.
    const aba = window.open(destino, "_blank", "noopener");
    if (!aba) window.location.href = destino;
  }

  return (
    // Sem `.reveal`: o formulário é o motivo da página existir e não fica
    // dependendo da animação de entrada para aparecer.
    <form className="agendamento-form" onSubmit={aoEnviar}>
      <Field label="Seu nome" htmlFor={idNome}>
        <Input
          id={idNome}
          name="nome"
          type="text"
          autoComplete="name"
          placeholder="Como a Verônica deve te chamar"
          maxLength={LIMITE_CAMPO}
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          required
        />
      </Field>

      <Field label="Sua cidade" htmlFor={idCidade}>
        <Input
          id={idCidade}
          name="cidade"
          type="text"
          autoComplete="address-level2"
          placeholder="Belo Horizonte, MG"
          maxLength={LIMITE_CAMPO}
          value={cidade}
          onChange={(evento) => setCidade(evento.target.value)}
          required
        />
      </Field>

      <button type="submit" className="btn btn-primario btn-grande agendamento-envio">
        Continuar no WhatsApp
        <span className="btn-seta" aria-hidden="true">
          →
        </span>
      </button>

      <p className="agendamento-aviso">
        A conversa abre já com o seu nome e a sua cidade escritos. Nada é
        enviado antes de você tocar em enviar no WhatsApp.
      </p>
    </form>
  );
}
