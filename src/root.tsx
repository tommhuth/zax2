import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register" 
import { lazy } from "react"

const App = lazy(() => import("./App"))
const root = createRoot(document.getElementById("canvas") as Element)

root.render(<App />)

registerSW({ 
    onNeedRefresh() {
        alert("New services worker ready")
    },
})