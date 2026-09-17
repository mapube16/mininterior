/* @ds-bundle: {"format":4,"namespace":"DesignSystem_0b54b8","components":[{"name":"AccessibilityBar","sourcePath":"components/a11y/AccessibilityBar.jsx"},{"name":"Accordion","sourcePath":"components/accordion/Accordion.jsx"},{"name":"BackToTop","sourcePath":"components/backtotop/BackToTop.jsx"},{"name":"Breadcrumb","sourcePath":"components/breadcrumb/Breadcrumb.jsx"},{"name":"Button","sourcePath":"components/button/Button.jsx"},{"name":"InfoCard","sourcePath":"components/card/InfoCard.jsx"},{"name":"Footer","sourcePath":"components/footer/Footer.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"Header","sourcePath":"components/header/Header.jsx"},{"name":"Modal","sourcePath":"components/modal/Modal.jsx"},{"name":"Banner","sourcePath":"components/notification/Banner.jsx"},{"name":"Notification","sourcePath":"components/notification/Notification.jsx"},{"name":"Pagination","sourcePath":"components/pagination/Pagination.jsx"},{"name":"ProgressBar","sourcePath":"components/progress/ProgressBar.jsx"},{"name":"Spinner","sourcePath":"components/progress/ProgressBar.jsx"},{"name":"ProgressSteps","sourcePath":"components/progress/ProgressSteps.jsx"},{"name":"SearchBar","sourcePath":"components/search/SearchBar.jsx"},{"name":"DataTable","sourcePath":"components/table/DataTable.jsx"},{"name":"Tabs","sourcePath":"components/tabs/Tabs.jsx"},{"name":"Tag","sourcePath":"components/tag/Tag.jsx"},{"name":"Tooltip","sourcePath":"components/tooltip/Tooltip.jsx"},{"name":"TopBar","sourcePath":"components/topbar/TopBar.jsx"}],"sourceHashes":{"components/a11y/AccessibilityBar.jsx":"cbceab1e7f99","components/accordion/Accordion.jsx":"bb9a9755bfac","components/backtotop/BackToTop.jsx":"5c08fb70b90c","components/breadcrumb/Breadcrumb.jsx":"b10ed2356c19","components/button/Button.jsx":"3234ce437820","components/card/InfoCard.jsx":"d4a130d41ecf","components/footer/Footer.jsx":"e911d7acac5d","components/forms/Checkbox.jsx":"bd7b88dfb0dc","components/forms/Radio.jsx":"5afedc28fabb","components/forms/Select.jsx":"4f72eded4dfe","components/forms/TextField.jsx":"9ee37f16f162","components/header/Header.jsx":"4f33e5f4a430","components/modal/Modal.jsx":"40d3fb012dd1","components/notification/Banner.jsx":"32dadb4d2dea","components/notification/Notification.jsx":"21928c3dde3d","components/pagination/Pagination.jsx":"1351e7efd39b","components/progress/ProgressBar.jsx":"8b26592da28f","components/progress/ProgressSteps.jsx":"bf24fbc3a3be","components/search/SearchBar.jsx":"52f36624c222","components/table/DataTable.jsx":"f10f67cc7345","components/tabs/Tabs.jsx":"624fd0154dcd","components/tag/Tag.jsx":"0110e10bab8f","components/tooltip/Tooltip.jsx":"0439403e5d05","components/topbar/TopBar.jsx":"a6aed9d51e75"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_0b54b8 = window.DesignSystem_0b54b8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/a11y/AccessibilityBar.jsx
try { (() => {
/* Barra de accesibilidad — aumentar / reducir letra y contraste */
function AccessibilityBar({
  contrast = false,
  onIncrease,
  onDecrease,
  onContrast,
  labels = {}
}) {
  const [on, setOn] = React.useState(contrast);
  const t = {
    increase: "Aumentar letra",
    decrease: "Reducir letra",
    contrast: "Contraste",
    ...labels
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "govco-a11y",
    role: "group",
    "aria-label": "Barra de accesibilidad"
  }, /*#__PURE__*/React.createElement("button", {
    className: "govco-a11y__btn",
    type: "button",
    onClick: onIncrease
  }, /*#__PURE__*/React.createElement("span", {
    className: "govco-a11y__glyph",
    "aria-hidden": "true"
  }, "A+"), /*#__PURE__*/React.createElement("span", null, t.increase)), /*#__PURE__*/React.createElement("button", {
    className: "govco-a11y__btn",
    type: "button",
    onClick: onDecrease
  }, /*#__PURE__*/React.createElement("span", {
    className: "govco-a11y__glyph",
    "aria-hidden": "true"
  }, "A\u2212"), /*#__PURE__*/React.createElement("span", null, t.decrease)), /*#__PURE__*/React.createElement("button", {
    className: "govco-a11y__btn",
    type: "button",
    "aria-pressed": on,
    onClick: () => {
      setOn(!on);
      onContrast && onContrast(!on);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "govco-a11y__glyph",
    "aria-hidden": "true"
  }, "\u25D0"), /*#__PURE__*/React.createElement("span", null, t.contrast)));
}
Object.assign(__ds_scope, { AccessibilityBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/a11y/AccessibilityBar.jsx", error: String((e && e.message) || e) }); }

// components/accordion/Accordion.jsx
try { (() => {
/* Acordeón básico y con ícono o número */
function Accordion({
  items = [{
    title: "Reunir documentación",
    content: "Cédula de ciudadanía: 1 original en formato válido."
  }, {
    title: "Presentar la solicitud",
    content: "Radica la solicitud en la sede electrónica de la entidad."
  }],
  numbered = false,
  multiple = false,
  defaultOpen = [0],
  headingLevel = 3
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const toggle = i => setOpen(prev => prev.includes(i) ? prev.filter(n => n !== i) : multiple ? [...prev, i] : [i]);
  const H = "h" + headingLevel;
  return /*#__PURE__*/React.createElement("div", {
    className: "govco-accordion"
  }, items.map((it, i) => {
    const expanded = open.includes(i);
    return /*#__PURE__*/React.createElement("div", {
      className: "govco-accordion__item",
      key: it.title
    }, /*#__PURE__*/React.createElement(H, {
      style: {
        margin: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "govco-accordion__trigger",
      type: "button",
      "aria-expanded": expanded,
      "aria-controls": "govco-panel-" + i,
      disabled: it.disabled,
      onClick: () => toggle(i)
    }, numbered ? /*#__PURE__*/React.createElement("span", {
      className: "govco-accordion__marker",
      "aria-hidden": "true"
    }, i + 1) : null, /*#__PURE__*/React.createElement("span", null, it.title), /*#__PURE__*/React.createElement("span", {
      className: "govco-accordion__caret",
      "aria-hidden": "true"
    }, "\u25BE"))), expanded ? /*#__PURE__*/React.createElement("div", {
      className: "govco-accordion__panel",
      id: "govco-panel-" + i
    }, it.subtitle ? /*#__PURE__*/React.createElement("h4", null, it.subtitle) : null, it.content) : null);
  }));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/accordion/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/backtotop/BackToTop.jsx
try { (() => {
/* Volver arriba */
function BackToTop({
  label = "Volver arriba",
  fixed = false,
  onClick
}) {
  const go = () => {
    onClick ? onClick() : window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  return /*#__PURE__*/React.createElement("button", {
    className: "govco-backtotop" + (fixed ? " govco-backtotop--fixed" : ""),
    type: "button",
    "aria-label": label,
    onClick: go
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontSize: "var(--body-1-size)"
    }
  }, "\u25B2"), /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { BackToTop });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/backtotop/BackToTop.jsx", error: String((e && e.message) || e) }); }

// components/breadcrumb/Breadcrumb.jsx
try { (() => {
/* Miga de pan */
function Breadcrumb({
  items = [{
    label: "Inicio",
    href: "#"
  }, {
    label: "Trámites y servicios",
    href: "#"
  }, {
    label: "Página actual"
  }],
  separator = "/"
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: "govco-breadcrumb",
    "aria-label": "Ruta de navegaci\xF3n"
  }, /*#__PURE__*/React.createElement("ol", null, items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement("li", {
      key: it.label,
      style: {
        display: "flex",
        gap: "var(--space-2)",
        alignItems: "center"
      }
    }, last || !it.href ? /*#__PURE__*/React.createElement("span", {
      "aria-current": last ? "page" : undefined
    }, it.label) : /*#__PURE__*/React.createElement("a", {
      href: it.href
    }, it.label), last ? null : /*#__PURE__*/React.createElement("span", {
      className: "govco-breadcrumb__sep",
      "aria-hidden": "true"
    }, separator));
  })));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/breadcrumb/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/button/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* GOV.CO Kit UI 9.2 — Botones */
function Button({
  children = "Botón",
  variant = "filled",
  inverse = false,
  size = "md",
  iconLeft = null,
  iconRight = null,
  iconOnly = false,
  disabled = false,
  href = null,
  type = "button",
  onClick,
  ...rest
}) {
  const cls = ["govco-btn", `govco-btn--${variant}`, `govco-btn--${size}`, inverse ? "govco-btn--inverse" : "", iconOnly ? "govco-btn--icon" : ""].filter(Boolean).join(" ");
  const inner = [iconLeft ? /*#__PURE__*/React.createElement("span", {
    className: "govco-btn__icon",
    key: "l",
    "aria-hidden": "true"
  }, iconLeft) : null, iconOnly ? null : /*#__PURE__*/React.createElement("span", {
    className: "govco-btn__label",
    key: "t"
  }, children), iconOnly ? /*#__PURE__*/React.createElement("span", {
    className: "govco-btn__icon",
    key: "o",
    "aria-hidden": "true"
  }, iconLeft || iconRight || children) : null, iconRight && !iconOnly ? /*#__PURE__*/React.createElement("span", {
    className: "govco-btn__icon",
    key: "r",
    "aria-hidden": "true"
  }, iconRight) : null];
  if (href && !disabled) {
    return /*#__PURE__*/React.createElement("a", _extends({
      className: cls,
      href: href
    }, rest), inner);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    type: type,
    disabled: disabled,
    onClick: onClick
  }, rest), inner);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/button/Button.jsx", error: String((e && e.message) || e) }); }

// components/card/InfoCard.jsx
try { (() => {
/* Tarjeta de información */
function InfoCard({
  title = "Título de la tarjeta",
  text = "Descripción breve del contenido o del trámite que agrupa la tarjeta.",
  eyebrow = "",
  icon = null,
  href = null,
  accent = null,
  children = null
}) {
  const Tag = href ? "a" : "div";
  return /*#__PURE__*/React.createElement(Tag, {
    className: "govco-card" + (href ? " govco-card--linked" : ""),
    href: href || undefined,
    style: accent ? {
      borderTopColor: accent
    } : undefined
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "govco-card__icon",
    "aria-hidden": "true"
  }, icon) : null, eyebrow ? /*#__PURE__*/React.createElement("span", {
    className: "govco-card__eyebrow"
  }, eyebrow) : null, /*#__PURE__*/React.createElement("h3", {
    className: "govco-card__title"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "govco-card__text"
  }, text), children ? /*#__PURE__*/React.createElement("div", {
    className: "govco-card__foot"
  }, children) : null);
}
Object.assign(__ds_scope, { InfoCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/card/InfoCard.jsx", error: String((e && e.message) || e) }); }

// components/footer/Footer.jsx
try { (() => {
/* Pie de página — Sedes electrónicas y Trámites y servicios */
function Footer({
  entity = "Nombre completo de la sede electrónica",
  sedes = [{
    name: "Sede principal",
    lines: ["Dirección: Calle 00 # 00 - 00, Bogotá D.C.", "Código postal: 111711", "Horario de atención: Lunes a viernes 8:00 a.m. - 5:00 p.m.", "Teléfono conmutador: +57 (601) 000 00 00", "Línea gratuita: 01 8000 000 000", "Línea anticorrupción: 01 8000 000 001", "Correo institucional: entidad@entidad.gov.co", "Correo de notificaciones judiciales: judiciales@entidad.gov.co"]
  }],
  links = ["Accesibilidad", "Términos y condiciones", "Mapa del sitio", "Políticas", "Directorio Institucional"],
  social = ["@Entidad", "@Entidad", "@Entidad"],
  accent = null,
  logoSrc = null
}) {
  return /*#__PURE__*/React.createElement("footer", {
    className: "govco-footer",
    style: accent ? {
      "--entity-accent": accent
    } : undefined
  }, /*#__PURE__*/React.createElement("div", {
    className: "govco-footer__grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "govco-footer__title"
  }, entity), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      marginTop: "var(--space-4)"
    }
  }, social.map((s, i) => /*#__PURE__*/React.createElement("span", {
    className: "govco-footer__line",
    key: i
  }, s)))), sedes.map(sede => /*#__PURE__*/React.createElement("div", {
    key: sede.name
  }, /*#__PURE__*/React.createElement("h3", {
    className: "govco-footer__sub"
  }, sede.name), sede.lines.map((l, i) => /*#__PURE__*/React.createElement("p", {
    className: "govco-footer__line",
    key: i
  }, l))))), /*#__PURE__*/React.createElement("div", {
    className: "govco-footer__links"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#"
  }, l))), /*#__PURE__*/React.createElement("div", {
    className: "govco-footer__band"
  }, /*#__PURE__*/React.createElement("div", {
    className: "govco-footer__seals"
  }, logoSrc ? /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "GOV.CO",
    style: {
      height: "24px"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    className: "govco-footer__seal"
  }, "GOV.CO"), /*#__PURE__*/React.createElement("span", {
    className: "govco-footer__seal"
  }, "Colombia \xB7 CO"))));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/footer/Footer.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Opciones de selección — casilla de verificación */
function Checkbox({
  label = "Opción",
  checked,
  defaultChecked = false,
  disabled = false,
  name,
  onChange,
  ...rest
}) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked === undefined ? inner : checked;
  return /*#__PURE__*/React.createElement("label", {
    className: "govco-choice govco-choice--check" + (disabled ? " govco-choice--disabled" : "")
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    name: name,
    checked: on,
    disabled: disabled,
    onChange: e => {
      if (checked === undefined) setInner(e.target.checked);
      onChange && onChange(e);
    }
  }, rest)), /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Opciones de selección — botón de radio y grupo */
function Radio({
  label = "Opción",
  name = "govco-radio",
  value,
  checked,
  disabled = false,
  onChange,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "govco-choice govco-choice--radio" + (disabled ? " govco-choice--disabled" : "")
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    disabled: disabled,
    onChange: onChange
  }, rest)), /*#__PURE__*/React.createElement("span", null, label));
}
function RadioGroup({
  legend = "Seleccione una opción",
  name = "govco-radio",
  options = ["Opción 1", "Opción 2"],
  value,
  disabled = false,
  onChange
}) {
  const [inner, setInner] = React.useState(value ?? options[0]);
  const current = value === undefined ? inner : value;
  return /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: 0,
      margin: 0,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("legend", {
    className: "govco-label",
    style: {
      padding: 0,
      marginBottom: "var(--space-1)"
    }
  }, legend), options.map(opt => /*#__PURE__*/React.createElement(Radio, {
    key: opt,
    name: name,
    label: opt,
    value: opt,
    disabled: disabled,
    checked: opt === current,
    onChange: () => {
      if (value === undefined) setInner(opt);
      onChange && onChange(opt);
    }
  })));
}
Object.assign(__ds_scope, { Radio, RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
/* Desplegables — Kit UI 9.2 */
function Select({
  label = "Etiqueta",
  required = false,
  placeholder = "Seleccione una opción",
  options = ["Opción 1", "Opción 2", "Opción 3"],
  value,
  help = "",
  error = "",
  disabled = false,
  id,
  onChange
}) {
  const auto = React.useId ? React.useId() : "govco-select";
  const fid = id || auto;
  const [open, setOpen] = React.useState(false);
  const [sel, setSel] = React.useState(value ?? null);
  const current = value === undefined ? sel : value;
  const pick = opt => {
    setSel(opt);
    setOpen(false);
    onChange && onChange(opt);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "govco-field" + (error ? " govco-field--error" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "govco-label",
    id: fid + "-label"
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    className: "govco-label__req"
  }, "*") : null), /*#__PURE__*/React.createElement("div", {
    className: "govco-select"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "govco-select__control",
    id: fid,
    disabled: disabled,
    "aria-haspopup": "listbox",
    "aria-expanded": open,
    "aria-labelledby": fid + "-label",
    onClick: () => setOpen(!open),
    onKeyDown: e => {
      if (e.key === "Escape") setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: current ? "govco-select__value" : "govco-select__value govco-select__value--empty"
  }, current || placeholder), /*#__PURE__*/React.createElement("span", {
    className: "govco-select__caret",
    "aria-hidden": "true"
  }, open ? "▲" : "▼")), open ? /*#__PURE__*/React.createElement("ul", {
    className: "govco-select__list",
    role: "listbox",
    "aria-labelledby": fid + "-label"
  }, options.map(opt => /*#__PURE__*/React.createElement("li", {
    key: opt,
    role: "option",
    className: "govco-select__option",
    "aria-selected": opt === current,
    onClick: () => pick(opt)
  }, opt))) : null), help && !error ? /*#__PURE__*/React.createElement("span", {
    className: "govco-help"
  }, help) : null, error ? /*#__PURE__*/React.createElement("span", {
    className: "govco-error",
    role: "alert"
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\u26A0"), error) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Entradas de texto — Kit UI 9.2 */
function TextField({
  label = "Etiqueta",
  required = false,
  placeholder = "Ejemplo: campo de texto",
  value,
  defaultValue = "",
  help = "",
  error = "",
  disabled = false,
  multiline = false,
  maxLength = null,
  id,
  onChange,
  ...rest
}) {
  const auto = React.useId ? React.useId() : "govco-field";
  const fid = id || auto;
  const [inner, setInner] = React.useState(defaultValue);
  const val = value === undefined ? inner : value;
  const handle = e => {
    if (value === undefined) setInner(e.target.value);
    onChange && onChange(e);
  };
  const Tag = multiline ? "textarea" : "input";
  return /*#__PURE__*/React.createElement("div", {
    className: "govco-field" + (error ? " govco-field--error" : "")
  }, /*#__PURE__*/React.createElement("label", {
    className: "govco-label",
    htmlFor: fid
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    className: "govco-label__req"
  }, "*") : null), /*#__PURE__*/React.createElement(Tag, _extends({
    id: fid,
    className: multiline ? "govco-textarea" : "govco-input",
    placeholder: placeholder,
    value: val,
    disabled: disabled,
    maxLength: maxLength || undefined,
    "aria-describedby": error ? fid + "-err" : help ? fid + "-help" : undefined,
    "aria-invalid": error ? true : undefined,
    onChange: handle
  }, rest)), maxLength ? /*#__PURE__*/React.createElement("span", {
    className: "govco-counter"
  }, String(val).length, "/", maxLength) : null, help && !error ? /*#__PURE__*/React.createElement("span", {
    className: "govco-help",
    id: fid + "-help"
  }, help) : null, error ? /*#__PURE__*/React.createElement("span", {
    className: "govco-error",
    id: fid + "-err",
    role: "alert"
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\u26A0"), error) : null);
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/header/Header.jsx
try { (() => {
/* Cabecera — Sedes electrónicas / Trámites y servicios */
function Header({
  entity = "Nombre completo de la sede electrónica",
  subtitle = "Entidad del orden nacional",
  sealLabel = "ES",
  items = [{
    label: "Inicio",
    href: "#",
    current: true
  }, {
    label: "Atención y Servicios a la ciudadanía",
    href: "#"
  }, {
    label: "Participa",
    href: "#"
  }, {
    label: "Transparencia y acceso información pública",
    href: "#"
  }],
  accent = null,
  children = null
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "govco-header",
    style: accent ? {
      "--entity-accent": accent
    } : undefined
  }, /*#__PURE__*/React.createElement("a", {
    className: "sr-only",
    href: "#contenido-principal"
  }, "Saltar al contenido principal"), /*#__PURE__*/React.createElement("div", {
    className: "govco-header__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "govco-header__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "govco-header__seal",
    "aria-hidden": "true"
  }, sealLabel), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "govco-header__entity"
  }, entity), subtitle ? /*#__PURE__*/React.createElement("span", {
    className: "govco-header__sub",
    style: {
      display: "block"
    }
  }, subtitle) : null)), /*#__PURE__*/React.createElement("div", {
    className: "govco-header__tools"
  }, children)), /*#__PURE__*/React.createElement("nav", {
    className: "govco-nav",
    "aria-label": "Men\xFA de navegaci\xF3n principal"
  }, items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it.label,
    className: "govco-nav__link",
    href: it.href || "#",
    "aria-current": it.current ? "page" : undefined
  }, it.label))));
}
Object.assign(__ds_scope, { Header });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/header/Header.jsx", error: String((e && e.message) || e) }); }

// components/modal/Modal.jsx
try { (() => {
/* Alerta modal — confirmación, éxito, advertencia y error */
function Modal({
  open = true,
  variant = "confirm",
  title = "Título de la alerta",
  message = "Información de detalle al cierre de la acción",
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  inline = false,
  onConfirm,
  onCancel,
  onClose,
  children = null
}) {
  React.useEffect(() => {
    if (!open || inline) return;
    const onKey = e => {
      if (e.key === "Escape") (onClose || onCancel || (() => {}))();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, inline, onClose, onCancel]);
  if (!open) return null;
  const glyph = {
    confirm: "?",
    success: "✓",
    warning: "!",
    error: "✕"
  }[variant] || "?";
  const dialog = /*#__PURE__*/React.createElement("div", {
    className: "govco-modal govco-modal--" + variant,
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "govco-modal-title",
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "govco-modal__bar"
  }), /*#__PURE__*/React.createElement("button", {
    className: "govco-modal__close",
    type: "button",
    "aria-label": "Cerrar",
    onClick: onClose || onCancel
  }, "\u2715"), /*#__PURE__*/React.createElement("div", {
    className: "govco-modal__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "govco-modal__icon",
    "aria-hidden": "true"
  }, glyph), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "govco-modal__title",
    id: "govco-modal-title"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "govco-modal__text"
  }, message), children)), /*#__PURE__*/React.createElement("div", {
    className: "govco-modal__actions"
  }, cancelLabel ? /*#__PURE__*/React.createElement("button", {
    className: "govco-btn govco-btn--outline",
    type: "button",
    onClick: onCancel || onClose
  }, cancelLabel) : null, /*#__PURE__*/React.createElement("button", {
    className: "govco-btn govco-btn--filled",
    type: "button",
    onClick: onConfirm
  }, confirmLabel)));
  if (inline) return dialog;
  return /*#__PURE__*/React.createElement("div", {
    className: "govco-modal__overlay",
    onClick: e => {
      if (e.target === e.currentTarget) (onClose || onCancel || (() => {}))();
    }
  }, dialog);
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/modal/Modal.jsx", error: String((e && e.message) || e) }); }

// components/notification/Banner.jsx
try { (() => {
/* Alerta emergente (banner): 70% del ancho en desktop, 100% en responsive */
function Banner({
  children = "Texto que responde al usuario de forma contextual y permite acceder un enlace",
  variant = "info",
  dismissible = true,
  onClose
}) {
  const glyph = {
    info: "i",
    success: "✓",
    warning: "!",
    error: "!"
  }[variant] || "i";
  return /*#__PURE__*/React.createElement("div", {
    className: "govco-banner govco-banner--" + variant,
    role: variant === "error" ? "alert" : "status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "govco-banner__icon",
    "aria-hidden": "true"
  }, glyph), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, children), dismissible ? /*#__PURE__*/React.createElement("button", {
    className: "govco-banner__close",
    type: "button",
    "aria-label": "Cerrar alerta",
    onClick: onClose
  }, "\u2715") : null);
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/notification/Banner.jsx", error: String((e && e.message) || e) }); }

// components/notification/Notification.jsx
try { (() => {
/* Notificación tipo tostada (toast) */
function Notification({
  title = "Título notificación",
  message = "Mensaje de notificación corto y conciso como respuesta al usuario.",
  variant = "info",
  time = "Hace x segundos",
  dismissible = true,
  onClose
}) {
  const glyph = {
    info: "i",
    success: "✓",
    error: "!"
  }[variant] || "i";
  return /*#__PURE__*/React.createElement("div", {
    className: "govco-toast govco-toast--" + variant,
    role: variant === "error" ? "alert" : "status",
    "aria-live": variant === "error" ? "assertive" : "polite"
  }, /*#__PURE__*/React.createElement("span", {
    className: "govco-toast__icon",
    "aria-hidden": "true"
  }, glyph), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "govco-toast__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "govco-toast__title"
  }, title), /*#__PURE__*/React.createElement("span", {
    className: "govco-toast__time"
  }, time)), /*#__PURE__*/React.createElement("p", {
    className: "govco-toast__body",
    style: {
      margin: 0
    }
  }, message)), dismissible ? /*#__PURE__*/React.createElement("button", {
    className: "govco-toast__close",
    type: "button",
    "aria-label": "Cerrar notificaci\xF3n",
    onClick: onClose
  }, "\u2715") : null);
}
Object.assign(__ds_scope, { Notification });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/notification/Notification.jsx", error: String((e && e.message) || e) }); }

// components/pagination/Pagination.jsx
try { (() => {
/* Paginación */
function Pagination({
  total = 8,
  page = 1,
  siblings = 1,
  onChange
}) {
  const [cur, setCur] = React.useState(page);
  const go = n => {
    const v = Math.min(Math.max(1, n), total);
    setCur(v);
    onChange && onChange(v);
  };
  const pages = [];
  for (let n = 1; n <= total; n++) {
    const near = Math.abs(n - cur) <= siblings || n === 1 || n === total;
    if (near) pages.push(n);else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return /*#__PURE__*/React.createElement("nav", {
    className: "govco-pagination",
    "aria-label": "Paginaci\xF3n"
  }, /*#__PURE__*/React.createElement("button", {
    className: "govco-page",
    type: "button",
    "aria-label": "P\xE1gina anterior",
    disabled: cur === 1,
    onClick: () => go(cur - 1)
  }, "\u2039"), pages.map((n, i) => n === "…" ? /*#__PURE__*/React.createElement("span", {
    className: "govco-pagination__ellipsis",
    key: "e" + i,
    "aria-hidden": "true"
  }, "\u2026") : /*#__PURE__*/React.createElement("button", {
    className: "govco-page",
    type: "button",
    key: n,
    "aria-current": n === cur ? "page" : undefined,
    "aria-label": "Página " + n,
    onClick: () => go(n)
  }, n)), /*#__PURE__*/React.createElement("button", {
    className: "govco-page",
    type: "button",
    "aria-label": "P\xE1gina siguiente",
    disabled: cur === total,
    onClick: () => go(cur + 1)
  }, "\u203A"));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pagination/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/progress/ProgressBar.jsx
try { (() => {
/* Barra de progreso e indicador de carga */
function ProgressBar({
  value = 40,
  label = "Avance del trámite",
  showValue = true
}) {
  const v = Math.min(100, Math.max(0, value));
  return /*#__PURE__*/React.createElement("div", null, label || showValue ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "var(--space-2)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--body-2-size)",
      color: "var(--text-body)"
    }
  }, label ? /*#__PURE__*/React.createElement("span", null, label) : null, showValue ? /*#__PURE__*/React.createElement("span", null, v, "%") : null) : null, /*#__PURE__*/React.createElement("div", {
    className: "govco-progress",
    role: "progressbar",
    "aria-label": label,
    "aria-valuenow": v,
    "aria-valuemin": 0,
    "aria-valuemax": 100
  }, /*#__PURE__*/React.createElement("div", {
    className: "govco-progress__fill",
    style: {
      width: v + "%"
    }
  })));
}
function Spinner({
  label = "Cargando…",
  size = "md",
  showLabel = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    },
    role: "status",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("span", {
    className: "govco-spinner" + (size === "sm" ? " govco-spinner--sm" : ""),
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "govco-body-2",
    style: {
      color: "var(--text-body)"
    }
  }, showLabel ? label : /*#__PURE__*/React.createElement("span", {
    className: "sr-only"
  }, label)));
}
Object.assign(__ds_scope, { ProgressBar, Spinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/progress/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/progress/ProgressSteps.jsx
try { (() => {
/* Línea de avance (pasos) */
function ProgressSteps({
  steps = ["Reunir documentación", "Radicar solicitud", "Pagar", "Recibir respuesta"],
  current = 1
}) {
  return /*#__PURE__*/React.createElement("ol", {
    className: "govco-steps",
    "aria-label": "L\xEDnea de avance"
  }, steps.map((s, i) => {
    const state = i < current ? "done" : i === current ? "current" : "todo";
    return /*#__PURE__*/React.createElement("li", {
      className: "govco-step govco-step--" + state,
      key: s,
      "aria-current": state === "current" ? "step" : undefined
    }, i < steps.length - 1 ? /*#__PURE__*/React.createElement("span", {
      className: "govco-step__bar",
      "aria-hidden": "true"
    }) : null, /*#__PURE__*/React.createElement("span", {
      className: "govco-step__dot",
      "aria-hidden": "true"
    }, state === "done" ? "✓" : i + 1), /*#__PURE__*/React.createElement("span", {
      className: "govco-step__label"
    }, s));
  }));
}
Object.assign(__ds_scope, { ProgressSteps });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/progress/ProgressSteps.jsx", error: String((e && e.message) || e) }); }

// components/search/SearchBar.jsx
try { (() => {
/* Buscador básico y predictivo — Kit UI 9.2 */
function SearchBar({
  placeholder = "Buscar en la Sede Electrónica",
  label = "Buscar",
  buttonLabel = "Buscar",
  suggestions = [],
  value,
  defaultValue = "",
  showButtonLabel = true,
  onSearch,
  onChange
}) {
  const [inner, setInner] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const q = value === undefined ? inner : value;
  const matches = q ? suggestions.filter(s => s.toLowerCase().includes(q.toLowerCase())) : suggestions;
  const set = v => {
    if (value === undefined) setInner(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "govco-search",
    role: "search"
  }, /*#__PURE__*/React.createElement("div", {
    className: "govco-search__row"
  }, /*#__PURE__*/React.createElement("input", {
    className: "govco-search__input",
    type: "search",
    "aria-label": label,
    placeholder: placeholder,
    value: q,
    onChange: e => {
      set(e.target.value);
      setOpen(true);
    },
    onFocus: () => setOpen(suggestions.length > 0),
    onKeyDown: e => {
      if (e.key === "Enter") {
        setOpen(false);
        onSearch && onSearch(q);
      }
      if (e.key === "Escape") setOpen(false);
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "govco-search__btn",
    type: "button",
    "aria-label": buttonLabel,
    onClick: () => {
      setOpen(false);
      onSearch && onSearch(q);
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\u2315"), showButtonLabel ? /*#__PURE__*/React.createElement("span", null, buttonLabel) : null)), open && matches.length ? /*#__PURE__*/React.createElement("ul", {
    className: "govco-search__suggestions",
    role: "listbox",
    "aria-label": "Sugerencias de b\xFAsqueda"
  }, matches.map(s => /*#__PURE__*/React.createElement("li", {
    key: s,
    role: "option",
    "aria-selected": "false",
    className: "govco-search__suggestion",
    onClick: () => {
      set(s);
      setOpen(false);
      onSearch && onSearch(s);
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\u2315"), /*#__PURE__*/React.createElement("span", null, s)))) : null);
}
Object.assign(__ds_scope, { SearchBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/search/SearchBar.jsx", error: String((e && e.message) || e) }); }

// components/table/DataTable.jsx
try { (() => {
/* Tablas */
function DataTable({
  caption = "",
  columns = ["Trámite", "Dependencia", "Estado"],
  rows = [["Certificado de residencia", "Secretaría de Gobierno", "Disponible"], ["Registro de proveedores", "Secretaría General", "En revisión"], ["Permiso de ocupación", "Planeación", "Disponible"]],
  zebra = true
}) {
  return /*#__PURE__*/React.createElement("table", {
    className: "govco-table" + (zebra ? "" : " govco-table--flat")
  }, caption ? /*#__PURE__*/React.createElement("caption", null, caption) : null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    scope: "col",
    key: typeof c === "string" ? c : c.label
  }, typeof c === "string" ? c : c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, r.map((cell, j) => j === 0 ? /*#__PURE__*/React.createElement("th", {
    scope: "row",
    key: j,
    style: {
      background: "transparent",
      color: "var(--text-title)"
    }
  }, cell) : /*#__PURE__*/React.createElement("td", {
    key: j
  }, cell))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/table/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/tabs/Tabs.jsx
try { (() => {
/* Pestañas */
function Tabs({
  tabs = [{
    label: "Descripción",
    content: "Contenido de la primera pestaña."
  }, {
    label: "Requisitos",
    content: "Contenido de la segunda pestaña."
  }, {
    label: "Costos",
    content: "Contenido de la tercera pestaña."
  }],
  defaultIndex = 0,
  onChange
}) {
  const [i, setI] = React.useState(defaultIndex);
  return /*#__PURE__*/React.createElement("div", {
    className: "govco-tabs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "govco-tabs__list",
    role: "tablist"
  }, tabs.map((t, n) => /*#__PURE__*/React.createElement("button", {
    key: t.label,
    className: "govco-tab",
    role: "tab",
    type: "button",
    id: "govco-tab-" + n,
    "aria-selected": n === i,
    "aria-controls": "govco-tabpanel-" + n,
    disabled: t.disabled,
    onClick: () => {
      setI(n);
      onChange && onChange(n);
    }
  }, t.icon ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, t.icon) : null, t.label))), /*#__PURE__*/React.createElement("div", {
    className: "govco-tabs__panel",
    role: "tabpanel",
    id: "govco-tabpanel-" + i,
    "aria-labelledby": "govco-tab-" + i
  }, tabs[i] ? tabs[i].content : null));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tabs/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/tag/Tag.jsx
try { (() => {
/* Etiquetas */
function Tag({
  children = "Etiqueta",
  variant = "info",
  outline = false,
  removable = false,
  onRemove,
  onClick
}) {
  const cls = ["govco-tag", "govco-tag--" + variant, outline ? "govco-tag--outline" : "", onClick ? "govco-tag--interactive" : ""].filter(Boolean).join(" ");
  const Tag_ = onClick ? "button" : "span";
  return /*#__PURE__*/React.createElement(Tag_, {
    className: cls,
    type: onClick ? "button" : undefined,
    onClick: onClick
  }, /*#__PURE__*/React.createElement("span", null, children), removable ? /*#__PURE__*/React.createElement("button", {
    className: "govco-tag__remove",
    type: "button",
    "aria-label": "Quitar " + children,
    onClick: e => {
      e.stopPropagation();
      onRemove && onRemove();
    }
  }, "\u2715") : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tag/Tag.jsx", error: String((e && e.message) || e) }); }

// components/tooltip/Tooltip.jsx
try { (() => {
/* Descripción emergente (tooltip) */
function Tooltip({
  content = "Mensaje breve de ayuda para el usuario.",
  placement = "top",
  children = null,
  triggerLabel = "?",
  open
}) {
  const [shown, setShown] = React.useState(false);
  const visible = open === undefined ? shown : open;
  return /*#__PURE__*/React.createElement("span", {
    className: "govco-tooltip",
    onMouseEnter: () => setShown(true),
    onMouseLeave: () => setShown(false),
    onFocus: () => setShown(true),
    onBlur: () => setShown(false),
    onKeyDown: e => {
      if (e.key === "Escape") setShown(false);
    }
  }, children || /*#__PURE__*/React.createElement("button", {
    className: "govco-tooltip__trigger",
    type: "button",
    "aria-describedby": "govco-tip",
    "aria-label": "M\xE1s informaci\xF3n"
  }, triggerLabel), visible ? /*#__PURE__*/React.createElement("span", {
    className: "govco-tooltip__bubble govco-tooltip__bubble--" + placement,
    role: "tooltip",
    id: "govco-tip"
  }, content) : null);
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tooltip/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/topbar/TopBar.jsx
try { (() => {
/* Barra superior (top bar) — 56 px, cobalt, logo GOV.CO a 136x24 */
function TopBar({
  logoSrc = null,
  logoHref = "https://www.gov.co/home/",
  showLanguage = true,
  languageLabel = "Español",
  onLanguageClick,
  children = null
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "govco-topbar"
  }, /*#__PURE__*/React.createElement("a", {
    className: "govco-topbar__logo",
    href: logoHref,
    title: "Ir al portal GOV.CO"
  }, logoSrc ? /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "GOV.CO"
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-heading)",
      fontWeight: 800,
      fontSize: "20px",
      letterSpacing: ".02em",
      color: "var(--color-white)"
    }
  }, "GOV.CO")), children, showLanguage ? /*#__PURE__*/React.createElement("button", {
    className: "govco-topbar__lang",
    type: "button",
    "aria-label": "Cambiar idioma. Idioma actual: " + languageLabel,
    onClick: onLanguageClick
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\uD83C\uDF10"), /*#__PURE__*/React.createElement("span", null, languageLabel)) : null);
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/topbar/TopBar.jsx", error: String((e && e.message) || e) }); }

__ds_ns.AccessibilityBar = __ds_scope.AccessibilityBar;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.BackToTop = __ds_scope.BackToTop;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.InfoCard = __ds_scope.InfoCard;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.RadioGroup = __ds_scope.RadioGroup;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.Header = __ds_scope.Header;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Notification = __ds_scope.Notification;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.ProgressSteps = __ds_scope.ProgressSteps;

__ds_ns.SearchBar = __ds_scope.SearchBar;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
