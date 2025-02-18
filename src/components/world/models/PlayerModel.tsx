import { useLayoutEffect, useRef } from "react"
import playerModel from "@assets/models/player.glb"
import { useGLTF } from "@react-three/drei"
import Exhaust from "@components/Exhaust"
import { GLTFModel } from "src/types.global"
import { Group } from "three"
import { useStore } from "@data/store"
import { easeOutExpo } from "@data/shaping"
import animate from "@huth/animate"

export default function PlayerModel({ dead }: { dead: boolean }) {
    let { nodes } = useGLTF(playerModel) as GLTFModel<["player_1", "player_2", "player_3", "player_4"]>
    let innerRef = useRef<Group>(null)
    let hasInitialized = useRef(false)
    let ready = useStore(i => i.ready)
    let diagonal = useStore(i => i.world.diagonal)
    let materials = useStore(i => i.materials)

    // intro anim in
    useLayoutEffect(() => {
        if (!innerRef.current || !ready || !diagonal || hasInitialized.current) {
            return
        }

        hasInitialized.current = true
        innerRef.current.position.z = -diagonal

        return animate({
            from: -diagonal,
            to: 0,
            easing: easeOutExpo,
            duration: 4000,
            delay: 2000,
            render(z) {
                innerRef.current?.position.setComponent(2, z)
            },
        })
    }, [ready, diagonal])

    return (
        <group ref={innerRef}>
            <group
                visible={!dead}
                frustumCulled={false}
            >
                {/* base */}
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.player_1.geometry}
                    material={materials.bossLightBlue}
                />
                {/* top */}
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.player_2.geometry}
                    material={materials.bossBlack}
                />
                {/* back */}
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.player_3.geometry}
                    material={materials.turret}
                />
                {/* edge */}
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.player_4.geometry}
                    material={materials.plane}
                />
            </group>

            <Exhaust
                offset={[0, -.15, -3.35]}
                scale={[.5, .3, 1.6]}
                visible={!dead}
            />

            <pointLight
                distance={80}
                position={[0, -.25, -1.75]}
                intensity={dead ? 0 : 80}
                color={"#ffffff"}
            />
        </group>
    )
}