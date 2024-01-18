import { clamp, glsl, ndelta, setAttribute, setMatrixAt } from "../../../data/utils"
import { useFrame } from "@react-three/fiber"
import InstancedMesh from "../models/InstancedMesh"
import { startTransition, useMemo } from "react"
import { useStore } from "../../../data/store"
import { removeShimmer } from "../../../data/store/effects"
import { shimmerColor } from "../../../data/theme"
import { useShader } from "../../../data/hooks"
import { BufferAttribute } from "three"
import { easeInQuad } from "../../../data/shaping"

export default function ShimmerHandler() {
    let instance = useStore(i => i.instances.shimmer?.mesh)
    let player = useStore(i => i.player.object)
    let count = 100
    let opacityData = useMemo(() => new Float32Array(count).fill(0), [])
    let getDistanceTo = (length: number, threshold = 4) => {
        return 1 - clamp(length / threshold, 0, 1)
    }
    let { onBeforeCompile } = useShader({
        vertex: {
            head: glsl`
                varying float vOpacity;
                attribute float aOpacity;
            `,
            main: glsl`
                vOpacity = aOpacity;
            `
        },
        fragment: {
            head: glsl` 
                varying float vOpacity;
            `,
            main: glsl`
                gl_FragColor.a = vOpacity;
            `
        }
    })

    useFrame((state, delta) => {
        if (!instance || !player) {
            return
        }

        let shimmers = useStore.getState().effects.shimmer
        let d = ndelta(delta)
        let dead: string[] = []

        for (let shimmer of shimmers) {
            let {
                time, lifetime, position, radius,
                speed, friction, gravity, id, index, opacity
            } = shimmer

            if (time > lifetime || position.y === radius) {
                dead.push(id)
                continue
            }

            let scale = (1 - clamp(time / lifetime, 0, 1)) * radius
            let explodeEffect = time > 0 ? easeInQuad(1 - clamp(time / (lifetime * .25), 0, 1)) : 0
            let dragEffect = getDistanceTo(position.distanceToSquared(player.position))

            position.x += speed.x * explodeEffect * d * friction * 5
            position.y += speed.y * explodeEffect * d * friction * 5
            position.z += speed.z * explodeEffect * d * friction * 5

            position.z += (dragEffect) * d * 8
            position.y -= gravity * (1 - explodeEffect) * d
            position.y = Math.max(position.y, radius)

            shimmer.time += d * 1000

            setAttribute(instance.geometry, "aOpacity", opacity * (1 - clamp(time / lifetime, 0, 1)), index)
            setMatrixAt({
                instance,
                index: index,
                position: position.toArray(),
                scale: time < 0 ? 0 : scale
            })
        }

        if (dead.length) {
            startTransition(() => removeShimmer(dead))
        }
    })

    return (
        <InstancedMesh
            castShadow={false}
            receiveShadow={false}
            name="shimmer"
            count={count}
            colors={false}
        >
            <meshBasicMaterial
                attach={"material"}
                color={shimmerColor}
                name="shimmer"
                transparent
                onBeforeCompile={onBeforeCompile}
            />
            <sphereGeometry args={[1, 6, 6]} >
                <instancedBufferAttribute attach={"attributes-aOpacity"} args={[opacityData, 1, false, 1]} />
            </sphereGeometry>
        </InstancedMesh>
    )
}