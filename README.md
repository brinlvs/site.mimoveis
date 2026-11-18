# MI. Móveis — Si

Site estático (HTML + CSS + JavaScript puros) da **MI. Móveis**, empresa familiar do ramo de móveis de madeira.
Projeto da disciplina **Desenvolvimento de Interfaces**.

## Recursos
- Cartões de valores e de produtos, **busca + abas** por categoria, **carrossel** de imagens, **cartões explicativos** (acordeão)
- **Formulário de contato** com validação acessível
- **Página de login** (demonstração, sem servidor)
- **Modo claro / escuro / alto contraste** e **painel de acessibilidade** (tamanho da fonte, fonte legível, espaçamento, destaque de links, reduzir animações)
- Acessibilidade **WCAG 2.2 AA**, com análise de contraste documentada

## Estrutura
```
index.html          página principal
login.html          página de login (demonstração)
css/style.css       estilos, temas e preferências
js/prefs-init.js    aplica preferências antes de pintar a página
js/main.js          comportamento (tema, painel, abas, carrossel, formulários)
assets/             logo, fontes (woff2) e ilustrações SVG
tools/contraste.py  script que calcula os contrastes WCAG da paleta
```

## Como rodar
Abra `index.html` no navegador, ou sirva a pasta localmente:
```bash
python3 -m http.server 8000   # depois acesse http://localhost:8000
```

Login de demonstração: qualquer e-mail válido e senha com 6 ou mais caracteres.

## Passo a passo da construção

### 1. Planejamento

- Defini o objetivo: um site institucional para a **MI. Móveis**, empresa familiar do ramo de móveis de madeira, que apresente a empresa, mostre os produtos e permita pedir orçamento.
- Listei os requisitos do enunciado como checklist: cartões, abas de pesquisa, contato com formulário, carrossel, imagens, cartões explicativos, modo claro/escuro, rodapé, página de login, aba de acessibilidade, WCAG e análise de contraste.
- Escolhi **HTML, CSS e JavaScript puros** (sem framework CSS): o projeto é pequeno, e assim cada decisão de acessibilidade fica visível no código.

### 2. Identidade visual

- A logo original tinha fundo branco sólido. Usei Python (Pillow) para torná-lo transparente e salvei em `assets/logo.png`, preservando as cores originais.
- Amostrei as cores da logo (rosa, azul, madeira, contorno marrom, texto roxo) e criei a paleta do site a partir delas.
- Tipografia: **Baloo 2** (títulos, arredondada e amigável), **Quicksand** (texto) e **Atkinson Hyperlegible** (opção de leitura facilitada). Todas com licença livre (SIL OFL) e hospedadas localmente em `assets/fonts/`.

### 3. Estrutura de pastas

- `index.html` (página principal), `login.html` (login), `css/style.css`, `js/main.js`, `js/prefs-init.js`, `assets/` (logo, fontes, ilustrações SVG) e este `README.md`.

### 4. Tokens de cor e verificação de contraste

- Defini as cores como **variáveis CSS** (`--bg`, `--ink`, `--pink-ink`…) em três temas: claro, escuro e alto contraste (`data-theme` no `<html>`).
- Escrevi um script em Python que calcula a razão de contraste WCAG (luminância relativa) de cada par texto/fundo e só aceitei combinações com **4,5:1** para texto e **3:1** para componentes de interface. As cores pastel ficaram só como fundo e decoração; o texto usa tons escuros.

### 5. HTML semântico

- Usei marcos (`header`, `nav`, `main`, `section`, `footer`), hierarquia de títulos (um `h1`, `h2` por seção, `h3` nos cartões) e o idioma `lang="pt-BR"`.
- Incluí o link **"Pular para o conteúdo"**, textos alternativos descritivos nas imagens, rótulos (`label`) em todos os campos e um sprite SVG de ícones embutido na página.

### 6. CSS

- Organizei o arquivo em seções: fontes, tokens, base, componentes, seções da página, painel de acessibilidade, preferências do usuário e responsivo.
- Layout com CSS Grid e Flexbox, tamanhos em `rem` (o texto cresce com a preferência do usuário) e quebra para uma coluna em telas pequenas (testado até 320 px).
- Foco visível em todos os elementos interativos, alvos de toque de pelo menos 44 px e `scroll-padding-top` para o cabeçalho fixo não cobrir o foco.

### 7. JavaScript

- **prefs-init.js**: aplica tema e tamanho de fonte salvos antes da página aparecer (evita o "flash" de tema errado).
- **main.js**, em módulos: preferências e tema; painel de acessibilidade (`<dialog>`); navegação; catálogo com busca e abas; acordeão dos cartões explicativos; carrossel; validação dos formulários de contato e login.
- As preferências ficam no `localStorage`; a senha do login **nunca** é armazenada.

### 8. Imagens

- Criei ilustrações originais em SVG (9 produtos e 4 cenas para o carrossel), leves e nítidas em qualquer tela. Para o site real, basta trocá-las por fotografias dos móveis da empresa (mantendo o texto alternativo).

### 9. Acessibilidade (WCAG 2.2)

- Implementei os padrões ARIA recomendados para **abas**, **carrossel**, **acordeão** e **diálogo modal**, com navegação completa por teclado.
- Os formulários identificam erros em texto (não só por cor), ligam cada erro ao campo com `aria-describedby` e anunciam o resultado com `role="status"`/`role="alert"`.
- A tabela da seção B.2 do relatório lista os critérios WCAG atendidos e onde.

### 10. Testes

- Testes automatizados com **Playwright** (40 verificações de comportamento) e auditoria com **axe-core** (0 violações em tema claro, escuro, alto contraste, painel de acessibilidade, formulário com erros e login).
- Teste de reflow em 320 px e com texto a 150% + espaçamento ampliado, sem rolagem horizontal.
- Ainda recomendo testar manualmente com um leitor de tela (NVDA no Windows ou VoiceOver no Mac/iPhone).

### 11. Versionamento com Git e GitHub

- Crie o repositório e faça commits pequenos a cada etapa, para mostrar a evolução do projeto (veja a sugestão de commits no Apêndice).

```bash
git init
git add .
git commit -m "feat: estrutura inicial do site"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/mimoveis-site.git
git push -u origin main
```

### 12. Publicação no GitHub Pages

- No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, escolha a branch `main` e a pasta `/ (root)`, e salve.
- Em alguns minutos o site estará em `https://SEU-USUARIO.github.io/mimoveis-site/`.

### 13. Como personalizar

- Troque os dados de contato (telefone, e-mail, endereço) em `index.html` e no rodapé.
- Substitua as ilustrações por fotos reais em `assets/img/` e atualize os textos alternativos (`alt`).
- Para o formulário enviar mensagens de verdade, crie um endpoint em um serviço como o Formspree e coloque o endereço em `data-endpoint="..."` na tag `<form id="form-contato">`.
- Para mudar cores, edite apenas as variáveis no início de `css/style.css` e rode novamente a verificação de contraste.

## Observações importantes
- Os **dados de contato** (telefone, e-mail, endereço) e as **ilustrações** são exemplos: troque pelos reais.
- O formulário e o login funcionam em **modo demonstração**: nada é enviado a um servidor.
- Fontes: Baloo 2, Quicksand e Atkinson Hyperlegible (SIL Open Font License), via Fontsource.# site.mimoveis
