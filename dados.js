/* =====================================================================
   MI. MÓVEIS — dados.js
   Fonte ÚNICA de verdade do catálogo, das cores, dos tamanhos, dos
   preços, das regras de orçamento e do "treinamento" da assistente.

   ⚠ TODOS os preços, medidas, prazos e textos abaixo são EXEMPLOS.
   Edite aqui, ou (melhor) pela página treinar.html, que salva o seu
   treinamento e gera o arquivo js/treinamento.js para publicar.
   ===================================================================== */
(() => {
  "use strict";

  const PADRAO = {
    exemplo: true,   // enquanto true, o site avisa que os valores são de exemplo

    empresa: {
      nome: "MI. Móveis",
      whatsapp: "5500000000000",          // DDI + DDD + número, só dígitos
      email: "contato@seudominio.com.br",
    },

    assistente: {
      nome: "Mimi",
      saudacao: "Oi! Eu sou a Mimi, a assistente de orçamentos da MI. Móveis. Posso montar o seu orçamento em poucos passos. Por onde quer começar?",
      tom: "simpática, clara, objetiva e acolhedora; usa frases curtas",
      naoSei: "Hmm, essa eu ainda não sei responder. Posso chamar a nossa equipe no WhatsApp para te ajudar?",
    },

    /* ---------- CORES ---------- */
    cores: [
      { id: "amarelo",        nome: "Amarelo",        hex: "#F2B705", apelidos: ["amarela"], ativo: true, acrescimo: 0 },
      { id: "laranja",        nome: "Laranja",        hex: "#F28C28", apelidos: [], ativo: true, acrescimo: 0 },
      { id: "vermelho",       nome: "Vermelho",       hex: "#D62839", apelidos: ["vermelha"], ativo: true, acrescimo: 0 },
      { id: "rosa",           nome: "Rosa",           hex: "#E8579A", apelidos: ["pink"], ativo: true, acrescimo: 0 },
      { id: "rosa-claro",     nome: "Rosa claro",     hex: "#F7B6CF", apelidos: ["rosa bebe", "rosinha"], ativo: true, acrescimo: 0 },
      { id: "lilas",          nome: "Lilás",          hex: "#A98BD8", apelidos: ["roxo", "roxa", "lavanda"], ativo: true, acrescimo: 0 },
      { id: "azul-escuro",    nome: "Azul escuro",    hex: "#1F3A7A", apelidos: ["azul marinho", "marinho"], ativo: true, acrescimo: 0 },
      { id: "azul-claro",     nome: "Azul claro",     hex: "#5AA9E6", apelidos: ["azul celeste", "celeste"], ativo: true, acrescimo: 0 },
      { id: "azul-bebe",      nome: "Azul bebê",      hex: "#A8D8EA", apelidos: ["azul baby", "azul agua", "azul bebe"], ativo: true, acrescimo: 0 },
      { id: "verde-bandeira", nome: "Verde bandeira", hex: "#009C3B", apelidos: ["verde escuro", "verde forte"], ativo: true, acrescimo: 0 },
      { id: "verde-claro",    nome: "Verde claro",    hex: "#A5DDA0", apelidos: ["verde agua", "verde menta", "verde bebe"], ativo: true, acrescimo: 0 },
      { id: "branco",         nome: "Branco",         hex: "#F4F4F0", apelidos: ["branca"], ativo: true, acrescimo: 0 },
      { id: "madeira-natural", nome: "Madeira natural", hex: "#D9A66B", apelidos: ["natural", "madeira", "verniz", "cru"], ativo: true, acrescimo: 0 },
    ],

    /* ---------- TAMANHOS ---------- */
    tamanhos: [
      { id: "p", nome: "Pequeno", idade: "1 a 3 anos", idadeMin: 1, idadeMax: 3, mesa: "50 × 50 × 45 cm", assento: "22 cm", apelidos: ["pequena", "menor", "mini"] },
      { id: "m", nome: "Médio",   idade: "3 a 6 anos", idadeMin: 4, idadeMax: 6, mesa: "60 × 60 × 50 cm", assento: "27 cm", apelidos: ["media", "normal", "padrao"] },
      { id: "g", nome: "Grande",  idade: "6 a 10 anos", idadeMin: 7, idadeMax: 10, mesa: "70 × 70 × 55 cm", assento: "32 cm", apelidos: ["maior", "gigante"] },
    ],

    /* ---------- PRODUTOS (fotos reais, sem fundo) ---------- */
    produtos: [
      {
        id: "conjunto-amarelo", nome: "Conjunto Amarelo",
        curto: "Mesinha com 2 cadeirinhas",
        descricao: "Mesinha de tampo branco com duas cadeirinhas de encosto vazado, pintadas em amarelo vivo. O queridinho para brincar, desenhar e lanchar.",
        composicao: "1 mesinha + 2 cadeirinhas", itens: ["Mesinha de madeira", "2 cadeirinhas"],
        foto: "assets/produtos/conjunto-amarelo.webp", mascara: "assets/produtos/conjunto-amarelo-mascara.png", w: 517, h: 364,
        material: "madeira", tipo: "conjunto", familia: "amarelo", corPadrao: "amarelo", destaque: true, ativo: true,
        apelidos: ["conjunto amarelo", "mesinha amarela", "duas cadeiras amarelas", "amarelinho"],
        precos: { p: 380, m: 430, g: 490 },
      },
      {
        id: "conjunto-rosa", nome: "Conjunto Rosa com Banquinho",
        curto: "Mesinha com gaveta, cadeirinha e banquinho",
        descricao: "Mesinha com gaveta, cadeirinha e um banquinho de degrau que ajuda os pequenos a alcançar a pia e o espelho. Tudo na mesma cor.",
        composicao: "1 mesinha com gaveta + cadeirinha + banquinho de degrau", itens: ["Mesinha com gaveta", "Cadeirinha", "Banquinho de degrau"],
        foto: "assets/produtos/conjunto-rosa.webp", mascara: "assets/produtos/conjunto-rosa-mascara.png", w: 629, h: 900,
        material: "madeira", tipo: "conjunto", familia: "rosa", corPadrao: "rosa", destaque: true, ativo: true,
        apelidos: ["conjunto rosa", "rosa com banquinho", "banquinho", "degrau", "escadinha", "mesinha rosa"],
        precos: { p: 450, m: 510, g: 580 },
      },
      {
        id: "conjunto-branco", nome: "Conjunto Branco com Gaveta",
        curto: "Mesinha com gaveta e 2 cadeirinhas",
        descricao: "Clássico e delicado: mesinha com gaveta e duas cadeirinhas, tudo branco. Combina com qualquer decoração de quarto ou sala.",
        composicao: "1 mesinha com gaveta + 2 cadeirinhas", itens: ["Mesinha com gaveta", "2 cadeirinhas"],
        foto: "assets/produtos/conjunto-branco.webp", mascara: null, w: 705, h: 537,
        material: "madeira", tipo: "conjunto", familia: "branco", corPadrao: "branco", destaque: true, ativo: true,
        apelidos: ["conjunto branco", "branco com gaveta", "mesinha branca"],
        precos: { p: 420, m: 480, g: 550 },
      },
      {
        id: "mesinha-natural", nome: "Mesinha de Madeira Natural",
        curto: "Pinus natural com gaveta e cadeirinha",
        descricao: "A beleza da madeira à mostra: estrutura em madeira natural com tampo branco e gaveta com trilho. A cadeirinha acompanha na cor que você escolher.",
        composicao: "1 mesinha de madeira natural com gaveta + cadeirinha", itens: ["Mesinha com gaveta (madeira natural)", "Cadeirinha colorida"],
        foto: "assets/produtos/mesinha-natural.webp", mascara: "assets/produtos/mesinha-natural-mascara.png", w: 721, h: 704,
        material: "madeira", tipo: "conjunto", familia: "natural", corPadrao: "azul-bebe", destaque: true, ativo: true,
        apelidos: ["mesinha natural", "mesa natural", "pinus", "mesinha de madeira"],
        precos: { p: 400, m: 460, g: 520 },
      },
      {
        id: "conjunto-pes-amarelos", nome: "Conjunto Pés Amarelos",
        curto: "Mesinha com 4 cadeirinhas",
        descricao: "Mesa com pés e detalhes coloridos e quatro cadeirinhas brancas: perfeito para turminhas, brinquedotecas e festas.",
        composicao: "1 mesinha + 4 cadeirinhas", itens: ["Mesinha", "4 cadeirinhas"],
        foto: "assets/produtos/conjunto-pes-amarelos.webp", mascara: "assets/produtos/conjunto-pes-amarelos-mascara.png", w: 696, h: 569,
        material: "madeira", tipo: "conjunto", familia: "amarelo", corPadrao: "amarelo", destaque: true, ativo: true,
        apelidos: ["pes amarelos", "pe amarelo", "quatro cadeiras", "4 cadeiras", "mesa com 4 cadeiras", "turminha"],
        precos: { p: 560, m: 640, g: 720 },
      },
    ],

    /* ---------- REGRAS DE ORÇAMENTO ---------- */
    regras: {
      descontos: [{ min: 3, pct: 5 }, { min: 6, pct: 10 }],     // desconto por quantidade total de itens
      prazo: "15 a 20 dias úteis, dependendo da cor e da quantidade",
      entrega: "Entregamos na região; para outras cidades, combinamos o frete pelo WhatsApp",
      pagamento: "Pix com desconto, ou cartão em até 3x (consulte condições)",
      validade: "7 dias",
      sobMedida: "Fazemos medidas e cores sob encomenda. Conte a sua ideia que a equipe avalia",
      material: "Móveis de madeira, com acabamento liso e cantos arredondados",
    },

    /* ---------- PERGUNTAS E RESPOSTAS (o "treinamento") ---------- */
    faq: [
      { chaves: "prazo, demora, quanto tempo, entrega rapida, quando fica pronto", resposta: "O prazo é de {prazo}. Se você precisa para uma data específica, me conta que eu aviso a equipe." },
      { chaves: "entrega, entregam, frete, enviam, correios, retirar, retirada", resposta: "{entrega}." },
      { chaves: "pagamento, pagar, pix, cartao, parcelar, parcela, boleto, formas de pagamento", resposta: "{pagamento}." },
      { chaves: "desconto, promocao, mais barato, atacado, varias unidades", resposta: "Temos desconto por quantidade: {desconto}. Os valores já aparecem no orçamento." },
      { chaves: "sob medida, personalizado, medida especial, outra medida, outra cor, cor diferente, encomenda", resposta: "{sobMedida}." },
      { chaves: "material, madeira, pinus, mdf, tinta, verniz, atoxica, seguro, seguranca", resposta: "{material}. Se quiser saber sobre tintas e acabamentos, a equipe te passa os detalhes pelo WhatsApp." },
      { chaves: "garantia, defeito, troca, devolucao", resposta: "Cada móvel é conferido antes da entrega. Para garantia e trocas, a equipe combina com você pelo WhatsApp." },
      { chaves: "idade, quantos anos, para que idade, crianca pequena", resposta: "Temos 3 tamanhos: Pequeno (1 a 3 anos), Médio (3 a 6 anos) e Grande (6 a 10 anos). Me diga a idade da criança que eu indico o melhor." },
      { chaves: "validade, quanto tempo vale o orcamento", resposta: "O orçamento vale por {validade}." },
      { chaves: "endereco, onde fica, loja, visitar", resposta: "Para endereço e horários de atendimento, chame a nossa equipe no WhatsApp." },
    ],

    /* ---------- MODO IA GENERATIVA (opcional) ---------- */
    llm: { ativo: false, endpoint: "" },
  };

  /* ---------- carrega o treinamento salvo ---------- */
  const store = {
    get(k, fb) { try { const v = localStorage.getItem(k); return v === null ? fb : JSON.parse(v); } catch (e) { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  let cache = null;
  function montar() {
    const d = clone(PADRAO);
    /* 1) arquivo publicado (js/treinamento.js)  2) ajustes salvos neste navegador */
    [window.MI_TREINO, store.get("mi-treino", null)].forEach((t) => {
      if (t && typeof t === "object") Object.keys(t).forEach((k) => { if (k in d) d[k] = clone(t[k]); });
    });
    return d;
  }

  const MI = {
    padrao: () => clone(PADRAO),
    dados() { return cache || (cache = montar()); },
    recarregar() { cache = null; return MI.dados(); },
    salvarTreino(obj) { const ok = store.set("mi-treino", obj); cache = null; return ok; },
    limparTreino() { store.del("mi-treino"); cache = null; },
    store,
    clone,

    /* ---------- utilitários ---------- */
    fmt: (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    norm: (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(),
    cor: (id) => MI.dados().cores.find((c) => c.id === id),
    tam: (id) => MI.dados().tamanhos.find((t) => t.id === id),
    prod: (id) => MI.dados().produtos.find((p) => p.id === id),
    produtosAtivos: () => MI.dados().produtos.filter((p) => p.ativo),
    coresAtivas: () => MI.dados().cores.filter((c) => c.ativo),
    menorPreco: (p) => Math.min(...Object.values(p.precos).filter((n) => n > 0)),

    /* preço unitário de um item (produto + tamanho + cor) */
    precoUnit(produtoId, tamId, corId) {
      const p = MI.prod(produtoId), c = MI.cor(corId);
      if (!p || !p.precos[tamId]) return 0;
      return p.precos[tamId] + ((c && c.acrescimo) || 0);
    },

    /* cálculo completo do orçamento, com desconto por quantidade */
    calcular(itens) {
      const linhas = itens.map((it) => {
        const unit = MI.precoUnit(it.produtoId, it.tamId, it.corId);
        return { ...it, unit, total: unit * it.qtd, prod: MI.prod(it.produtoId), cor: MI.cor(it.corId), tam: MI.tam(it.tamId) };
      });
      const qtdTotal = linhas.reduce((s, l) => s + l.qtd, 0);
      const subtotal = linhas.reduce((s, l) => s + l.total, 0);
      const regra = [...MI.dados().regras.descontos].sort((a, b) => b.min - a.min).find((r) => qtdTotal >= r.min);
      const pct = regra ? regra.pct : 0;
      const desconto = Math.round(subtotal * pct) / 100;
      return { linhas, qtdTotal, subtotal, pct, desconto, total: subtotal - desconto };
    },

    textoDescontos() {
      const ds = MI.dados().regras.descontos;
      return ds.length ? ds.map((d) => `${d.pct}% a partir de ${d.min} itens`).join(", ") : "sem desconto por quantidade";
    },
    /* troca {prazo}, {entrega}... nas respostas */
    preencher(txt) {
      const r = MI.dados().regras;
      return txt.replace(/\{(\w+)\}/g, (_, k) => (k === "desconto" ? MI.textoDescontos() : (r[k] !== undefined ? String(r[k]).replace(/\.$/, "") : "")));
    },

    /* link do WhatsApp */
    whats(texto) {
      const n = (MI.dados().empresa.whatsapp || "").replace(/\D/g, "");
      return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
    },

    /* texto do orçamento (WhatsApp / copiar) */
    textoOrcamento(itens, cliente = {}) {
      const c = MI.calcular(itens), d = MI.dados();
      let t = `Olá! Gostaria de um orçamento da ${d.empresa.nome}:\n\n`;
      c.linhas.forEach((l, i) => {
        t += `${i + 1}) ${l.prod.nome}\n   Cor: ${l.cor.nome} | Tamanho: ${l.tam.nome} (mesa ${l.tam.mesa}) | ${l.qtd} un.\n   ${MI.fmt(l.unit)} cada = ${MI.fmt(l.total)}\n`;
      });
      t += `\nSubtotal: ${MI.fmt(c.subtotal)}`;
      if (c.pct) t += `\nDesconto (${c.pct}%): -${MI.fmt(c.desconto)}`;
      t += `\nTotal estimado: ${MI.fmt(c.total)}`;
      if (d.exemplo) t += `\n(valores de exemplo, sujeitos a confirmação)`;
      if (cliente.nome) t += `\n\nNome: ${cliente.nome}`;
      if (cliente.telefone) t += `\nTelefone: ${cliente.telefone}`;
      if (cliente.obs) t += `\nObservações: ${cliente.obs}`;
      return t;
    },

    /* instruções para o modo de IA generativa (usado só se ativado) */
    promptLLM() {
      const d = MI.dados();
      const prods = MI.produtosAtivos().map((p) => `- id "${p.id}": ${p.nome} (${p.composicao}). Preços: ` + d.tamanhos.map((t) => `${t.nome} (${t.id}) ${MI.fmt(p.precos[t.id])}`).join(", ")).join("\n");
      const cores = MI.coresAtivas().map((c) => `${c.nome} (id "${c.id}")` + (c.acrescimo ? ` +${MI.fmt(c.acrescimo)}` : "")).join(", ");
      const tams = d.tamanhos.map((t) => `${t.nome} (id "${t.id}"): ${t.idade}, mesa ${t.mesa}, assento ${t.assento}`).join("\n");
      const faq = d.faq.map((f) => `P: ${f.chaves}\nR: ${MI.preencher(f.resposta)}`).join("\n");
      return `Você é ${d.assistente.nome}, assistente de orçamentos da ${d.empresa.nome}, empresa familiar de móveis infantis de madeira. Tom: ${d.assistente.tom}. Responda sempre em português do Brasil, em frases curtas.

REGRAS
- Só ofereça produtos, cores e tamanhos listados abaixo. Nunca invente preços, prazos ou condições.
- Para montar o orçamento, descubra: produto, cor, tamanho e quantidade. Pergunte UMA coisa por vez.
- Quando o cliente confirmar um item, escreva no FINAL da mensagem, em uma linha separada: <orcamento>[{"produto":"id","cor":"id","tamanho":"id","qtd":1}]</orcamento>
- Não calcule totais: o site calcula. Se não souber algo, diga: "${d.assistente.naoSei}"

PRODUTOS
${prods}

CORES: ${cores}

TAMANHOS
${tams}

CONDIÇÕES: desconto ${MI.textoDescontos()}; prazo ${d.regras.prazo}; pagamento ${d.regras.pagamento}; validade ${d.regras.validade}.

PERGUNTAS FREQUENTES
${faq}`;
    },
  };

  window.MI = MI;
})();