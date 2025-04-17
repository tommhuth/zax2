import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"
import { lazy } from "react"

const Zaxx = lazy(() => import("./Zaxx"))
const Editor = lazy(() => import("./Editor"))
const root = createRoot(document.getElementById("canvas") as Element)

if (window.location.hash.includes("editor")) {
    document.title = "ZaxEditor"
    root.render(<Editor />)
} else {
    root.render(<Zaxx />)
}

let updateSW = registerSW({
    onNeedRefresh() {
        console.log("New services worker ready")
        updateSW(true)
    },
    onOfflineReady() {
        alert("Ready to work offline")
    },
})