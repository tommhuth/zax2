import dither from "../../shaders/dither.glsl"
import easings from "../../shaders/easings.glsl"
import { InstancedMesh, Vector3 } from "three"
import random from "@huth/random"
import { useMemo, useRef } from "react"
import { clamp, glsl, setMatrixAt, setMatrixNullAt } from "../../data/utils"
import { useFrame } from "@react-three/fiber"
import { store } from "../../data/store"
import { Tuple3 } from "../../types"
import { useShader } from "../../data/hooks"
import Counter from "../../data/world/Counter"

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

interface Smoke {
    id: string
    position: Tuple3
    velocity: Tuple3
    time: number
    index: number
    radius: number
    maxRadius: number
    grow: number
    groundAnimationDuration: number 
}
 
let _vec3 = new Vector3()

function randomDirection() {
    return _vec3.set(random.float(-1, 1), 0, random.float(-1, 1)).normalize().toArray()
}

export default function SmokeHandler() {
    let instanceRef = useRef<InstancedMesh>(null)
    let count = 300
    let index = useMemo(()=> new Counter(count), [count])
    let smokes = useRef<Smoke[]>([])
    let lastEmitted = useMemo<Record<string, number>>(() => ({}), [])
    let shader = useShader({
        vertex: {
            head: glsl` 
                varying vec3 vGlobalPosition;  
            `,
            main: glsl` 
                vec4 globalPosition = instanceMatrix * vec4(position, 1.);

                vGlobalPosition = globalPosition.xyz;  
            `
        },
        fragment: {
            head: glsl`
                varying vec3 vGlobalPosition;

                ${dither}
                ${easings} 
            `,
            main: glsl`
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 16., .005);
                gl_FragColor.a = easeOutQuad(clamp(vGlobalPosition.y / .75, 0., 1.));
            `
        }
    })

    useFrame(() => {
        let smokeInterval = random.integer(15, 30)
        let { rockets } = store.getState().world

        for (let { position, health, id } of rockets) {
            let smokeAt = lastEmitted[id] || 0

            if (Date.now() - smokeAt > smokeInterval && position.y > 1 && position.y < 8 && health > 0) {
                let velocity = randomDirection()

                lastEmitted[id] = Date.now()
                smokes.current = [
                    {
                        id: random.id(),
                        time: 0,
                        index: index.next(),
                        radius: random.float(.15, .35), 
                        maxRadius: random.float(.35, 2),
                        grow: random.float(.25, .5),
                        groundAnimationDuration: random.integer(300, 1500),
                        velocity: [
                            velocity[0] * random.float(2, 3.5),
                            -random.float(4, 6),
                            velocity[2] * random.float(2, 3.5),
                        ],
                        position: [
                            position.x + random.float(-.1, .1),
                            position.y - 1,
                            position.z + random.float(-.1, .1)
                        ]
                    },
                    ...smokes.current
                ]
            }
        }
    })

    useFrame((state, delta) => {
        if (!instanceRef.current) {
            return
        }

        for (let smoke of smokes.current) {
            let { radius, index, position, velocity, id } = smoke

            if (smoke.radius < .05) {
                setMatrixNullAt(instanceRef.current, index)
                smokes.current = smokes.current.filter(i => i.id !== id)

                continue
            }

            let heightMovementEffect = 1 - easeInOutCubic(clamp(position[1] / 3, 0, 1))
            let groundMovementEffect = 1 - easeInOutCubic(clamp(smoke.time / smoke.groundAnimationDuration, 0, 1)) 
            let shrinkEffect = 1 - clamp((smoke.time - 2000) / (smoke.groundAnimationDuration * 1.5), 0, 1)

            position[0] += velocity[0] * delta * groundMovementEffect * heightMovementEffect
            position[1] = Math.max(position[1] + velocity[1] * delta, 0) 
            position[2] += velocity[2] * delta * groundMovementEffect * heightMovementEffect 

            velocity[0] += .8 * delta
            velocity[1] += .4 * delta
            velocity[2] += .8 * delta

            smoke.radius += .3 * delta + delta * smoke.grow * (1 - groundMovementEffect) +  delta * .35 * (1 - heightMovementEffect)
            smoke.radius *= shrinkEffect
            smoke.radius = Math.min(smoke.radius, smoke.maxRadius)

            if (position[1] === 0) { 
                smoke.time += delta * 1000
            }

            setMatrixAt({
                instance: instanceRef.current,
                index,
                position,
                scale: radius,
            })
        }
    })

    return (
        <instancedMesh ref={instanceRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshLambertMaterial
                transparent
                color="#cbecff"
                emissive={"#fff"}
                emissiveIntensity={.65}
                dithering
                onBeforeCompile={shader.onBeforeCompile}
            />
        </instancedMesh>
    )
}