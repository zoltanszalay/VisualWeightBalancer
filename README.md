# Balancing Logo Visual Weight in Three Quick Steps

This method helps you achieve optically balanced logo sizes, especially when displaying multiple logos (e.g. in client carousels or partner sections).

---

## 1. Level-set the Artwork

- Convert every logo to **flat black on a white background** (avoid anti-aliasing halos).
- Scale all logos to the **same nominal height** so you begin with comparable footprints.

---

## 2. Measure Each Logo’s Darkness

In Photoshop:

- Select ➜ **All**
- Go to ➜ **Filter → Blur → Average**
- Read the **single RGB value** in the **Info** panel.
- Convert that to **brightness** on a 0–1 scale  
  _(e.g. 62% brightness = 0.62)_
- Then compute:  
  **darkness** = `1 – brightness`

---

## 3. Compute the Scale Factors

Pick the **darkest logo** as your baseline (`scale = 1`).  
For every other logo, use the formula:

```math
s = √[ (1 - B₀) × W₀ × H₀ ÷ (1 - B) × W × H ]
