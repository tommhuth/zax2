import { memo } from "react"
import Plant from "./instances/Plant"
import Cable from "./instances/Cable"
import Dirt from "./instances/Dirt"
import Leaf from "./instances/Leaft"
import Scrap from "./instances/Scrap"
import Sphere from "./instances/Sphere"

function Instances() { 
    return (
        <>
            <Plant />
            <Cable />
            <Dirt />
            <Leaf />
            <Scrap />
            <Sphere />
        </>
    )
}

export default memo(Instances)