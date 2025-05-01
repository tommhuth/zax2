import { list } from "@data/utils"
import { useStore } from "../../../data/store"
import Line from "./Line"
import Marker from "./Marker"
import { height, width } from "./utils"

export default function Map() {
    let player = useStore(i => i.player.position)
    let planes = useStore(i => i.world.planes)
    let rockets = useStore(i => i.world.rockets)
    let turrets = useStore(i => i.world.turrets)
    let barrels = useStore(i => i.world.barrels)

    return (
        <figure className="map">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="map__objects"
            >
                <Marker targetPosition={player} color="white" />

                {planes.map(i => (
                    <Marker
                        visible={i.health > 0}
                        targetPosition={i.position}
                        key={i.id}
                        color={i.speed === 0 ? "blue" : "orange"}
                    />
                ))}
                {turrets.map(i => (
                    <Marker
                        visible={i.health > 0}
                        targetPosition={i.position}
                        key={i.id}
                        color="orange"
                        offset={[0, 2, 0]}
                    />
                ))}
                {[...rockets, ...barrels].map(i => (
                    <Marker
                        visible={i.health > 0}
                        targetPosition={i.position}
                        key={i.id}
                        color="blue"
                    />
                ))}
            </svg>

            <svg
                className="map__grid"
                viewBox={`0 0 ${width} ${height}`}
            >
                {list(15).map((i, index, list) => {
                    return <Line index={index - list.length * .5} key={index} />
                })}
            </svg>
        </figure>
    )
}