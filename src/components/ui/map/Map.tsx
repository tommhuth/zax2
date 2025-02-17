import { useStore } from "../../../data/store"
import Grid from "./Grid"
import Marker from "./Marker"
import { height, width } from "./utils"

export default function Map() {
    let player = useStore(i => i.player.position)
    let planes = useStore(i => i.world.planes)
    let rockets = useStore(i => i.world.rockets)
    let turrets = useStore(i => i.world.turrets)
    let ready = useStore(i => i.ready)
    let state = useStore(i => i.state)

    return (
        <div
            style={{
                position: "absolute",
                height: 200,
                zIndex: 100000000,
                display: state === "running" && ready ? undefined : "none",
                placeItems: "center",
                placeContent: "center",
                pointerEvents: "none"
            }}
            className="map"
        >
            <svg
                viewBox={`0 0 ${width} ${height}`}
                style={{
                    width: "clamp(8em, 30vw, 350px)",
                    overflow: "visible",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Marker targetPosition={player} color="white" />

                {planes.map(i => i.health > 0 ? <Marker targetPosition={i.position} key={i.id} /> : null)}
                {turrets.map(i => i.health > 0 ? <Marker targetPosition={i.position} key={i.id} color="orange" offset={[0, 2, 0]} /> : null)}
                {rockets.map(i => i.health > 0 ? <Marker targetPosition={i.position} key={i.id} color="blue" /> : null)}
            </svg>

            <Grid />
        </div>
    )
}