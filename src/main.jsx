import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

// Bootstrap CSS (imported before global to allow overrides)
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"

// Global styles
import "./styles/global.css"

import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
