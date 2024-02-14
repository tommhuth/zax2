import { useFrame } from "@react-three/fiber"
import { memo, startTransition } from "react" 
import { Particle } from "../../../data/types"
import { ndelta, setColorAt, setMatrixAt } from "../../../data/utils"
import { store } from "../../../data/store"
import { removeParticle } from "../../../data/store/effects"
import { damp } from "three/src/math/MathUtils.js"

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
            let grounded = position.y <= radius + .15
            // haha
            let magnitude = Math.abs(velocity.x) + Math.abs( velocity.z) 

            if (!mounted) {
                setColorAt(instance.mesh, index, color)
                particles[i].mounted = true
            }

            particles[i].time += nd * 1000

            if (time < 0) {
                continue
            }

            // after 15 seconds, kill anyway
            if ((magnitude < .1 && grounded) || time > 15_000) { 
                dead.push(particle)
                continue
            }

            velocity.x += acceleration.x * nd
            velocity.y += acceleration.y * nd
            velocity.z += acceleration.z * nd

            velocity.x = damp(velocity.x, 0, grounded ? 3 : friction , nd)
            velocity.z = damp(velocity.z, 0, grounded ? 3 : friction , nd)

            position.x += velocity.x * nd
            position.y = Math.max(floorY + radius * .25, position.y + velocity.y * nd)
            position.z += velocity.z * nd

            rotation.x += -velocity.x * .075
            rotation.y += -velocity.y * .015
            rotation.z += -velocity.z * .075

            if (position.y <= floorY + radius * .25) {
                velocity.y *= -restitution 
            }

            setMatrixAt({
                instance: instance.mesh,
                index,
                position: position.toArray(),
                scale: radius,
                rotation: rotation.toArray()
            })

        }

        if (dead.length) {
            startTransition(() => removeParticle(dead.map(i => i.id)))
        } 
    })

    return null
}

export default memo(ParticleHandler)