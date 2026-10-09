# Atlee — landing page

Landing page institucional da **Atlee**, a plataforma que digitaliza a gestão de atléticas universitárias: ingresso com QR Code, lojinha com estoque, split de pagamento automático, dashboard financeiro e banco de membros.

Site estático (HTML + CSS + JS puro), pronto para o **GitHub Pages** — sem build e sem dependências para instalar.

## Publicar no GitHub Pages

1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment**, escolha **Source: Deploy from a branch**.
3. Selecione a branch **`main`** e a pasta **`/ (root)`** e clique em **Save**.
4. Em cerca de 1 minuto o site fica disponível em `https://j0aoarthur.github.io/atlee-landing/`.

## Estrutura

```
index.html                 página completa
favicon.svg
assets/css/style.css       estilos (neo-brutalista: Tinta, Papel, Sinal, Apoio)
assets/js/app.js           interações: sticky do iPhone, header, navegação, linha de jornada, tilt, depoimentos, formulário
assets/js/phone3d.js       motor 3D do iPhone (three.js r169 + GLTFLoader + meshopt)
assets/js/phone-assets.js  modelo do iPhone (GLB comprimido) e telas do app da Psicoferas
assets/img/                imagens usadas quando o 3D não está disponível
```

## Configurar

- **WhatsApp da Atlee:** no `index.html`, preencha `data-whatsapp` na tag `<body>` com o número só em dígitos, com DDI e DDD (ex.: `5571999990000`). Com ele preenchido, a tela de confirmação do formulário mostra o botão "Chamar agora no WhatsApp" com uma mensagem já montada.
- **Formulário de contato:** hoje ele valida os campos e mostra a confirmação, mas **não envia os dados para lugar nenhum**. Para receber os contatos, ligue o envio em `assets/js/app.js` (bloco `formulário`) a um serviço como Formspree, um Google Forms/Apps Script ou a API da própria Atlee.
- **Placeholders a substituir:** os depoimentos (`[Depoimento real: …]` e `[Nome]`) e o número de vagas (`[N] vagas de implantação neste semestre`).

## Acessibilidade e desempenho

- Com "reduzir movimento" ativado no sistema, a página mostra uma versão estática: sem 3D, sem sticky e com as funcionalidades em lista.
- Sem WebGL, o iPhone 3D é trocado por um mockup em CSS com as mesmas telas.
- O modelo 3D foi otimizado de 4,7 MB para ~420 KB (geometria comprimida com meshopt).
