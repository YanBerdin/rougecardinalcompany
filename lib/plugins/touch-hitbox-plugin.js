/**
 * Tailwind CSS Plugin: Touch Hitbox
 *
 * Provides a stable touch-hitbox (minimum 44x44px) for interactive elements
 * using a ::before pseudo-element, preventing hover trembling when using
 * scale transforms on the visual content.
 *
 * WCAG 2.5.5 Target Size (Level AAA) compliance.
 *
 * Usage:
 * ```html
 * <button class="touch-hitbox overflow-hidden">
 *   <span class="block transition-transform hover:scale-95">
 *     Content
 *   </span>
 * </button>
 * ```
 *
 * @see .github/copilot/touch_hitbox.instructions.md
 */

const plugin = require("tailwindcss/plugin");

module.exports = plugin(function ({ addUtilities }) {
  addUtilities({
    ".touch-hitbox": {
      position: "relative",
    },
    ".touch-hitbox::before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
      height: "100%",
      minWidth: "44px",
      minHeight: "44px",
      zIndex: "0",
    },
  });
});
