# CineBook UI design contract

Scope: public navigation, home, movie catalogue, and shared movie cards/loading states.
Reference: the existing CineBook charcoal and ticket-yellow design system. No external visual references were supplied; preserve these colours and the existing Bootstrap layout conventions.

The home page helps visitors discover a film and start booking. Its primary action opens now-showing movies; coming-soon films have a separate destination. Use an available movie for the spotlight and a cinema illustration when the catalogue is unavailable. Do not advertise unsupported cinema formats.

The catalogue supports shareable status and search parameters, browser history, explicit selection states, result counts, loading skeletons, empty messages, and recoverable errors. Failed requests must not appear as an empty catalogue. Navigation uses native links/buttons, a responsive disclosure, Escape dismissal, and a skip link. Interactive controls receive visible keyboard focus. Honour reduced-motion preferences.

At 320px use two compact poster columns and a collapsible navigation. At 768px use three columns; at 1024px expand navigation; at 1440px use four columns. The home introduction stacks at mobile widths. Avoid gradient-heavy panels, excessive rounding, unsupported feature claims, and hover-only actions.

Visual changes are isolated in src/styles/experience.css, loaded after the existing stylesheet.

## Colour contract

Use three colour families throughout the customer and admin interfaces: ticket yellow for primary actions, selection and confirmed states; charcoal for page/surface depth; white and neutral text for content and secondary controls. Poster artwork is content and keeps its original colours. Printing and QR codes retain black/white contrast.

`src/styles/tokens.css` owns colour literals and Bootstrap aliases. Components and existing styles reference semantic variables; `src/styles/theme.css` aligns Bootstrap controls, forms and utilities with custom components. Do not add local hex/RGB values to page components.

The reference screens for this consistency pass are the existing public catalogue, printed/digital ticket, and admin dashboard. Preserve their layout and information hierarchy. Use flat charcoal surfaces, a yellow primary action, restrained borders, and neutral secondary actions. Avoid adding red, green, blue or purple status palettes.

State must remain understandable without colour: labels and icons identify paid/pending/failed states, dashed borders mark pending/invalid notices, unavailable seats are disabled with struck-through numbers, and labelled chart rows retain their values. Yellow buttons use charcoal text; yellow text appears on dark surfaces. Errors retain explicit messages, alerts and their existing confirmation flows.

## Responsive admin controls

Filter rows use a grid with shrinkable tracks. Native selects, including options with long movie/screening names, must be constrained to `width: 100%; max-width: 100%; min-width: 0`. Search fields must not keep a desktop flex basis as their height when stacked. The admin shell must not clip overflow to disguise controls that exceed their panel.

At phone widths, filters stack in one column, controls/buttons have at least a 44px target height, and long header names can wrap. Dense data tables keep readable column widths and scroll inside their own focusable region. The bookings table includes a mobile swipe hint. Verify actual control bounds against the viewport, as well as document width, using long names/options at 320, 360, 375, 390, 414, 640, 768, 1024 and 1440px. Check opened scheduling/screen forms as well as populated lists.
