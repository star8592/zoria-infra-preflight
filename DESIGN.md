# Zoria Services — Visual System v2 (2026-10-24)

This static, multilingual-ready English service microsite follows the existing Zoryvia / 3David unified VI rather than inventing independent brand colors.

## Visual foundations
- Background: navy `#070c17`; surface `#10192a`; border `#28364a`.
- Primary action: warm gold `#f6bd66`; supportive technical highlights: cyan `#6ccceb`.
- Max content width 1180px, large editorial headings, restrained diagrams, no stock-photo or decorative KPI claims.
- Responsive at 1060, 760 and 490px, plus an explicit 360px mobile navigation adjustment.
- Keyboard focus rings, descriptive internal links, 48px primary touch targets and reduced-motion support.

## Positioning and integrity
- This is a **technical service inquiry site**, not an approved Upwork Project Catalog store.
- Prices are indicative until a concrete platform contract is confirmed.
- The schematic is expressly illustrative. Technical proof is the owned, public Rust lab project, not employer/customer screenshots or client testimonials.
- Contact and payment are only through the authorized Upwork profile for Upwork-origin clients. No unapproved Upwork automation.

## Visual release acceptance
```bash
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --locked -- -D warnings
node tools/visual-smoke.cjs . /tmp/zoria-visual-qa
```
The last command starts an isolated headless Chrome user profile and uses CDP device emulation for actual CSS viewports (320/390/768/1440px) without interacting with the user's browsers.
Review saved screenshots: home-320.png, home-1440.png, gpu-390.png; all tested pages should have zero horizontal overflow and a visible Upwork inquiry link.

## Avoid
- Unverified performance or customer KPIs; arbitrary green/blue themes that conflict with Zoryvia VI.
- Repeated identical cards or excessive bordered boxes; image-heavy placeholders that look like fake product photos.
- Shipping a page whose CSS or required links have not passed local and public readback checks.
