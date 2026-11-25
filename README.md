# MI. Móveis — site, catálogo e assistente de orçamentos

Site estático (HTML + CSS + JavaScript puros) da **MI. Móveis**, empresa familiar de móveis de madeira infantis.

## Páginas
| Arquivo | O que é |
|---|---|
| `index.html` | Início: apresentação, destaques, cores, galeria, dúvidas e contato |
| `catalogo.html` | **Catálogo** com fotos reais (sem fundo), busca, filtro, paleta de cores e impressão em PDF |
| `madeira.html` | Página só dos **móveis de madeira** (mesas e cadeiras) |
| `treinar.html` | **Treinamento da assistente** (área interna, sem link no menu) |
| `login.html` | Login de demonstração |

## Recursos novos
- **Fotos sem fundo** em `assets/produtos/` (WebP com transparência), emolduradas como fichas de catálogo.
- **13 cores** (amarelo, laranja, vermelho, rosa, rosa claro, lilás, azul escuro, azul claro, azul bebê, verde bandeira, verde claro, branco e madeira natural).
- **Escolha de cor → tamanho já sugerido → quantidade → adicionar ao orçamento.** A prévia repinta a foto na cor escolhida (veja a nota abaixo).
- **Meu orçamento**: lista persistente, desconto por quantidade e envio pelo WhatsApp.
- **Assistente de orçamentos**: entende frases como “quero 2 conjuntos amarelos azul claro tamanho médio”, pergunta o que faltar, calcula e monta o pedido.
- **Treinamento** (`treinar.html`): edite preços, cores, tamanhos, regras e ensine respostas; veja as perguntas que ela não soube responder.
- Tudo continua acessível (WCAG 2.2 AA): teclado, leitor de tela, tema escuro e alto contraste, painel de acessibilidade.

## ⚠ Antes de publicar
Os **preços, medidas, prazos, formas de pagamento, WhatsApp, e-mail e telefone** são **exemplos**.
1. Abra `treinar.html`, ajuste tudo e desmarque *“Os valores ainda são de exemplo”* (em Regras).
2. Clique em **Baixar treinamento.js**, substitua `js/treinamento.js` e publique.
3. Troque o telefone e o e-mail do rodapé e da seção de contato (`index.html`, `catalogo.html`, `madeira.html`, `treinar.html`).

## Como rodar
A **prévia de cor** usa a *canvas* do navegador, que **não funciona ao abrir o arquivo com duplo clique** (`file://`). Use um servidor local:
```bash
python3 -m http.server 8000     # depois acesse http://localhost:8000
```
No GitHub Pages funciona normalmente. Se abrir por duplo clique, tudo funciona, só que a prévia mostra a foto original com um aviso.

## Como a assistente “aprende”
- **Modo padrão (sem custo, funciona offline):** regras + os dados de `js/dados.js` / treinamento. Ela entende produto, cor, tamanho, quantidade e idade da criança.
- **Perguntas sem resposta:** ficam registradas **neste navegador** (aparecem em `treinar.html` → *Sem resposta*). Para coletar de todos os visitantes seria preciso um servidor.
- **IA generativa (opcional):** veja `worker/LEIA-ME.md`.

## Estrutura
```
index.html  catalogo.html  madeira.html  treinar.html  login.html
css/style.css        base, temas e acessibilidade
css/app.css          catálogo, configurador, orçamento, assistente, treinamento
js/dados.js          catálogo, cores, tamanhos, preços, regras, perguntas (EDITÁVEL)
js/treinamento.js    treinamento publicado (gerado por treinar.html)
js/orcamento.js      carrinho e painel do orçamento
js/catalogo.js       fichas, filtros, paleta e configurador com prévia de cor
js/assistente.js     assistente de orçamentos
js/treinar.js        página de treinamento
js/main.js           tema, acessibilidade, menu, carrossel, formulário de contato
assets/produtos/     fotos sem fundo (+ máscaras de cor *-mascara.png)
assets/galeria/      slides do carrossel
worker/              servidor intermediário opcional para IA generativa
tools/contraste.py   cálculo de contraste WCAG
```

## Como adicionar um produto novo
1. Tire a foto, remova o fundo e salve em `assets/produtos/nome.webp`.
2. Em `treinar.html` você edita os produtos existentes. Para **criar** um novo, copie um bloco de `produtos` em `js/dados.js` e ajuste `id`, `nome`, `foto`, `precos`.
3. A prévia de cor só funciona se existir a máscara `nome-mascara.png` (opcional; sem ela a foto fica na cor original).