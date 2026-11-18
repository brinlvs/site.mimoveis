/* =====================================================================
   MI. MÓVEIS — main.js
   Módulos (cada um só roda se encontrar seus elementos na página):
   1. Utilitários           5. Catálogo (busca + abas)
   2. Preferências / tema   6. Cartões explicativos (acordeão)
   3. Painel de a11y        7. Carrossel
   4. Navegação             8. Formulários (contato e login)
   ===================================================================== */
(() => {
  "use strict";

  /* ---------- 1. UTILITÁRIOS ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const root = document.documentElement;

  const makeStore = (area) => ({
    get(key, fallback) {
      try { const v = area.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) { try { area.setItem(key, JSON.stringify(value)); } catch (e) { /* modo privado */ } },
    remove(key) { try { area.removeItem(key); } catch (e) {} },
  });
  const local = makeStore(window.localStorage);
  const session = makeStore(window.sessionStorage);

  /* remove acentos e põe em minúsculas: "Cômoda" → "comoda" (busca amigável) */
  const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const ICON = (id, cls = "") => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  /* ---------- 2. PREFERÊNCIAS E TEMA ---------- */
  const SIZES = [100, 112.5, 125, 150];
  const DEFAULTS = { theme: "auto", size: 0, legible: false, spacing: false, links: false, motion: false };
  const prefs = { ...DEFAULTS, ...local.get("mi-prefs", {}) };
  const THEME_NAMES = { auto: "automático", light: "claro", dark: "escuro", contrast: "alto contraste" };

  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const resolveTheme = (t) => (t === "auto" ? (systemDark.matches ? "dark" : "light") : t);
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches || root.getAttribute("data-motion") === "reduce";

  function setFlag(attr, on, value) {
    if (on) root.setAttribute(attr, value); else root.removeAttribute(attr);
  }

  function applyPrefs() {
    const theme = resolveTheme(prefs.theme);
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-size", String(prefs.size));
    setFlag("data-legible", prefs.legible, "true");
    setFlag("data-spacing", prefs.spacing, "true");
    setFlag("data-links", prefs.links, "true");
    setFlag("data-motion", prefs.motion, "reduce");

    /* o rótulo do botão de tema descreve a AÇÃO (o que vai acontecer ao clicar) */
    $$("[data-action='toggle-theme']").forEach((btn) => {
      const next = theme === "dark" || theme === "contrast" ? "claro" : "escuro";
      btn.setAttribute("aria-label", `Ativar modo ${next}`);
      btn.title = `Ativar modo ${next}`;
    });
    const meta = $("meta[name='theme-color']");
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim() || "#FFF8EF");
    document.dispatchEvent(new CustomEvent("prefs:change"));
  }

  function setPref(key, value, message) {
    prefs[key] = value;
    local.set("mi-prefs", prefs);
    applyPrefs();
    syncDialog();
    announce(message);
  }

  systemDark.addEventListener("change", () => { if (prefs.theme === "auto") applyPrefs(); });

  $$("[data-action='toggle-theme']").forEach((btn) =>
    btn.addEventListener("click", () => {
      const isDark = ["dark", "contrast"].includes(root.getAttribute("data-theme"));
      setPref("theme", isDark ? "light" : "dark");
    })
  );

  /* ---------- 3. PAINEL DE ACESSIBILIDADE ---------- */
  const dialogHTML = `
  <dialog id="a11y-dialog" class="a11y-dialog" aria-labelledby="a11y-title">
    <div class="a11y-head">
      <h2 id="a11y-title">Acessibilidade</h2>
      <button type="button" class="icon-btn" data-close aria-label="Fechar painel de acessibilidade">${ICON("x")}</button>
    </div>
    <div class="a11y-body">
      <fieldset>
        <legend>Tema de cores</legend>
        <div class="seg">
          <label><input type="radio" name="theme" value="auto"> Automático</label>
          <label><input type="radio" name="theme" value="light"> Claro</label>
          <label><input type="radio" name="theme" value="dark"> Escuro</label>
          <label><input type="radio" name="theme" value="contrast"> Alto contraste</label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Tamanho do texto</legend>
        <div class="size-row">
          <button type="button" class="btn btn--ghost btn--sm" data-size="down">A− <span class="sr-only">Diminuir texto</span></button>
          <span class="size-out" id="size-out">100%</span>
          <button type="button" class="btn btn--ghost btn--sm" data-size="up">A+ <span class="sr-only">Aumentar texto</span></button>
        </div>
      </fieldset>

      <fieldset>
        <legend>Leitura e navegação</legend>
        <label class="switch"><span>Fonte mais legível<small>Troca a fonte por uma desenhada para facilitar a leitura.</small></span><input type="checkbox" data-pref="legible"></label>
        <label class="switch"><span>Mais espaço entre letras e linhas<small>Ajuda a acompanhar o texto com mais conforto.</small></span><input type="checkbox" data-pref="spacing"></label>
        <label class="switch"><span>Destacar links<small>Sublinha e realça todos os links da página.</small></span><input type="checkbox" data-pref="links"></label>
        <label class="switch"><span>Reduzir animações<small>Para o carrossel automático e os movimentos da página.</small></span><input type="checkbox" data-pref="motion"></label>
      </fieldset>

      <button type="button" class="btn btn--ghost btn--block" data-reset>Restaurar configurações padrão</button>
      <p class="a11y-status" id="a11y-status" role="status"></p>
    </div>
  </dialog>`;
  document.body.insertAdjacentHTML("beforeend", dialogHTML);

  const dialog = $("#a11y-dialog");
  const statusEl = $("#a11y-status");
  const sizeOut = $("#size-out");
  const btnDown = $("[data-size='down']", dialog);
  const btnUp = $("[data-size='up']", dialog);

  function announce(message) { if (message) statusEl.textContent = message; }

  function syncDialog() {
    $$("input[name='theme']", dialog).forEach((r) => (r.checked = r.value === prefs.theme));
    $$("[data-pref]", dialog).forEach((c) => (c.checked = !!prefs[c.dataset.pref]));
    sizeOut.textContent = `${SIZES[prefs.size]}%`.replace(".5", ",5");
    btnDown.setAttribute("aria-disabled", String(prefs.size === 0));
    btnUp.setAttribute("aria-disabled", String(prefs.size === SIZES.length - 1));
  }

  $$("[data-action='open-a11y']").forEach((b) => b.addEventListener("click", () => dialog.showModal()));
  $("[data-close]", dialog).addEventListener("click", () => dialog.close());
  /* clicar no fundo escurecido fecha o painel */
  dialog.addEventListener("click", (e) => {
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });

  $$("input[name='theme']", dialog).forEach((r) =>
    r.addEventListener("change", () => setPref("theme", r.value, `Tema ${THEME_NAMES[r.value]} ativado.`)));
  $$("[data-pref]", dialog).forEach((c) =>
    c.addEventListener("change", () => setPref(c.dataset.pref, c.checked, c.checked ? "Opção ativada." : "Opção desativada.")));
  btnDown.addEventListener("click", () => { if (prefs.size > 0) setPref("size", prefs.size - 1, `Texto em ${SIZES[prefs.size - 1]}%.`); });
  btnUp.addEventListener("click", () => { if (prefs.size < SIZES.length - 1) setPref("size", prefs.size + 1, `Texto em ${SIZES[prefs.size + 1]}%.`); });
  $("[data-reset]", dialog).addEventListener("click", () => {
    Object.assign(prefs, DEFAULTS);
    local.set("mi-prefs", prefs);
    applyPrefs(); syncDialog(); announce("Configurações restauradas ao padrão.");
  });

  applyPrefs();
  syncDialog();

  /* ---------- 4. NAVEGAÇÃO ---------- */
  const nav = $("#site-nav");
  const navToggle = $("[data-action='toggle-nav']");
  if (nav && navToggle) {
    const setNav = (open) => {
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    };
    navToggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); navToggle.focus(); }
    });
  }

  /* marca no menu a seção que está na tela */
  const navLinks = $$("#site-nav a[href^='#']");
  if (navLinks.length && "IntersectionObserver" in window) {
    const map = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && map.has(en.target.id)) {
          navLinks.forEach((a) => a.removeAttribute("aria-current"));
          map.get(en.target.id).setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* botão "voltar ao topo" */
  const toTop = $(".to-top");
  if (toTop) {
    window.addEventListener("scroll", () => toTop.classList.toggle("is-visible", window.scrollY > 700), { passive: true });
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" }));
  }

  const year = $("#ano");
  if (year) year.textContent = new Date().getFullYear();

  /* login "de demonstração": mostra Sair + saudação quando há sessão */
  const loginLink = $("#login-link");
  const user = session.get("mi-user", null);
  if (loginLink && user) {
    loginLink.querySelector("span").textContent = "Sair";
    loginLink.setAttribute("href", "#");
    loginLink.setAttribute("aria-label", `Sair da conta de ${user.email}`);
    loginLink.addEventListener("click", (e) => { e.preventDefault(); session.remove("mi-user"); location.reload(); });
    if ($("#inicio")) {
      const bar = document.createElement("p");
      bar.className = "welcome";
      bar.setAttribute("role", "status");
      bar.textContent = `Olá, ${user.email.split("@")[0]}! Você entrou na área do cliente (modo demonstração).`;
      $(".site-header").after(bar);
    }
  }

  /* ---------- 5. CATÁLOGO: BUSCA + ABAS ---------- */
  const catalog = $("#catalogo");
  if (catalog) {
    const tabs = $$("[role='tab']", catalog);
    const panel = $("#catalogo-painel");
    const cards = $$(".product", panel);
    const input = $("#busca");
    const status = $("#resultados");
    const empty = $("#vazio");
    let category = "todos";

    function render() {
      const terms = norm(input.value).split(/\s+/).filter(Boolean);
      let shown = 0;
      cards.forEach((card) => {
        const haystack = norm(card.dataset.busca);
        const okCat = category === "todos" || card.dataset.category === category;
        const okText = terms.every((t) => haystack.includes(t));
        card.hidden = !(okCat && okText);
        if (!card.hidden) shown++;
      });
      const active = tabs.find((t) => t.getAttribute("aria-selected") === "true");
      panel.setAttribute("aria-labelledby", active.id);
      empty.hidden = shown !== 0;
      status.textContent = shown === 0
        ? "Nenhum produto encontrado."
        : `${shown} ${shown === 1 ? "produto encontrado" : "produtos encontrados"}` +
          (category !== "todos" ? ` em ${active.textContent.trim()}` : "") +
          (input.value.trim() ? ` para “${input.value.trim()}”` : "") + ".";
    }

    function selectTab(tab, focus = false) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      category = tab.dataset.category;
      if (focus) tab.focus();
      render();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => selectTab(tab));
      /* navegação por teclado no padrão ARIA: setas, Home e End */
      tab.addEventListener("keydown", (e) => {
        const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        selectTab(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
      });
    });

    input.addEventListener("input", render);
    $("#limpar-filtros").addEventListener("click", () => {
      input.value = "";
      selectTab(tabs[0]);
      input.focus();
    });

    /* "Pedir orçamento" leva o produto escolhido para o formulário de contato */
    $$("[data-produto]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const subject = $("#assunto"), msg = $("#mensagem");
        if (subject) subject.value = "orcamento";
        if (msg && !msg.value.trim()) {
          msg.value = `Olá! Tenho interesse neste produto: ${btn.dataset.produto}. Gostaria de receber um orçamento.`;
          msg.dispatchEvent(new Event("input"));
        }
      })
    );
    render();
  }

  /* ---------- 6. CARTÕES EXPLICATIVOS (ACORDEÃO) ---------- */
  $$(".explain__btn").forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });

  /* ---------- 7. CARROSSEL ---------- */
  const carousel = $("#carrossel");
  if (carousel) {
    const track = $(".carousel__track", carousel);
    const slides = $$(".carousel__slide", carousel);
    const dotsWrap = $(".dots", carousel);
    const prev = $("[data-car='prev']", carousel);
    const next = $("[data-car='next']", carousel);
    const toggle = $("[data-car='toggle']", carousel);
    let index = 0, playing = !reducedMotion(), timer = null;

    const dots = slides.map((_, k) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "dot";
      b.setAttribute("aria-label", `Ir para o slide ${k + 1} de ${slides.length}`);
      b.innerHTML = "<span></span>";
      b.addEventListener("click", () => go(k));
      dotsWrap.appendChild(b);
      return b;
    });

    function go(n) {
      index = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, k) => {
        s.setAttribute("aria-hidden", String(k !== index));
        s.toggleAttribute("inert", k !== index);   /* slides invisíveis não recebem foco */
      });
      dots.forEach((d, k) => d.setAttribute("aria-current", String(k === index)));
    }

    function schedule() {
      clearInterval(timer);
      const motionOff = reducedMotion();
      toggle.hidden = motionOff;
      if (playing && !motionOff) timer = setInterval(() => go(index + 1), 6000);
      /* APG: com rotação automática, aria-live="off"; parado, "polite" */
      track.setAttribute("aria-live", playing && !motionOff ? "off" : "polite");
      toggle.setAttribute("aria-label", playing ? "Pausar a troca automática de imagens" : "Iniciar a troca automática de imagens");
      /* <svg> não tem a propriedade .hidden (só elementos HTML), por isso usamos o atributo */
      $(".icon-pause", toggle).toggleAttribute("hidden", !playing);
      $(".icon-play", toggle).toggleAttribute("hidden", playing);
    }

    prev.addEventListener("click", () => go(index - 1));
    next.addEventListener("click", () => go(index + 1));
    toggle.addEventListener("click", () => { playing = !playing; schedule(); });

    /* pausa enquanto o mouse ou o foco estão no carrossel (WCAG 2.2.2) */
    const pause = () => clearInterval(timer);
    carousel.addEventListener("mouseenter", pause);
    carousel.addEventListener("focusin", pause);
    carousel.addEventListener("mouseleave", schedule);
    carousel.addEventListener("focusout", schedule);

    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    });

    /* gesto de arrastar no celular */
    let startX = null;
    track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; pause(); }, { passive: true });
    track.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      startX = null; schedule();
    });

    document.addEventListener("prefs:change", () => { if (reducedMotion()) playing = false; schedule(); });
    go(0);
    schedule();
  }

  /* ---------- 8. FORMULÁRIOS ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const validators = {
    nome: (v) => (!v.trim() ? "Informe seu nome." : v.trim().length < 3 ? "O nome precisa ter pelo menos 3 letras." : ""),
    email: (v) => (!v.trim() ? "Informe seu e-mail." : !EMAIL_RE.test(v.trim()) ? "Digite um e-mail válido, como nome@exemplo.com." : ""),
    telefone: (v) => {
      if (!v.trim()) return "";                       /* campo opcional */
      const d = v.replace(/\D/g, "");
      return d.length < 10 || d.length > 11 ? "Digite o telefone com DDD, por exemplo (61) 99999-9999." : "";
    },
    assunto: (v) => (!v ? "Escolha um assunto." : ""),
    mensagem: (v) => (!v.trim() ? "Escreva sua mensagem." : v.trim().length < 10 ? "Conte um pouco mais (mínimo de 10 caracteres)." : ""),
    consentimento: (_, el) => (el.checked ? "" : "Para enviar, é preciso concordar com o uso dos dados."),
    senha: (v) => (!v ? "Informe sua senha." : v.length < 6 ? "A senha precisa ter pelo menos 6 caracteres." : ""),
  };

  function setupForm(form, onValid) {
    const fields = $$("[name]", form).filter((el) => validators[el.name]);
    const summary = $(".form-summary", form);

    /* cria a mensagem de erro de cada campo e liga ao input via aria-describedby */
    fields.forEach((el) => {
      const err = document.createElement("p");
      err.className = "field__error";
      err.id = `${el.id}-erro`;
      err.hidden = true;
      err.innerHTML = `${ICON("alert")}<span></span>`;
      el.closest(".field").appendChild(err);
      el.dataset.base = el.getAttribute("aria-describedby") || "";
    });

    function check(el) {
      const msg = validators[el.name](el.value, el);
      const err = document.getElementById(`${el.id}-erro`);
      err.hidden = !msg;
      $("span", err).textContent = msg;
      el.toggleAttribute("aria-invalid", !!msg);
      if (msg) el.setAttribute("aria-invalid", "true");
      el.setAttribute("aria-describedby", [el.dataset.base, msg ? err.id : ""].filter(Boolean).join(" "));
      return msg;
    }

    fields.forEach((el) => {
      el.addEventListener("blur", () => { if (el.value || el.dataset.touched) check(el); el.dataset.touched = "1"; });
      const ev = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(ev, () => { if (el.hasAttribute("aria-invalid")) check(el); });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const errors = fields.map((el) => ({ el, msg: check(el) })).filter((x) => x.msg);
      if (errors.length) {
        summary.innerHTML = `<h3>Corrija ${errors.length === 1 ? "1 campo" : errors.length + " campos"} para continuar</h3><ul>` +
          errors.map((x) => `<li><a href="#${x.el.id}">${x.msg}</a></li>`).join("") + "</ul>";
        summary.hidden = false;
        summary.focus();
        $$("a", summary).forEach((a) => a.addEventListener("click", (ev) => {
          ev.preventDefault(); document.getElementById(a.getAttribute("href").slice(1)).focus();
        }));
        return;
      }
      summary.hidden = true;
      onValid();
    });

    form.addEventListener("reset", () => {
      setTimeout(() => fields.forEach((el) => { el.removeAttribute("aria-invalid"); document.getElementById(`${el.id}-erro`).hidden = true; }));
    });
  }

  /* ----- formulário de contato ----- */
  const contactForm = $("#form-contato");
  if (contactForm) {
    const success = $("#contato-sucesso");
    const message = $("#mensagem");
    const counter = $("#contador");

    /* máscara de telefone: (61) 99999-9999 */
    $("#telefone").addEventListener("input", (e) => {
      const d = e.target.value.replace(/\D/g, "").slice(0, 11);
      e.target.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        : d.length > 6 ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
        : d.length > 2 ? d.replace(/(\d{2})(\d{0,5})/, "($1) $2") : d;
    });
    message.addEventListener("input", () => { counter.textContent = `${message.value.length} de ${message.maxLength} caracteres`; });

    setupForm(contactForm, async () => {
      const btn = $("button[type='submit']", contactForm);
      const data = Object.fromEntries(new FormData(contactForm));
      btn.disabled = true;
      try {
        /* Para receber mensagens de verdade, coloque o endereço do seu serviço
           (ex.: Formspree) em data-endpoint no <form>. Sem ele, o site roda em modo demonstração. */
        const endpoint = contactForm.dataset.endpoint;
        if (endpoint) {
          const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error("Falha no envio");
        }
        $("#sucesso-nome").textContent = data.nome.trim().split(" ")[0];
        contactForm.hidden = true;
        success.hidden = false;
        $("h3", success).focus();
      } catch (err) {
        const summary = $(".form-summary", contactForm);
        summary.innerHTML = "<h3>Não foi possível enviar agora</h3><p>Verifique sua conexão e tente novamente.</p>";
        summary.hidden = false; summary.focus();
      } finally { btn.disabled = false; }
    });

    $("#novo-contato").addEventListener("click", () => {
      contactForm.reset(); counter.textContent = "";
      success.hidden = true; contactForm.hidden = false;
      $("#nome").focus();
    });
  }

  /* ----- login (demonstração: não existe servidor) ----- */
  const loginForm = $("#form-login");
  if (loginForm) {
    const pw = $("#senha");
    const pwBtn = $(".pw-toggle", loginForm);
    const saved = local.get("mi-lembrar", "");
    if (saved) { $("#email").value = saved; $("#lembrar").checked = true; }

    pwBtn.addEventListener("click", () => {
      const show = pw.type === "password";
      pw.type = show ? "text" : "password";
      pwBtn.setAttribute("aria-pressed", String(show));   /* o rótulo fica fixo; só o estado muda */
    });

    $("#esqueci").addEventListener("click", (e) => {
      e.preventDefault();
      const out = $("#login-status");
      out.hidden = false;
      out.textContent = "Demonstração: em um site real, enviaríamos um e-mail com o link para criar uma nova senha.";
    });

    setupForm(loginForm, () => {
      const email = $("#email").value.trim();
      /* nunca guardamos a senha. Só o e-mail, e só se a pessoa marcar "Lembrar". */
      if ($("#lembrar").checked) local.set("mi-lembrar", email); else local.remove("mi-lembrar");
      session.set("mi-user", { email });
      const out = $("#login-status");
      out.hidden = false;
      out.textContent = "Login realizado! Levando você para o site…";
      setTimeout(() => { location.href = "index.html"; }, reducedMotion() ? 600 : 1400);
    });
  }
})();