import { useInstance } from "../../InstancedMesh"
import { Building, InstancedName } from "../../../data/types"
import random from "@huth/random"
import { buildingBase } from "../../../data/theme"

export default function Building({ size, position }: Building) {
    let type: InstancedName = size[1] > 1 ? "device" : "device"

    useInstance(type, {
        color: buildingBase,
        scale: size,
        position,
        rotation: [
            random.pick(0, Math.PI),
            size[0] === size[2] ? random.pick(0, Math.PI * .5, Math.PI * 1.5) : random.pick(0, Math.PI),
            random.pick(0, Math.PI),
        ]
    })

    return null
}