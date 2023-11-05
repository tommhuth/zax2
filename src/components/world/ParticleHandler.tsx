import { useFrame, useThree } from "@react-three/fiber"
import { memo, startTransition } from "react" 
import { Particle } from "../../data/types"
import { ndelta, setColorAt, setMatrixAt } from "../../data/utils"
import { store } from "../../data/store"
import { removeParticle } from "../../data/store/effects"

function ParticleHandler() {
    let { viewport } = useThree()
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)
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
                mounted, color, rotation
            } = particle

            if (!mounted) {
                setColorAt(instance.mesh, index, color)
                particles[i].mounted = true
            }

            if (particle.lifetime > particle.maxLifetime || position.z > diagonal * .75) {
                dead.push(particle)
                continue
            }

            position.x += velocity.x * nd
            position.y = Math.max(floorY + radius * .25, position.y + velocity.y * nd)
            position.z += velocity.z * nd

            velocity.x *= friction
            velocity.z *= friction

            velocity.x += acceleration.x * nd
            velocity.y += acceleration.y * nd
            velocity.z += acceleration.z * nd

            rotation.x += -velocity.x * .075
            rotation.y += -velocity.y * .01
            rotation.z += -velocity.z * .075

            if (position.y <= floorY + radius * .25) {
                velocity.y *= -restitution
                position.y = floorY + radius * .25
            }

            setMatrixAt({
                instance: instance.mesh,
                index,
                position: position.toArray(),
                scale: radius,
                rotation: rotation.toArray()
            })

            particles[i].lifetime++
        }

        if (dead.length) {
            startTransition(() => removeParticle(dead.map(i => i.id)))
        }
    })

    return null
}

export default memo(ParticleHandler)