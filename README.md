# VisualWeightBalancer

Balancing logo “visual weight” in three quick steps
	1.	Level-set the artwork
	•	Convert every logo to flat black on a white background (no antialias halos).
	•	Scale all of them to the same nominal height so you start with comparable footprints.
	2.	Measure each logo’s darkness
	•	In Photoshop: Select ➜ All → Filter ➜ Blur ➜ Average → read the single RGB value in the Info panel.
	•	Convert that to a brightness on a 0-1 scale (e.g. 62 % = 0.62).
	•	Compute darkness = 1 – brightness.
	3.	Compute the scale factors
Pick the darkest logo as your baseline (scale = 1). For every other logo:
s \;=\;\sqrt{\frac{(1-B_{\text{baseline}})\,W_{\text{baseline}}\,H_{\text{baseline}}}
{(1-B)\,W\,H}}
Then resize that logo uniformly by s (width and height).
Example: baseline 36 × 40 px @ 45 % brightness → s = 1
A 82 × 40 px logo @ 62 % brightness → s ≈ 0.80 → new size ≈ 65 × 32 px.
