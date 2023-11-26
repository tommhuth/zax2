import { useInstance } from "../../InstancedMesh"
import { Building, InstanceName } from "../../../data/types"
import random from "@huth/random"
import { buildingBase } from "../../../data/theme"
import { intersect } from "../BulletHandler"
import { setLastImpactLocation } from "../../../data/store/player"
import { createParticles } from "../../../data/store/effects"
import { useBulletCollision } from "../../../data/hooks"
import { store } from "../../../data/store"

export default function Building({ size, id, position }: Building) {
    let type: InstanceName = size[1] > 1 ? "device" : "device"

    useBulletCollision({
        name: "bulletcollision:building",
        handler: ({ detail: { bullet, movement, client } }) => { 
            if ( client.data.id !== id) {
                return 
            }
            
            let {instances} = store.getState()
            let intersection = intersect(instances.device.mesh, bullet.position, movement)

            if (intersection?.face) {
                setLastImpactLocation(...intersection.point.toArray())
                createParticles({
                    position: intersection.point.toArray(),
                    positionOffset: [[0, 0], [0, 0], [0, 0]],
                    speed: [7, 14],
                    speedOffset: [[-2, 2], [-2, 2], [-2, 2]],
                    normal: intersection.face.normal.toArray(),
                    count: [1, 2],
                    radius: [.1, .2],
                    friction: [.8, .95],
                    color: "#fff",
                })
            }
        }
    })

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