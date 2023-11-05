import { clamp, ndelta, setMatrixAt } from "../../data/utils"
import { useFrame } from "@react-three/fiber"
import InstancedMesh from "../InstancedMesh"
import { startTransition } from "react"
import { useStore } from "../../data/store"
import { removeShimmer } from "../../data/store/effects"
import { explosionMidColor, shimmerColor } from "../../data/theme"

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function easeInQuad(x: number): number {
    return x * x
}

export default function ShimmerHandler() {
    let instance = useStore(i => i.instances.shimmer?.mesh)
    let player = useStore(i => i.player.object)
    let getDistanceTo = (value: number, prop: "x" | "y" | "z", threshold = 3.5) => {
        return player ? 1 - clamp(Math.abs(value - player.position[prop]) / threshold, 0, 1) : 0
    } 

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

            let explodeEffect = shimmer.time > 0 ? easeInQuad(1 - clamp(shimmer.time / (shimmer.lifetime * .25), 0, 1)) : 0
            let scale = (1 - clamp(shimmer.time / shimmer.lifetime, 0, 1)) * shimmer.radius
            let dragEffect = getDistanceTo(shimmer.position.x, "x")
                * getDistanceTo(shimmer.position.y, "y")
                * getDistanceTo(shimmer.position.z, "z")

            shimmer.position.x += shimmer.speed[0] * explodeEffect * d * shimmer.friction * 5
            shimmer.position.y += shimmer.speed[1] * explodeEffect * d * shimmer.friction * 5
            shimmer.position.z += shimmer.speed[2] * explodeEffect * d * shimmer.friction * 5

            shimmer.position.z -= easeInOutCubic(dragEffect) * d * 5
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
            count={100}
            colors={false}
        >
            <meshBasicMaterial
                attach={"material"}
                color={shimmerColor}
            />
            <sphereGeometry args={[1, 6, 6]} />
        </InstancedMesh>
    )
}