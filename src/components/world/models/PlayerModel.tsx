import { useLayoutEffect, useRef } from "react"
import playerModel from "@assets/models/player.glb"
import { useGLTF } from "@react-three/drei"
import Exhaust from "@components/Exhaust"
import { useLoader } from "@react-three/fiber"
import { GLTFModel } from "src/types.global"
import { TextureLoader, AdditiveBlending, Group } from "three"
import { MeshRetroMaterial } from "../materials/MeshRetroMaterial"
import { useStore } from "@data/store"
import { easeOutExpo } from "@data/shaping"
import animate from "@huth/animate"

export default function PlayerModel({ dead }: { dead: boolean }) {
    let { nodes } = useGLTF(playerModel) as GLTFModel<["player"]>
    let glow = useLoader(TextureLoader, "/textures/glow.png")
    let innerRef = useRef<Group>(null)
    let ready = useStore(i => i.ready)
    let diagonal = useStore(i => i.world.diagonal)

    // intro anim in
    useLayoutEffect(() => {
        if (!innerRef.current) {
            return
        }

        innerRef.current.position.z = -diagonal

        if (ready) {
            return animate({
                from: -diagonal,
                to: 0,
                easing: easeOutExpo,
                duration: 4000,
                delay: 2000,
                render(z) {
                    if (!innerRef.current) {
                        return
                    }

                    innerRef.current.position.z = z
                },
            })
        }
    }, [ready, diagonal])

    return (
        <group ref={innerRef}>
            <mesh
                receiveShadow
                castShadow
                visible={!dead}
            >
                <MeshRetroMaterial
                    name="player"
                    attach={"material"}
                    color={"orange"}
                    colorCount={3}
                />
                <primitive object={nodes.player.geometry} attach="geometry" />
            </mesh>

            <mesh
                scale={[3.5, 6, 1]}
                rotation-x={-Math.PI * .5}
                position={[0, -.25, -.7]}
                visible={!dead}
            >
                <planeGeometry args={[1, 1, 1, 1]} />
                <meshBasicMaterial
                    map={glow}
                    transparent
                    depthWrite={false}
                    opacity={.2}
                    blending={AdditiveBlending}
                />
            </mesh>

            <Exhaust
                offset={[0, -.15, -3.35]}
                scale={[.5, .3, 1.6]}
                visible={!dead}
            />

            <pointLight
                distance={80}
                position={[0, .1, -1.75]}
                intensity={dead ? 0 : 80}
                color={"#ffffff"}
            />
        </group>
    )
}