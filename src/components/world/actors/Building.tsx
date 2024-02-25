import { useInstance } from "../models/InstancedMesh"
import { Building, InstanceName } from "../../../data/types"
import random from "@huth/random" 
import { createParticles } from "../../../data/store/effects" 
import { useCollisionDetection } from "../../../data/collisions"

export default function Building({ size, id, position }: Building) {
    let type: InstanceName = size[1] > 1 ? "device" : "device"

    useCollisionDetection({ 
        actions: {
            bullet: ({ client, intersection, normal, type }) => {
                if (client.data.id !== id || type !== "building") {
                    return
                } 
      
                createParticles({
                    position: intersection, 
                    speed: [7, 14], 
                    normal,
                    count: [1, 2],
                    stagger: [0,0],
                    radius: [.1, .2], 
                    color: "#fff",
                }) 
            }
        } 
    })

    useInstance(type, { 
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