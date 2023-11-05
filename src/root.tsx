import { createRoot } from "react-dom/client"
// import { Workbox } from "workbox-window"

// import Config from "./data/Config"
import { lazy } from "react"

const App = lazy(() => import("./App"))
const root = createRoot(document.getElementById("canvas"))

root.render(<App />)

/*
if (Config.REGISTER_SERVICEWORKER) {
    let worker = new Workbox("/serviceworker.js")

    worker.addEventListener("installed", e => {
        alert(`Service worker ${e.isUpdate ? "updated" : "installed"}`)
    })
    worker.register()
}
*/