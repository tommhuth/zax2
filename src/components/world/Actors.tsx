import Barrel from "./actors/Barrel"
import Plane from "./actors/Plane"
import Turret from "./actors/Turret"
import Rocket from "./actors/Rocket"
import { useStore } from "@data/store"

function Turrets() {
    let turrets = useStore(i => i.world.turrets)

    return turrets.map(i => {
        return <Turret key={i.id} {...i} />
    })
}

function Planes() {
    let planes = useStore(i => i.world.planes)

    return planes.map(i => {
        return <Plane key={i.id} {...i} />
    })
}

function Barrels() {
    let barrels = useStore(i => i.world.barrels)

    return barrels.map(i => {
        return <Barrel key={i.id} {...i} />
    })
}

function Rockets() {
    let rockets = useStore(i => i.world.rockets)

    return rockets.map(i => {
        return <Rocket key={i.id} {...i} />
    })
}

export default function Actors() {
    return (
        <>
            <Turrets />
            <Planes />
            <Barrels />
            <Rockets />
        </>
    )
}