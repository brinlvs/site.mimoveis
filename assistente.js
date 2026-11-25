/* =====================================================================
   MI. MÓVEIS — assistente.js
   Assistente virtual de orçamentos.

   MODO PADRÃO (funciona sem internet e sem custo): entende o que o cliente
   escreve (produto, cor, tamanho, quantidade, idade da criança), pergunta o
   que faltar, calcula o orçamento com os PREÇOS e REGRAS de js/dados.js e
   responde dúvidas com as perguntas/respostas cadastradas em treinar.html.

   MODO IA GENERATIVA (opcional): se, em treinar.html, você ativar e informar
   o endereço do seu servidor intermediário (veja worker/), as conversas
   passam por um modelo de linguagem. O total do orçamento SEMPRE é calculado
   aqui, nunca pela IA.
   ===================================================================== */
(() => {
  "use strict";
  const MI = window.MI;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const ICON = (id) => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const D = () => MI.dados();
  const reduzMov = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "reduce";

  /* ---------- interface ---------- */
  document.body.insertAdjacentHTML("beforeend", `
  <button type="button" class="fab" id="chat-fab" aria-expanded="false" aria-controls="chat">${ICON("chat")}<span class="fab__txt">Orçamento com a assistente</span></button>
  <section class="chat" id="chat" role="dialog" aria-labelledby="chat-titulo" hidden>
    <div class="chat__head">
      <div class="chat__avatar" aria-hidden="true">${ICON("sparkle")}</div>
      <div class="chat__quem"><h2 id="chat-titulo"></h2><p id="chat-sub"></p></div>
      <button type="button" class="icon-btn icon-btn--sm" id="chat-fechar" aria-label="Fechar a conversa">${ICON("x")}</button>
    </div>
    <div class="chat__log" id="chat-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="Conversa"></div>
    <div class="chat__chips" id="chat-chips" role="group" aria-label="Respostas rápidas"></div>
    <form class="chat__form" id="chat-form" autocomplete="off">
      <label class="sr-only" for="chat-input">Escreva sua mensagem</label>
      <input id="chat-input" type="text" placeholder="Ex.: quero 2 conjuntos amarelos" maxlength="300">
      <button type="submit" class="icon-btn" aria-label="Enviar mensagem">${ICON("send")}</button>
    </form>
    <p class="chat__rodape">Assistente automática. Os valores são estimativas e a equipe confirma o pedido.</p>
  </section>`);

  const fab = $("#chat-fab"), box = $("#chat"), log = $("#chat-log"), chips = $("#chat-chips"), form = $("#chat-form"), input = $("#chat-input");

  /* ---------- estado da conversa ---------- */
  const novo = () => ({ produtoId: null, cand: null, corId: null, corAmb: null, tamId: null, qtd: null, pend: null });
  let est = novo(), iniciou = false, hist = [];

  function cabecalho() {
    const a = D().assistente, llm = D().llm;
    $("#chat-titulo").textContent = a.nome;
    $("#chat-sub").textContent = llm.ativo && llm.endpoint ? "Assistente com IA · orçamentos" : "Assistente virtual · orçamentos";
    input.placeholder = "Ex.: quero 2 conjuntos amarelos";
  }

  /* ---------- abrir / fechar ---------- */
  function abrir() {
    cabecalho();
    box.hidden = false; fab.setAttribute("aria-expanded", "true"); fab.hidden = true;
    if (!iniciou) { iniciou = true; saudar(); }
    setTimeout(() => input.focus(), 30);
  }
  function fechar() {
    box.hidden = true; fab.hidden = false; fab.setAttribute("aria-expanded", "false"); fab.focus();
  }
  fab.addEventListener("click", abrir);
  $$("[data-action='open-assistente']").forEach((b) => b.addEventListener("click", abrir));
  $("#chat-fechar").addEventListener("click", fechar);
  box.addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });
  document.addEventListener("mi:abrir-assistente", (e) => {
    abrir();
    const det = e.detail;
    if (det && det.produtoId) { est = novo(); est.produtoId = det.produtoId; const p = MI.prod(det.produtoId); bot({ texto: `Ótima escolha: **${p.nome}**! Vamos montar o orçamento.` }); avancar(); }
    else if (det === "finalizar") finalizar();
  });

  /* ---------- mensagens ---------- */
  const fmt = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  function rolar() { log.scrollTop = log.scrollHeight; }

  function usuario(t) {
    log.insertAdjacentHTML("beforeend", `<div class="msg msg--u"><p>${esc(t)}</p></div>`); rolar();
  }

  function bot(o) {
    const html = `
      <div class="msg msg--b">
        ${o.texto ? `<p>${fmt(MI.preencher(o.texto))}</p>` : ""}
        ${o.cards ? `<div class="mcards">${o.cards.map((p) => `
          <button type="button" class="mcard" data-say="${esc(p.nome)}">
            <img src="${p.foto}" alt="" width="64" height="48" loading="lazy">
            <span><b>${esc(p.nome)}</b><small>a partir de ${MI.fmt(MI.menorPreco(p))}</small></span>
          </button>`).join("")}</div>` : ""}
        ${o.cores ? `<ul class="mswatch">${o.cores.map((c) => `<li><i style="background:${c.hex}"></i>${esc(c.nome)}</li>`).join("")}</ul>` : ""}
        ${o.links ? `<div class="mlinks">${o.links.map((l) => l.href
          ? `<a class="btn btn--primary btn--sm" href="${l.href}" target="_blank" rel="noopener">${ICON("send")} ${esc(l.texto)}</a>`
          : `<button type="button" class="btn btn--ghost btn--sm" data-acao="${l.acao}">${esc(l.texto)}</button>`).join("")}</div>` : ""}
      </div>`;
    const colocar = () => {
      const t = $(".typing", log); if (t) t.remove();
      log.insertAdjacentHTML("beforeend", html);
      const ult = log.lastElementChild;
      $$("[data-say]", ult).forEach((b) => b.addEventListener("click", () => enviar(b.dataset.say)));
      $$("[data-acao]", ult).forEach((b) => b.addEventListener("click", () => { if (b.dataset.acao === "cart") MI.cart.open(); }));
      chipsDe(o.chips || []); rolar();
    };
    if (reduzMov()) colocar();
    else { log.insertAdjacentHTML("beforeend", `<div class="msg msg--b typing" aria-hidden="true"><p><span></span><span></span><span></span></p></div>`); rolar(); setTimeout(colocar, 380); }
  }

  function chipsDe(lista) {
    chips.innerHTML = lista.map((c) => { const l = typeof c === "string" ? { label: c, say: c } : c; return `<button type="button" class="chip" data-say="${esc(l.say)}">${esc(l.label)}</button>`; }).join("");
    $$("[data-say]", chips).forEach((b) => b.addEventListener("click", () => enviar(b.dataset.say)));
  }

  /* =================================================================
     ENTENDIMENTO DO TEXTO
     ================================================================= */
  const NUM = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10 };
  const has = (n, re) => re.test(n);
  /* tira o "s" final do plural ("conjuntos" → "conjunto") nos dois lados da comparação */
  const POUPAR = new Set(["dois", "tres", "seis", "mais", "menos", "pais", "vez"]);
  const rad = (s) => s.split(" ").map((w) => (w.length > 3 && w.endsWith("s") && !POUPAR.has(w) ? w.slice(0, -1) : w)).join(" ");

  function extrair(n) {
    let r = ` ${rad(n)} `;
    const out = { produtoIds: [], generico: false, corIds: [], corAmb: null, tamId: null, qtd: null };
    const ps = MI.produtosAtivos();

    /* produtos: frases mais longas primeiro, e "apaga" o trecho para não confundir com cor */
    const frases = [];
    ps.forEach((p) => [p.nome, ...p.apelidos].forEach((a) => { const f = rad(MI.norm(a)); if (f) frases.push({ id: p.id, f }); }));
    frases.sort((a, b) => b.f.length - a.f.length);
    const pontos = new Map();
    frases.forEach(({ id, f }) => { if (r.includes(` ${f} `)) { pontos.set(id, (pontos.get(id) || 0) + f.length); r = r.replace(` ${f} `, " "); } });
    if (pontos.size) {
      const max = Math.max(...pontos.values());
      out.produtoIds = [...pontos].filter(([, s]) => s === max).map(([id]) => id);
    } else if (has(r, /\b(gaveta)\b/)) {
      out.produtoIds = ps.filter((p) => /gaveta/i.test(p.composicao)).map((p) => p.id);
    }
    if (!out.produtoIds.length && has(r, /\b(mesinha|mesinhas|mesa|mesas|cadeira|cadeiras|cadeirinha|cadeirinhas|conjunto|conjuntos|movel|moveis)\b/)) out.generico = true;

    /* idade da criança → tamanho */
    const idade = r.match(/(\d+)\s*(anos|ano|aninhos|aninho)\b/);
    if (idade) {
      const a = +idade[1], ts = D().tamanhos;
      const t = ts.find((x) => a >= x.idadeMin && a <= x.idadeMax) || (a < ts[0].idadeMin ? ts[0] : ts[ts.length - 1]);
      out.tamId = t.id; r = r.replace(idade[0], " ");
    } else if (has(r, /\b\d+\s*mese?s?\b/)) { out.tamId = D().tamanhos[0].id; r = r.replace(/\d+\s*mese?s?/, " "); }
    r = r.replace(/\b\d+\s*(cm|mm|m)\b/g, " ");

    /* cores: aliases mais longos primeiro */
    const pares = [];
    MI.coresAtivas().forEach((c) => [c.nome, ...c.apelidos].forEach((a) => { const f = rad(MI.norm(a)); if (f) pares.push({ id: c.id, f }); }));
    pares.sort((a, b) => b.f.length - a.f.length);
    pares.forEach(({ id, f }) => { if (r.includes(` ${f} `)) { if (!out.corIds.includes(id)) out.corIds.push(id); r = r.replace(` ${f} `, " "); } });
    if (!out.corIds.length) { if (r.includes(" azul ")) out.corAmb = "azul"; else if (r.includes(" verde ")) out.corAmb = "verde"; }

    /* tamanho por nome */
    if (!out.tamId) {
      D().tamanhos.forEach((t) => [t.nome, ...t.apelidos].forEach((a) => { const f = rad(MI.norm(a)); if (f && r.includes(` ${f} `) && !out.tamId) { out.tamId = t.id; r = r.replace(` ${f} `, " "); } }));
      const letra = r.match(/\btamanho\s+(p|m|g)\b/) || (est.pend === "tam" ? r.match(/^\s*(p|m|g)\s*$/) : null);
      if (!out.tamId && letra) { const t = D().tamanhos.find((x) => x.id === letra[1]); if (t) out.tamId = t.id; }
    }

    /* quantidade */
    const dig = r.match(/\b(\d{1,2})\b/);
    if (dig && +dig[1] >= 1) out.qtd = +dig[1];
    else {
      const w = r.match(/\b(um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\b(?:\s+(?:conjuntos?|mesinhas?|unidades?|itens?|moveis|cadeiras?|kits?))?/);
      if (w && (NUM[w[1]] > 1 || /conjunto|mesinha|unidade|item|kit/.test(w[0]))) out.qtd = NUM[w[1]];
    }
    return out;
  }

  /* ---------- perguntas frequentes ---------- */
  function achaFaq(n) {
    let melhor = null, nota = 0;
    D().faq.forEach((f) => {
      let s = 0;
      f.chaves.split(",").map((k) => rad(MI.norm(k))).filter(Boolean).forEach((k) => { if (` ${rad(n)} `.includes(` ${k} `)) s += k.split(" ").length + 0.5; });
      if (s > nota) { nota = s; melhor = f; }
    });
    return melhor;
  }

  /* =================================================================
     FLUXO DO ORÇAMENTO
     ================================================================= */
  const nomesProd = (ids) => ids.map((id) => MI.prod(id)).filter(Boolean);

  function saudar() {
    const a = D().assistente;
    bot({ texto: a.saudacao, chips: ["Fazer um orçamento", "Ver produtos", "Ver cores", "Prazo e entrega"] });
  }

  function avancar() {
    if (!est.produtoId) {
      est.pend = "produto";
      const lista = est.cand ? nomesProd(est.cand) : MI.produtosAtivos();
      return bot({ texto: est.cand ? "Encontrei mais de um modelo. Qual deles você quer?" : "Qual móvel você quer? Toque em um modelo ou escreva o nome.", cards: lista, chips: ["Ver cores"] });
    }
    const p = MI.prod(est.produtoId);
    if (est.corAmb && !est.corId) {
      est.pend = "cor";
      const op = MI.coresAtivas().filter((c) => c.id.startsWith(est.corAmb));
      return bot({ texto: `Temos mais de um tom de ${est.corAmb}. Qual você prefere?`, cores: op, chips: op.map((c) => c.nome) });
    }
    if (!est.corId) {
      est.pend = "cor";
      const orig = MI.cor(p.corPadrao);
      const outras = MI.coresAtivas().filter((c) => c.id !== p.corPadrao).slice(0, 6);
      return bot({
        texto: `Em qual **cor** você quer o ${p.nome}? A foto mostra a cor ${orig ? orig.nome.toLowerCase() : ""}, mas pintamos em qualquer uma da paleta.`,
        chips: [...(orig ? [{ label: `${orig.nome} (da foto)`, say: orig.nome }] : []), ...outras.map((c) => c.nome), { label: "Ver todas as cores", say: "ver cores" }],
      });
    }
    if (!est.tamId) {
      est.pend = "tam";
      const linhas = D().tamanhos.map((t) => `• **${t.nome}** (${t.idade}) · mesa ${t.mesa}: ${MI.fmt(MI.precoUnit(p.id, t.id, est.corId))}`).join("\n");
      return bot({ texto: `Qual **tamanho**? Se preferir, me diga a idade da criança que eu indico.\n${linhas}`, chips: D().tamanhos.map((t) => t.nome) });
    }
    if (!est.qtd) {
      est.pend = "qtd";
      return bot({ texto: "Quantas unidades você quer?", chips: ["1", "2", "3", "4"] });
    }
    confirmar();
  }

  function confirmar() {
    est.pend = "confirma";
    const p = MI.prod(est.produtoId), c = MI.cor(est.corId), t = MI.tam(est.tamId);
    const calc = MI.calcular([{ produtoId: p.id, corId: c.id, tamId: t.id, qtd: est.qtd }]);
    bot({
      texto: `Confere?\n**${p.nome}**\nCor: ${c.nome} · Tamanho: ${t.nome} (mesa ${t.mesa}) · ${est.qtd} un.\nValor: **${MI.fmt(calc.total)}**${calc.pct ? ` (com ${calc.pct}% de desconto)` : ""}`,
      chips: ["Adicionar ao orçamento", "Mudar cor", "Mudar tamanho", "Mudar quantidade"],
    });
  }

  function adicionar() {
    MI.cart.add({ produtoId: est.produtoId, corId: est.corId, tamId: est.tamId, qtd: est.qtd });
    const c = MI.calcular(MI.cart.itens());
    est = novo(); est.pend = "mais";
    bot({ texto: `Pronto, adicionei ao seu orçamento! Total até agora: **${MI.fmt(c.total)}**${c.pct ? ` (desconto de ${c.pct}% aplicado)` : ""}. Quer incluir mais algum móvel?`, chips: ["Adicionar outro item", "Finalizar orçamento", "Ver meu orçamento"] });
  }

  function resumoTexto() {
    const c = MI.calcular(MI.cart.itens());
    const linhas = c.linhas.map((l) => `• ${l.qtd}× **${l.prod.nome}** · ${l.cor.nome} · ${l.tam.nome} = ${MI.fmt(l.total)}`).join("\n");
    return `${linhas}\nSubtotal: ${MI.fmt(c.subtotal)}${c.pct ? `\nDesconto (${c.pct}%): −${MI.fmt(c.desconto)}` : ""}\nTotal estimado: **${MI.fmt(c.total)}**`;
  }

  function finalizar() {
    if (est.pend === "confirma" && est.produtoId && est.corId && est.tamId && est.qtd) { MI.cart.add({ produtoId: est.produtoId, corId: est.corId, tamId: est.tamId, qtd: est.qtd }); est = novo(); }
    if (!MI.cart.itens().length) {
      est = novo();
      return bot({ texto: "Seu orçamento ainda está vazio. Vamos começar?", chips: ["Fazer um orçamento", "Ver produtos"] });
    }
    est = novo();
    const r = D().regras, cli = MI.store.get("mi-cliente", {});
    bot({
      texto: `Aqui está o seu orçamento:\n${resumoTexto()}\n\nPrazo: ${r.prazo}.\nPagamento: ${r.pagamento}.\nValidade: ${r.validade}.${D().exemplo ? "\n_Valores de exemplo, confirmados pela equipe._".replace(/_/g, "") : ""}`,
      links: [{ texto: "Enviar pelo WhatsApp", href: MI.whats(MI.textoOrcamento(MI.cart.itens(), cli)) }, { texto: "Abrir meu orçamento", acao: "cart" }],
      chips: ["Adicionar outro item", "Tenho uma dúvida"],
    });
  }

  function listarCores() {
    bot({ texto: "Estas são as cores disponíveis. Se não encontrar a que procura, fazemos sob encomenda!", cores: MI.coresAtivas(), chips: ["Fazer um orçamento", "Ver produtos"] });
  }
  function listarProdutos() {
    bot({ texto: "Estes são os nossos modelos. Toque em um para começar o orçamento.", cards: MI.produtosAtivos() });
  }
  function falarPreco(ids) {
    if (ids.length === 1) {
      const p = MI.prod(ids[0]);
      const linhas = D().tamanhos.map((t) => `• ${t.nome} (${t.idade}): ${MI.fmt(p.precos[t.id])}`).join("\n");
      est.produtoId = p.id; est.cand = null;
      return bot({ texto: `**${p.nome}** (${p.composicao}):\n${linhas}\n${MI.textoDescontos() !== "sem desconto por quantidade" ? "Desconto por quantidade: " + MI.textoDescontos() + "." : ""}`, chips: ["Quero este", "Ver outros produtos"] });
    }
    const linhas = MI.produtosAtivos().map((p) => `• **${p.nome}**: a partir de ${MI.fmt(MI.menorPreco(p))}`).join("\n");
    bot({ texto: `Os valores dependem do tamanho e da cor:\n${linhas}`, chips: ["Fazer um orçamento"] });
  }
  function humano() {
    bot({ texto: "Claro! Nossa equipe atende pelo WhatsApp.", links: [{ texto: "Chamar no WhatsApp", href: MI.whats("Olá! Vim pelo site da MI. Móveis e gostaria de falar com a equipe.") }] });
  }
  function naoSei(t) {
    const lista = MI.store.get("mi-nao-sei", []);
    lista.unshift({ texto: t, quando: new Date().toISOString() });
    MI.store.set("mi-nao-sei", lista.slice(0, 100));
    bot({ texto: D().assistente.naoSei, links: [{ texto: "Chamar a equipe no WhatsApp", href: MI.whats(`Olá! Tenho uma dúvida: ${t}`) }], chips: ["Fazer um orçamento", "Ver produtos"] });
  }

  /* =================================================================
     RESPOSTA (modo regras)
     ================================================================= */
  function responderRegras(t) {
    const n = MI.norm(t);
    const ents = extrair(n);
    const algumaEntidade = ents.produtoIds.length || ents.corIds.length || ents.corAmb || ents.tamId || ents.qtd;

    if (has(n, /\b(cancelar|recomecar|comecar de novo|reiniciar|esquece)\b/)) { est = novo(); return bot({ texto: "Tudo bem, recomeçamos. O que você gostaria?", chips: ["Fazer um orçamento", "Ver produtos", "Ver cores"] }); }
    if (has(n, /\b(obrigad[oa]|valeu|brigad[oa])\b/) && !algumaEntidade) return bot({ texto: "Eu que agradeço! Se precisar de mais alguma coisa, é só chamar.", chips: ["Ver meu orçamento", "Fazer um orçamento"] });
    if (has(n, /\b(finalizar|fechar|concluir|enviar (o )?orcamento|mandar (o )?orcamento|enviar pelo whats\w*)\b/) || (est.pend === "mais" && has(n, /^(nao|so isso|so esse|pode ser so isso|nao quero mais|nada)\b/))) return finalizar();
    if (has(n, /\b(meu orcamento|ver orcamento|carrinho|resumo)\b/)) {
      if (!MI.cart.itens().length) return bot({ texto: "Seu orçamento ainda está vazio.", chips: ["Fazer um orçamento"] });
      return bot({ texto: resumoTexto(), links: [{ texto: "Abrir meu orçamento", acao: "cart" }], chips: ["Finalizar orçamento", "Adicionar outro item"] });
    }
    if (has(n, /\b(atendente|humano|pessoa|alguem da equipe|falar com alguem|whatsapp|zap)\b/) && !est.pend) return humano();

    /* confirmações dentro do fluxo */
    if (est.pend === "confirma") {
      if (has(n, /\b(mudar|trocar|alterar|outra|outro)\b.*\b(cor)\b|\bmudar cor\b/)) { est.corId = null; est.corAmb = null; return avancar(); }
      if (has(n, /\b(mudar|trocar|alterar|outro)\b.*\b(tamanho)\b/)) { est.tamId = null; return avancar(); }
      if (has(n, /\b(mudar|trocar|alterar)\b.*\b(quantidade|qtd)\b/)) { est.qtd = null; return avancar(); }
      if (!algumaEntidade && has(n, /\b(sim|ok|pode|isso|confirmo|confirmar|adicionar|adiciona|beleza|certo|perfeito|fechado|claro)\b/)) return adicionar();
    }
    if (est.pend === "mais") {
      if (has(n, /\b(outro|mais|sim|adicionar)\b/) && !algumaEntidade) { est = novo(); return avancar(); }
    }
    if (has(n, /\bquero este\b/) && est.produtoId) return avancar();

    /* perguntas de informação */
    if (has(n, /\b(quais|que|qual|ver|mostrar|mostra|todas|tem)\b.*\b(cores?|tons?|paleta)\b|\bcores? disponive\w+|\bopcoes de cor\b/) && !ents.produtoIds.length && !est.pend) return listarCores();
    if (has(n, /\b(ver|mostrar|quais|catalogo|modelos|produtos|o que (voces )?(tem|vendem|fazem))\b/) && has(n, /\b(produtos?|catalogo|modelos|moveis)\b/) && !ents.corIds.length) return listarProdutos();
    if (has(n, /\b(quanto|preco|valor|custa|custo|sai|saem|fica)\b/) && !(est.pend === "qtd")) {
      if (est.pend === "confirma" && !ents.produtoIds.length) return confirmar();
      return falarPreco(ents.produtoIds.length ? ents.produtoIds : (est.produtoId ? [est.produtoId] : []));
    }

    /* preenche e avança o orçamento */
    const quer = has(n, /\b(orcamento|quero|queria|gostaria|comprar|encomendar|pedido|preciso|adicionar|fazer)\b/);
    const emFluxo = est.pend && est.pend !== "mais";
    if (algumaEntidade || emFluxo || ents.generico || quer) {
      if (ents.produtoIds.length === 1) { est.produtoId = ents.produtoIds[0]; est.cand = null; }
      else if (ents.produtoIds.length > 1) { est.cand = ents.produtoIds; est.produtoId = null; }
      if (ents.corIds.length) { est.corId = ents.corIds[0]; est.corAmb = null; } else if (ents.corAmb) { est.corAmb = ents.corAmb; est.corId = null; }
      if (ents.tamId) est.tamId = ents.tamId;
      if (ents.qtd) est.qtd = ents.qtd;
      /* número "solto" só vale como quantidade quando é a resposta certa */
      if (ents.qtd && est.pend !== "qtd" && !ents.produtoIds.length && !est.produtoId && !quer) est.qtd = null;
      if (est.pend === "confirma" && !algumaEntidade) { /* nada novo: reapresenta */ return confirmar(); }
      /* dúvida dentro do fluxo (ex.: "e o prazo?") */
      const f = achaFaq(n);
      if (f && !algumaEntidade) { bot({ texto: f.resposta }); return setTimeout(avancar, reduzMov() ? 0 : 700); }
      if (est.pend === "cor" && !ents.corIds.length && !ents.corAmb && !ents.produtoIds.length) return bot({ texto: "Não reconheci essa cor. Toque em uma das opções:", cores: MI.coresAtivas(), chips: MI.coresAtivas().slice(0, 8).map((c) => c.nome) });
      return avancar();
    }

    const f = achaFaq(n);
    if (f) return bot({ texto: f.resposta, chips: ["Fazer um orçamento", "Ver produtos", "Falar com a equipe"] });
    if (has(n, /\b(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|eai)\b/)) return saudar();
    if (has(n, /^(falar com a equipe|equipe)$/)) return humano();
    if (has(n, /\bduvida\b/)) return bot({ texto: "Pode perguntar! Sei sobre prazo, entrega, pagamento, tamanhos, cores e sob medida.", chips: ["Prazo e entrega", "Formas de pagamento", "Sob medida"] });
    naoSei(t);
  }

  /* =================================================================
     MODO IA GENERATIVA (opcional)
     ================================================================= */
  async function responderLLM(t) {
    hist.push({ role: "user", content: t });
    log.insertAdjacentHTML("beforeend", `<div class="msg msg--b typing" aria-hidden="true"><p><span></span><span></span><span></span></p></div>`); rolar();
    try {
      const r = await fetch(D().llm.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system: MI.promptLLM(), messages: hist.slice(-20) }) });
      if (!r.ok) throw new Error("http " + r.status);
      const j = await r.json();
      let texto = String(j.texto || j.text || "").trim();
      const m = texto.match(/<orcamento>([\s\S]*?)<\/orcamento>/);
      texto = texto.replace(/<orcamento>[\s\S]*?<\/orcamento>/, "").trim();
      hist.push({ role: "assistant", content: texto });
      $(".typing", log)?.remove();
      if (texto) bot({ texto });
      if (m) {
        let itens = [];
        try { itens = JSON.parse(m[1]); } catch (e) {}
        const validos = (Array.isArray(itens) ? itens : []).map((i) => ({ produtoId: i.produto, corId: i.cor, tamId: i.tamanho, qtd: Math.round(+i.qtd) }))
          .filter((i) => MI.prod(i.produtoId)?.ativo && MI.cor(i.corId)?.ativo && MI.tam(i.tamId) && i.qtd >= 1 && i.qtd <= 99);
        validos.forEach((i) => MI.cart.add(i));
        if (validos.length) setTimeout(finalizar, reduzMov() ? 0 : 500);
      }
    } catch (e) {
      $(".typing", log)?.remove();
      bot({ texto: "Tive um problema para falar com a IA agora. Vou continuar no modo simples." });
      setTimeout(() => responderRegras(t), 400);
    }
  }

  /* ---------- envio ---------- */
  function enviar(t) {
    t = String(t).trim(); if (!t) return;
    usuario(t); chipsDe([]); input.value = "";
    const llm = D().llm;
    if (llm.ativo && llm.endpoint) responderLLM(t); else responderRegras(t);
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); enviar(input.value); });

  /* permite que outras partes do site (e a página de treinamento) reiniciem a conversa */
  MI.assistente = { abrir, reiniciar() { est = novo(); iniciou = false; hist = []; log.innerHTML = ""; chipsDe([]); cabecalho(); } };
})();