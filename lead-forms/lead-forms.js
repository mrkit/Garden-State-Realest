/* =========================================================
   Garden State Real Estate — lead capture forms
   Self-contained: builds the forms, opens them in a pop-up,
   and wires up the links that already exist on the page.
   Mailing follows the same rules as exitconnect.me.

   Install (two lines in index.html):
     <link rel="stylesheet" href="lead-forms/lead-forms.css" />
     <script src="lead-forms/lead-forms.js" defer></script>

   data-preview: when present on the script tag, nothing is sent.
   The page shows the lead email and the auto-reply that WOULD go
   out, for review.

   FormSubmit needs ONE activation: submit once for real and click
   "Activate Form" in the email FormSubmit sends. Then swap
   LEAD_EMAIL for FormSubmit's random alias so the real inbox is
   not visible to scrapers.
   ========================================================= */

(() => {
  const script = document.currentScript;
  const LEAD_EMAIL = "mari.mfrag@gmail.com";
  const PREVIEW = script?.hasAttribute("data-preview");
  const SITE = "GSRE";

  /* Auto-reply sent to the lead by FormSubmit. Wording approved by
     Maria 2026-09-30. Any change to it needs her approval again
     before it goes out. */
  const AUTOREPLY_ON = true;
  const autoreply = (first) =>
    `Hi ${first},\n\nThank you for reaching out to Garden State Real Estate. We’ve received your message and will be in touch soon.\n\n` +
    "Garden State Real Estate\n(908) 767-9338";

  const PHONE = "(908) 767-9338";
  const CONSENT =
    "By submitting, you agree to be contacted by phone, text or email about your request. Reply STOP to opt out of texts.";

  /* ---------- Shared option lists ---------- */

  const TIMELINE = [
    "As soon as possible",
    "1 to 3 months",
    "3 to 6 months",
    "6 to 12 months",
    "Just exploring",
  ];

  const CONTACT_FIELDS = [
    { name: "name", label: "Name", type: "text", required: true, autocomplete: "name" },
    { row: [
      { name: "email", label: "Email", type: "email", required: true, autocomplete: "email" },
      { name: "phone", label: "Phone", type: "tel", autocomplete: "tel" },
    ] },
    { name: "Best way to reach you", label: "Best way to reach you", type: "radio", options: ["Email", "Phone", "Text"], value: "Email" },
  ];

  const NOTES = { name: "message", label: "Anything else we should know?", type: "textarea" };

  /* ---------- Form definitions ---------- */
  /* Field names are what shows in the lead email (FormSubmit's
     table template), so most are written as readable labels. */

  const FORMS = {
    sell: {
      type: "Sell",
      eyebrow: "For Sellers",
      title: "Thinking about selling?",
      intro: "Tell us a little about your property and we’ll be in touch at your convenience to talk through your options.",
      fields: [
        { name: "Property address", label: "Property address", type: "text", autocomplete: "street-address" },
        { row: [
          { name: "Property type", label: "Property type", type: "select", options: ["Single-family home", "Historic home", "Farm or estate", "Multi-family", "Land", "Commercial"] },
          { name: "Timeline", label: "Timing", type: "select", options: TIMELINE },
        ] },
        ...CONTACT_FIELDS,
        NOTES,
      ],
    },

    buy: {
      type: "Buy",
      eyebrow: "For Buyers",
      title: "Looking for a home in Northwest New Jersey?",
      intro: "Share what you have in mind and we’ll be in touch at your convenience.",
      fields: [
        { name: "Counties", label: "Where are you looking?", type: "checkboxes", options: ["Warren County", "Sussex County", "Morris County", "Not sure yet"] },
        { row: [
          { name: "Property type", label: "Property type", type: "select", options: ["Single-family home", "Historic home", "Farm or acreage", "Land", "Multi-family", "Commercial"] },
          { name: "Price range", label: "Price range", type: "select", options: ["Under $400k", "$400k to $600k", "$600k to $850k", "$850k to $1.2M", "$1.2M+"] },
        ] },
        { row: [
          { name: "Timeline", label: "Timing", type: "select", options: TIMELINE },
          { name: "Moving from", label: "Where are you moving from?", type: "select", options: ["New York City", "Elsewhere in New Jersey", "Somewhere else"] },
        ] },
        ...CONTACT_FIELDS,
        NOTES,
      ],
    },

    build: {
      type: "Build",
      eyebrow: "For Developers",
      title: "Have a project in mind?",
      intro: "Tell us a little about it and we’ll be in touch at your convenience.",
      fields: [
        { row: [
          { name: "Project type", label: "Project type", type: "select", options: ["New construction", "Land development", "Commercial", "Other"] },
          { name: "Project stage", label: "Where are you in the process?", type: "select", options: ["Looking for land", "Have land, need approvals", "Approved and ready to build", "Have a project to sell", "Other"] },
        ] },
        { row: [
          { name: "Location or parcel", label: "Location or parcel", type: "text", placeholder: "Town, street or block and lot" },
          { name: "Acreage", label: "Approximate acreage", type: "text", inputmode: "decimal" },
        ] },
        { name: "Timeline", label: "Timing", type: "select", options: TIMELINE },
        ...CONTACT_FIELDS,
        NOTES,
      ],
    },

    contact: {
      type: "Inquiry",
      eyebrow: "Inquire",
      title: "Start a conversation",
      intro: "Tell us a little about what you have in mind and we’ll be in touch at your convenience.",
      fields: [
        ...CONTACT_FIELDS.slice(0, 2),
        { name: "Interested in", label: "I’m interested in", type: "select", options: ["Buying", "Selling", "Development", "Something else"] },
        { name: "message", label: "Message", type: "textarea" },
      ],
    },
  };

  /* Existing links on the page and the form each one opens.
     The optional object pre-fills fields. */
  const ROUTES = {
    "#sellers": ["sell"],
    "#buyers": ["buy"],
    "#developers": ["build"],
    "#warren": ["buy", { Counties: "Warren County" }],
    "#sussex": ["buy", { Counties: "Sussex County" }],
    "#morris": ["buy", { Counties: "Morris County" }],
    "#new-construction": ["build", { "Project type": "New construction" }],
    "#land-development": ["build", { "Project type": "Land development" }],
    "#commercial": ["build", { "Project type": "Commercial" }],
  };

  /* ---------- Lead source (ads, QR codes, social) ---------- */
  /* First touch is kept for the visit, same as exitconnect.me. */

  const store = (key, value) => {
    try {
      if (value === undefined) return sessionStorage.getItem(key);
      sessionStorage.setItem(key, value);
    } catch {
      return null;
    }
  };

  const query = new URLSearchParams(location.search);
  let SOURCE = null;
  try {
    SOURCE = JSON.parse(store("gsre_src") || "null");
  } catch {}
  const fresh = {
    "Ad source": query.get("utm_source"),
    "Ad medium": query.get("utm_medium"),
    "Ad campaign": query.get("utm_campaign"),
    "Ad content": query.get("utm_content"),
    "Ad keyword": query.get("utm_term"),
    "Click ID": query.get("gclid") || query.get("fbclid") || query.get("msclkid"),
  };
  if (!SOURCE || Object.values(fresh).some(Boolean)) {
    SOURCE = { ...fresh, Referrer: document.referrer || "Direct", "Landing page": location.href.split("#")[0] };
    store("gsre_src", JSON.stringify(SOURCE));
  }

  /* ---------- Building ---------- */

  let uid = 0;

  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      if (val === undefined || val === false) continue;
      if (key === "class") node.className = val;
      else if (key === "text") node.textContent = val;
      else node.setAttribute(key, val === true ? "" : val);
    }
    node.append(...children.filter(Boolean));
    return node;
  };

  const labelText = (f) =>
    el("span", { class: "lf-label" }, f.label, f.required ? el("span", { class: "lf-req", "aria-hidden": "true", text: " *" }) : null);

  function buildField(f) {
    if (f.row) return el("div", { class: "lf-row" }, ...f.row.map(buildField));

    const id = `lf-${++uid}`;

    if (f.type === "radio" || f.type === "checkboxes") {
      const inputType = f.type === "radio" ? "radio" : "checkbox";
      return el(
        "fieldset",
        { class: "lf-field lf-choices" },
        el("legend", {}, labelText(f)),
        el(
          "div",
          { class: "lf-choices__list" },
          ...f.options.map((opt) =>
            el(
              "label",
              { class: "lf-choice" },
              el("input", { type: inputType, name: f.name, value: opt, checked: f.value === opt }),
              el("span", { text: opt }),
            ),
          ),
        ),
      );
    }

    let control;
    if (f.type === "select") {
      control = el(
        "select",
        { id, name: f.name, required: f.required },
        el("option", { value: "", text: "Select one" }),
        ...f.options.map((opt) => el("option", { value: opt, text: opt })),
      );
    } else if (f.type === "textarea") {
      control = el("textarea", { id, name: f.name, rows: 4 });
    } else {
      control = el("input", {
        id,
        name: f.name,
        type: f.type,
        required: f.required,
        autocomplete: f.autocomplete,
        placeholder: f.placeholder,
        inputmode: f.inputmode,
      });
    }

    return el("div", { class: "lf-field" }, el("label", { for: id }, labelText(f)), control);
  }

  function buildForm(key) {
    const def = FORMS[key];
    const headingId = `lf-title-${++uid}`;

    const form = el(
      "form",
      { class: `lf-form lf-form--${key}`, "aria-labelledby": headingId, "data-form": key, novalidate: true },
      // Honeypot: hidden from people, bots tend to fill it in.
      el("input", { type: "text", name: "_honey", class: "lf-hp", tabindex: "-1", autocomplete: "off", "aria-hidden": "true" }),
      el("p", { class: "lf-eyebrow", text: def.eyebrow }),
      el("h2", { class: "lf-title", id: headingId, text: def.title }),
      el("p", { class: "lf-intro", text: def.intro }),
      ...def.fields.map(buildField),
      el("p", { class: "lf-consent", text: CONSENT }),
      el("p", { class: "lf-note", role: "status", hidden: true }),
      el("button", { type: "submit", class: "lf-submit", text: "Send" }),
    );

    form.addEventListener("submit", onSubmit);
    return form;
  }

  function prefill(form, values = {}) {
    for (const [name, value] of Object.entries(values)) {
      const fields = form.querySelectorAll(`[name="${name}"]`);
      fields.forEach((field) => {
        if (field.type === "checkbox" || field.type === "radio") field.checked = field.value === value;
        else field.value = value;
      });
    }
  }

  /* ---------- Submitting ---------- */

  function collect(form, def) {
    const data = {};
    for (const [key, value] of new FormData(form)) {
      const v = String(value).trim();
      if (!v) continue;
      data[key] = data[key] ? `${data[key]}, ${v}` : v; // checkbox groups
    }
    data._subject = `${SITE} - ${def.type} - ${data.name}`;
    data["Lead type"] = def.type;
    data["Form"] = def.eyebrow;
    data["Page"] = location.href.split("?")[0];
    for (const [k, v] of Object.entries(SOURCE)) if (v) data[k] = v;
    data._template = "table";
    data._captcha = "false";
    if (AUTOREPLY_ON) data._autoresponse = autoreply(data.name.split(" ")[0]);
    return data;
  }

  function fieldLabel(form, field) {
    const label = form.querySelector(`label[for="${field.id}"] .lf-label`);
    return (label?.firstChild?.textContent || field.name).toLowerCase();
  }

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const def = FORMS[form.dataset.form];
    const note = form.querySelector(".lf-note");
    const button = form.querySelector(".lf-submit");
    const say = (text, isError = false) => {
      note.textContent = text;
      note.classList.toggle("lf-note--error", isError);
      note.hidden = false;
    };

    const missing = [...form.querySelectorAll("[required]")].filter((f) => !f.value.trim());
    if (missing.length) {
      say(`Please add your ${missing.map((f) => fieldLabel(form, f)).join(" and ")}.`, true);
      missing[0].focus();
      return;
    }
    const email = form.querySelector("input[type=email]");
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
      say("Please enter a full email address, like name@example.com.", true);
      email.focus();
      return;
    }

    // Bot filled the honeypot: send nothing.
    if (form.elements._honey.value) return;

    const data = collect(form, def);
    delete data._honey;
    button.disabled = true;
    say("Sending…");

    try {
      if (!PREVIEW) {
        const res = await fetch(`https://formsubmit.co/ajax/${LEAD_EMAIL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || String(json.success) === "false") throw new Error(json.message || "failed");
      }
      store("gsre_done", "1");
      showThanks(form, data);
    } catch (err) {
      console.error("[lead-forms]", err);
      say(`Sorry, that didn’t go through. Please call us at ${PHONE}.`, true);
      button.disabled = false;
    }
  }

  function showThanks(form, data) {
    const first = data.name?.split(" ")[0];
    const thanks = el(
      "div",
      { class: "lf-thanks", role: "status", tabindex: "-1" },
      el("p", { class: "lf-eyebrow", text: "Received" }),
      el("h2", { class: "lf-title", text: first ? `Thank you, ${first}.` : "Thank you." }),
      el("p", { class: "lf-intro", text: "We’ve received your message and will be in touch soon." }),
      PREVIEW ? previewPanel(data) : null,
    );
    if (form.closest(".lf-dialog")) {
      thanks.append(el("button", { type: "button", class: "lf-submit", "data-lf-close": true, text: "Close" }));
    }
    form.replaceWith(thanks);
    thanks.focus();
  }

  /* Preview only: shows the lead email and auto-reply that would go out. */
  function previewPanel(data) {
    const rows = Object.entries(data).filter(([k]) => !k.startsWith("_"));
    const first = data.name?.split(" ")[0] || "there";
    return el(
      "div",
      { class: "lf-preview" },
      el("p", { class: "lf-preview__tag", text: "Preview only — nothing was sent" }),
      el("h3", { text: "Email you would receive" }),
      el("p", {}, el("b", { text: "To: " }), LEAD_EMAIL),
      el("p", {}, el("b", { text: "Subject: " }), data._subject),
      el("table", {}, ...rows.map(([k, v]) => el("tr", {}, el("th", { text: k }), el("td", { text: v })))),
      el("h3", { text: `Auto-reply to ${data.email} (${AUTOREPLY_ON ? "on" : "off until you approve it"})` }),
      el("pre", { text: autoreply(first) }),
    );
  }

  /* ---------- Pop-up ---------- */

  let dialog;

  function getDialog() {
    if (dialog) return dialog;
    dialog = el(
      "dialog",
      { class: "lf-dialog" },
      el(
        "div",
        { class: "lf-dialog__inner" },
        el("button", { type: "button", class: "lf-close", "aria-label": "Close", "data-lf-close": true, text: "×" }),
        el("div", { class: "lf-dialog__body" }),
      ),
    );
    dialog.addEventListener("click", (e) => {
      // Click on the backdrop (outside the panel) or a close button.
      if (e.target === dialog || e.target.closest("[data-lf-close]")) dialog.close();
    });
    dialog.addEventListener("close", () => document.documentElement.classList.remove("lf-locked"));
    document.body.append(dialog);
    return dialog;
  }

  function openForm(key, values) {
    if (!FORMS[key]) return;
    const d = getDialog();
    const form = buildForm(key);
    prefill(form, values);
    d.querySelector(".lf-dialog__body").replaceChildren(form);
    document.documentElement.classList.add("lf-locked");
    d.showModal();
    d.querySelector(".lf-dialog__inner").scrollTop = 0;
    d.querySelector(".lf-close").focus({ preventScroll: true });
  }

  /* ---------- Wiring ---------- */

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href], [data-lead-form-open]");
    if (!link || link.closest(".lf-dialog")) return;

    const explicit = link.dataset.leadFormOpen;
    const route = explicit ? [explicit] : ROUTES[link.getAttribute("href")];
    if (!route) return;

    e.preventDefault();
    openForm(route[0], route[1]);
  });

  function init() {
    document.querySelectorAll("[data-lead-form]").forEach((slot) => {
      slot.replaceChildren(buildForm(slot.dataset.leadForm));
    });
    // Ad and QR links: ?form=sell | buy | build | contact (same scheme as exitconnect.me).
    const want = (query.get("form") || "").toLowerCase();
    if (FORMS[want]) setTimeout(() => openForm(want), 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.GSRELeadForms = { open: openForm };
})();
