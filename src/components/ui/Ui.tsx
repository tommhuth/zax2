import { startTransition } from "react"
import { useStore } from "../../data/store"
import { setState } from "../../data/store/utils"
import { useWindowEvent } from "../../data/hooks"
import Map from "./map/Map"
import Debug from "./Debug"
import { uiTunnel } from "./tunnels"

import "./Ui.scss"

export default function Ui() {
    let state = useStore(i => i.state)
    let ready = useStore(i => i.ready) 
    let qs = new URLSearchParams(location.search)

    useWindowEvent(["click", "touchstart"], () => {
        if (state === "intro" && ready) {
            startTransition(() => setState("running"))
        }
    }, [ready, state])

    return (
        <>
            <Map />  
            <uiTunnel.Out />
            
            {qs.has("debug") ? <Debug /> : null}
            {!qs.has("editor") ?  <div id="shoot" /> : null}
        </>
    )
}