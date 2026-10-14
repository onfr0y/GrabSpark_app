# Menu Lab — Business Simulation

A runnable, mobile-first implementation inspired by the supplied three-screen iPhone mock-up. The green and white interface has a menu form, live results and scenario analysis. On mobile, step buttons switch screens; on wide displays, all three panels appear together.

## Run locally

For the easiest launch, open `standalone.html` directly in a browser. It bundles the same application without module-loading restrictions. The default simulation period is one trading day, matching the reference.


No package installation, API key or build is required. In this folder run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765 in a browser. Keep the terminal running; Ctrl+C stops the server. Serve through HTTP rather than double-clicking index.html because the app uses JavaScript modules. If port 8765 is occupied, choose another port.

With Node installed, `npm start` runs the same server and `npm test` runs the calculation tests. There are no third-party runtime dependencies, external fonts, analytics, network requests for calculations or AI services. Inputs remain in page memory and reset on reload.

## Deploy

Upload `index.html`, `style.css`, `app.mjs` and `model.mjs` together to any static web host with HTTPS. Set the publishing directory to this folder, with no build command. Ensure `.mjs` files are served with a JavaScript MIME type (for example `text/javascript`). No backend, environment variables or database are required. This deliverable has not been publicly deployed.

## Calculation definitions

Contribution per order = selling price − variable cost per order. Daily contribution = contribution per order × expected orders per trading day. Total contribution = daily contribution × selected trading days. Contribution after setup = total contribution − one-off setup expense. Revenue and variable costs in the comparison table use that same period.

Whole orders needed to recover setup = ceiling(setup expense / positive contribution per order). Estimated days to recover setup = setup expense / positive daily contribution. This duration assumes orders arrive steadily at the entered daily rate; the feedback also reports complete trading days rounded upwards. Recovery can extend beyond the selected simulation period. Zero setup requires zero recovery days. Positive setup is not recoverable with zero daily contribution or negative contribution; zero sales likewise prevent recovery.

Currency inputs support two decimal places. Contribution subtraction and whole-order recovery use integer satang to avoid spurious rounding at exact recovery boundaries. Display values are rounded to two decimal places. Simulation periods are trading days, not calendar days.

Low/base/high scenarios vary daily orders only, using base × (1 − variation), base and base × (1 + variation), rounded to whole orders. The default variation is ±50%; the slider allows 0–100%. No likelihood is attached to a scenario. Price, variable cost and setup remain unchanged. All sales are assumed to be collected and per-order costs incurred within the period; this is not a cash-flow timing model.

These results are **not net profit**. Rent, fixed wages, financing, tax and other unentered expenses remain excluded. Include ingredients, packaging and per-order commissions in variable cost. Do not count them again as setup expenses. Guidance is deterministic educational feedback, not an AI prediction or personalised financial recommendation.

For the supplied example (฿75 price, ฿43 variable cost, 20 daily orders, ฿640 setup), contribution per order is ฿32, daily contribution is ฿640, setup recovery needs 20 orders or one trading day. Seven-day contribution is ฿4,480 and contribution after setup is ฿3,840. One-day low/base/high outcomes after setup are −฿320, ฿0 and ฿320, correcting the inconsistent high-case value in the image.

## Accessibility and verification

Labelled native inputs, keyboard-operable sliders/buttons, visible focus indicators, a skip link, semantic regions/headings, input validation, live result announcements and a data table support use without relying on chart colours. Chart values can be explored using the day slider and scenario buttons. No animation is required.

The reference-inspired revision adds numbered input sections, a menu illustration, pale green contribution cards, blue setup-recovery metrics and an expanded comparison table. The financial model is unchanged.

Ten Node tests cover default totals, consistent scenario periods, fractional recovery, whole-order rounding, decimal currency, zero sales, zero setup, non-positive margins and invalid inputs. Browser checks covered 390-pixel mobile and 1440-pixel desktop layouts, scenario selection, comparison table, educational feedback, negative contribution, blank-input rejection, reset and one-day totals. The 320-pixel layout was also checked for horizontal overflow and keyboard day-slider behaviour. These checks are not a full screen-reader or cross-browser audit.

## Files

`index.html` defines the interface, `style.css` defines responsive styling, `app.mjs` handles interaction and SVG charts, `model.mjs` contains pure calculations, and `model.test.mjs` contains automated tests.

## Revision verification and GitHub hand-off

The redesigned revision passes all ten calculation tests and JavaScript syntax checks. Earlier browser checks listed above apply to the first interface. A fresh browser check of this revision was blocked: local-server permission was rejected and the in-app browser does not permit file URLs. Open `standalone.html` to review the latest interface locally.

The project repository is https://github.com/onfr0y/GrabSpark_app.
