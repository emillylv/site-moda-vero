/* ===================================================================
   COLEÇÃO ATUAL — arquivo fácil de editar
   ===================================================================

   Este arquivo controla TUDO que aparece na seção "Tendências" do
   site. Você pode editar direto aqui (sem precisar tocar no HTML),
   ou usar o painel visual em admin.html, que gera este arquivo
   automaticamente para você.

   COMO TROCAR A COLEÇÃO ATUAL:
   1) Troque o texto de "colecao" abaixo (ex: "Inverno 2026").
   2) Cada look fica dentro de "{ ... }" na lista "itens".
      - imagem        -> caminho da foto principal (ex: "imgs/0001.jpg")
      - imagemHover    -> foto que aparece ao passar o mouse/tocar
                          (pode repetir a mesma imagem se não tiver outra)
      - titulo        -> legenda curta do look
      - etiqueta      -> selo que aparece no canto da foto
                          (ex: "Tendência", "Novo", "Mais vendido")
   3) Para ADICIONAR um look novo: copie um bloco inteiro (de "{" até
      "}," ) e cole antes do "]" final.
   4) Para REMOVER um look: apague o bloco inteiro dele.
   5) Coloque as fotos novas dentro da pasta /imgs e escreva aqui o
      nome exato do arquivo. As fotos podem ser verticais (retrato),
      formato 2x3 funciona melhor (ex: 1000 x 1500 pixels).

   Dica: não precisa entender programação para fazer isso — é só
   copiar, colar e trocar o texto entre as aspas " ".
   =================================================================== */

const colecaoTendencias = {
  colecao: "Verão 2026",

  itens: [
    {
      imagem: "imgs/0001.jpg",
      imagemHover: "imgs/0001-alt.jpg",
      titulo: "Alfaiataria leve",
      etiqueta: "Tendência"
    },
    {
      imagem: "imgs/0002.jpg",
      imagemHover: "imgs/0002-alt.jpg",
      titulo: "Texturas naturais",
      etiqueta: "Tendência"
    },
    {
      imagem: "imgs/0003.jpg",
      imagemHover: "imgs/0003-alt.jpg",
      titulo: "Tons terrosos",
      etiqueta: "Novo"
    },
    {
      imagem: "imgs/0004.jpg",
      imagemHover: "imgs/0004-alt.jpg",
      titulo: "Camadas e sobreposições",
      etiqueta: "Tendência"
    },
    {
      imagem: "imgs/0006.jpg",
      imagemHover: "imgs/0006-alt.jpg",
      titulo: "Acessórios statement",
      etiqueta: "Novo"
    },
    {
      imagem: "imgs/0005.jpg",
      imagemHover: "imgs/0005-alt.jpg",
      titulo: "Elegância casual",
      etiqueta: "Mais pedido"
    }
  ]
};
