import { useInstance } from "../models/InstancedMesh"
import { Building, InstanceName } from "../../../data/types"
import random from "@huth/random"
import { buildingBaseColor } from "../../../data/theme"
import { setLastImpactLocation } from "../../../data/store/player"
import { createParticles } from "../../../data/store/effects" 
import { useBulletCollision } from "../../../data/collisions"

export default function Building({ size, id, position }: Building) {
    let type: InstanceName = size[1] > 1 ? "device" : "device"

    useBulletCollision({
        name: "bulletcollision:building",
        handler: ({ detail: { client, intersection, normal } }) => {
            if (client.data.id !== id) {
                return
            } 
 
            setLastImpactLocation(...intersection)
            createParticles({
                position: intersection,
                positionOffset: [[0, 0], [0, 0], [0, 0]],
                speed: [7, 14],
                speedOffset: [[-2, 2], [-2, 2], [-2, 2]],
                normal,
                count: [1, 2],
                radius: [.1, .2],
                friction: [.8, .95],
                color: "#fff",
            }) 
        }
    })

    useInstance(type, {
        color: buildingBaseColor,
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