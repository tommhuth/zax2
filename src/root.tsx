import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register" 
import { lazy } from "react"

const App = lazy(() => import("./App"))
const root = createRoot(document.getElementById("canvas") as Element)

root.render(<App />)

let updateSW = registerSW({ 
    onNeedRefresh() {
        console.log("New services worker ready")
        updateSW(true) 
    },
    onOfflineReady() {
        alert("Ready to work offline")
    },
})