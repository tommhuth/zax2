import { clamp, glsl, ndelta, setMatrixAt } from "../../data/utils"
import { useFrame } from "@react-three/fiber"
import InstancedMesh from "../InstancedMesh"
import { startTransition, useMemo } from "react"
import { useStore } from "../../data/store"
import { removeShimmer } from "../../data/store/effects"
import { shimmerColor } from "../../data/theme"
import { useShader } from "../../data/hooks"
import { BufferAttribute } from "three"
import { easeInQuad } from "../../data/shaping"

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
            if (shimmer.time > shimmer.lifetime || shimmer.position.y === shimmer.radius) {
                dead.push(shimmer.id)
                continue
            }

            let scale = (1 - clamp(shimmer.time / shimmer.lifetime, 0, 1)) * shimmer.radius
            let opacityAttribute = instance.geometry.attributes.aOpacity as BufferAttribute
            let explodeEffect = shimmer.time > 0 ? easeInQuad(1 - clamp(shimmer.time / (shimmer.lifetime * .25), 0, 1)) : 0
            let dragEffect = getDistanceTo(shimmer.position.distanceToSquared(player.position))

            opacityAttribute.set([shimmer.opacity * (1 - clamp(shimmer.time / shimmer.lifetime, 0, 1))], shimmer.index)
            opacityAttribute.needsUpdate = true

            shimmer.position.x += shimmer.speed.x * explodeEffect * d * shimmer.friction * 5
            shimmer.position.y += shimmer.speed.y * explodeEffect * d * shimmer.friction * 5
            shimmer.position.z += shimmer.speed.z * explodeEffect * d * shimmer.friction * 5

            shimmer.position.z += (dragEffect) * d * 8
            shimmer.position.y -= shimmer.gravity * (1 - explodeEffect) * d
            shimmer.position.y = Math.max(shimmer.position.y, shimmer.radius)

            shimmer.time += d * 1000

            setMatrixAt({
                instance,
                index: shimmer.index,
                position: shimmer.position.toArray(),
                scale: shimmer.time < 0 ? 0 : scale
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
                transparent
                onBeforeCompile={onBeforeCompile}
            />
            <sphereGeometry args={[1, 6, 6]} >
                <instancedBufferAttribute attach={"attributes-aOpacity"} args={[opacityData, 1, false, 1]} />
            </sphereGeometry>
        </InstancedMesh>
    )
}