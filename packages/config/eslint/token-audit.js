// Token audit: class strings may only use theme tokens, never raw design values.
// The allowed / not allowed table lives in docs/REGISTRY.md ("Styling rules").

// Tailwind's built-in palette. Token colours (primary, muted, …) never match.
const PALETTE = [
  "slate", "gray", "zinc", "neutral", "stone", "taupe", "mauve", "mist", "olive",
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan",
  "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
].join("|");

const COLOUR_UTILITIES = [
  "bg", "text", "border", "border-[xytrblse]", "outline", "ring", "ring-offset", "inset-ring",
  "shadow", "inset-shadow", "drop-shadow", "text-shadow", "divide", "decoration", "accent",
  "caret", "fill", "stroke", "placeholder", "from", "via", "to",
].join("|");

const PALETTE_CLASS = new RegExp(`^(?:${COLOUR_UTILITIES})-(?:(?:${PALETTE})-\\d{2,3}|black|white)(?:/\\S+)?$`);

// Hex, CSS colour functions and Tailwind's `color:` type hint.
const COLOUR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(|^color:/i;

const RADIUS_PROPERTY = /^(?:border(?:-[a-z]+)*-radius)$/;
const SHADOW_PROPERTY = /^(?:box-shadow|text-shadow|filter)$/;
const FONT_PROPERTY = /^(?:font-family|font)$/;

/** Splits `md:hover:bg-red-500` into its last segment, ignoring `:` inside [] and (). */
function utilityOf(cls) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < cls.length; i++) {
    const ch = cls[i];
    if (ch === "[" || ch === "(") depth++;
    else if (ch === "]" || ch === ")") depth--;
    else if (ch === ":" && depth === 0) start = i + 1;
  }
  // `!` (important) may lead or trail; `-` marks a negative value.
  return cls.slice(start).replace(/^!/, "").replace(/!$/, "").replace(/^-/, "");
}

/** Returns a message id when the class hard-codes a design value, else null. */
export function auditClass(cls) {
  const utility = utilityOf(cls);
  if (PALETTE_CLASS.test(utility)) return "palette";

  // Arbitrary property: [border-radius:7px]
  const property = /^\[([a-z-]+):(.+)\]$/.exec(utility);
  if (property) {
    const [, name, value] = property;
    if (RADIUS_PROPERTY.test(name)) return "radius";
    if (SHADOW_PROPERTY.test(name)) return "shadow";
    if (FONT_PROPERTY.test(name)) return "font";
    return COLOUR_LITERAL.test(value) ? "colour" : null;
  }

  // Arbitrary value: rounded-[7px], bg-[#fff], font-[Inter]
  const arbitrary = /^([a-z][a-z0-9-]*)-\[(.+)\]$/.exec(utility);
  if (!arbitrary) return null;
  const [, prefix, value] = arbitrary;
  if (/^rounded(?:-[a-z]+)?$/.test(prefix)) return "radius";
  if (/^(?:inset-)?shadow$|^drop-shadow$|^text-shadow$/.test(prefix)) return "shadow";
  // font-[500] is a weight; anything else is a font family.
  if (prefix === "font" && !/^\d+$/.test(value)) return "font";
  return COLOUR_LITERAL.test(value) ? "colour" : null;
}

const DOCS = "Use a token class instead — see docs/REGISTRY.md (Styling rules).";

const noRawDesignValues = {
  meta: {
    type: "problem",
    docs: { description: "Disallow Tailwind palette classes and arbitrary colour, radius, shadow and font values" },
    schema: [],
    messages: {
      palette: `'{{cls}}' uses Tailwind's built-in palette, not a theme colour. ${DOCS}`,
      colour: `'{{cls}}' hard-codes a colour. ${DOCS}`,
      radius: `'{{cls}}' hard-codes a radius. ${DOCS}`,
      shadow: `'{{cls}}' hard-codes a shadow. ${DOCS}`,
      font: `'{{cls}}' hard-codes a font. ${DOCS}`,
    },
  },
  create(context) {
    function check(node, text) {
      for (const cls of text.split(/\s+/)) {
        if (!cls) continue;
        const messageId = auditClass(cls);
        if (messageId) context.report({ node, messageId, data: { cls } });
      }
    }
    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};

export const plugin = {
  meta: { name: "dashboard-kit" },
  rules: { "no-raw-design-values": noRawDesignValues },
};

/** Flat config block: add after the shared config in packages that ship themed UI. */
export const tokenAudit = {
  files: ["**/*.{ts,tsx}"],
  plugins: { "dashboard-kit": plugin },
  rules: { "dashboard-kit/no-raw-design-values": "error" },
};
