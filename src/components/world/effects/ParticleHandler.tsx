import { useFrame } from "@react-three/fiber"
import { memo, startTransition } from "react" 
import { Particle } from "../../../data/types"
import { ndelta, setColorAt, setMatrixAt } from "../../../data/utils"
import { store } from "../../../data/store"
import { removeParticle } from "../../../data/store/effects"
import { damp } from "three/src/math/MathUtils.js"
import InstancedMesh from "../models/InstancedMesh"
import { MeshRetroMaterial } from "../materials/MeshRetroMaterial"

function ParticleHandler() { 
    let floorY = 0

    useFrame((state, delta) => {
        let { particles } = store.getState().effects
        let dead: Particle[] = []
        let nd = ndelta(delta)

        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i]
            let {
                position, velocity, radius, acceleration,
                friction, restitution, index, instance,
                mounted, color, rotation, time
            } = particle 
            let grounded = position[1] <= radius + .15
            // haha
            let magnitude = Math.abs(velocity[0]) + Math.abs(velocity[2]) 

            if (!mounted) {
                setColorAt(instance.mesh, index, color)
                particles[i].mounted = true
            }

            particles[i].time += nd * 1000

            if (time < 0) {
                continue
            }

            // after 15 seconds, kill anyway
            if ((magnitude < .1 && grounded) || time > 10_000) { 
                dead.push(particle)
                continue
            }

            velocity[0] += acceleration[0] * nd
            velocity[1] += acceleration[1] * nd
            velocity[2] += acceleration[2] * nd

            velocity[0] = damp(velocity[0], 0, grounded ? 3 : friction , nd)
            velocity[2] = damp(velocity[2], 0, grounded ? 3 : friction , nd)

            position[0] += velocity[0] * nd
            position[1] = Math.max(floorY + radius * .25, position[1] + velocity[1] * nd)
            position[2] += velocity[2] * nd

            rotation[0] += -velocity[0] * .075
            rotation[1] += -velocity[1] * .015
            rotation[2] += -velocity[2] * .075

            if (position[1] <= floorY + radius * .25) {
                velocity[1] *= -restitution 
            }

            setMatrixAt({
                instance: instance.mesh,
                index,
                position,
                scale: radius,
                rotation,
            }) 
        }

        if (dead.length) {
            startTransition(() => removeParticle(dead.map(i => i.id)))
        } 
    })

    return ( 
        <InstancedMesh
            name="particle"
            count={100}
            castShadow
            colors
        >
            <sphereGeometry
                args={[1, 3, 4]}
                attach="geometry"
            />
            <MeshRetroMaterial name="particle" />
        </InstancedMesh>
    )
}

export default memo(ParticleHandler)