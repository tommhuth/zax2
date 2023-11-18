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
    let getDistanceTo = (value: number, prop: "x" | "y" | "z", threshold = 4.5) => {
        return player ? 1 - clamp(Math.abs(value - player.position[prop]) / threshold, 0, 1) : 0
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

            let opacityAttribute = instance.geometry.attributes.aOpacity as BufferAttribute

            opacityAttribute.set([shimmer.opacity * (1 - clamp(shimmer.time / shimmer.lifetime, 0, 1))], shimmer.index)
            opacityAttribute.needsUpdate = true

            let explodeEffect = shimmer.time > 0 ? easeInQuad(1 - clamp(shimmer.time / (shimmer.lifetime * .25), 0, 1)) : 0
            let scale = (1 - clamp(shimmer.time / shimmer.lifetime, 0, 1)) * shimmer.radius
            let dragEffect = getDistanceTo(shimmer.position.x, "x")
                * getDistanceTo(shimmer.position.y, "y")
                * getDistanceTo(shimmer.position.z, "z")

            shimmer.position.x += shimmer.speed[0] * explodeEffect * d * shimmer.friction * 5
            shimmer.position.y += shimmer.speed[1] * explodeEffect * d * shimmer.friction * 5
            shimmer.position.z += shimmer.speed[2] * explodeEffect * d * shimmer.friction * 5

            shimmer.position.z +=  (dragEffect) * d * 8
            shimmer.position.y -= shimmer.gravity * (1 - explodeEffect) * d
            shimmer.position.y = Math.max(shimmer.position.y, shimmer.radius)

            shimmer.time += d * 1000

            if (shimmer.time < 0) {
                scale = 0
            }

            setMatrixAt({
                instance,
                index: shimmer.index,
                position: shimmer.position.toArray(),
                scale
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