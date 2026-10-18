# CineBook UI design contract

Scope: public navigation, home, movie catalogue, and shared movie cards/loading states.
Reference: the existing CineBook charcoal and ticket-yellow design system. No external visual references were supplied; preserve these colours and the existing Bootstrap layout conventions.

The home page helps visitors discover a film and start booking. Its primary action opens now-showing movies; coming-soon films have a separate destination. Use an available movie for the spotlight and a cinema illustration when the catalogue is unavailable. Do not advertise unsupported cinema formats.

The catalogue supports shareable status and search parameters, browser history, explicit selection states, result counts, loading skeletons, empty messages, and recoverable errors. Failed requests must not appear as an empty catalogue. Navigation uses native links/buttons, a responsive disclosure, Escape dismissal, and a skip link. Interactive controls receive visible keyboard focus. Honour reduced-motion preferences.

At 320px use two compact poster columns and a collapsible navigation. At 768px use three columns; at 1024px expand navigation; at 1440px use four columns. The home introduction stacks at mobile widths. Avoid gradient-heavy panels, excessive rounding, unsupported feature claims, and hover-only actions.

Visual changes are isolated in src/styles/experience.css, loaded after the existing stylesheet.
