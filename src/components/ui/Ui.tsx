import { useStore } from "../../data/store"
import Map from "./map/Map"
import Debug from "./Debug"
import { uiTunnel } from "./tunnels"

import "./Ui.scss"

export default function Ui() {
    let qs = new URLSearchParams(location.search)
    let ready = useStore(i => i.ready)
    let state = useStore(i => i.state)

    return (
        <>
            <Map />
            <uiTunnel.Out />
            {ready && state === "intro" && <Intro />}

            {qs.has("debug") ? <Debug /> : null}
            {!qs.has("editor") ? <div id="shoot" /> : null}
        </>
    )
}

function Intro() {
    return (
        <div className="intro">
            Tap to start
        </div>
    )
}