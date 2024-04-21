import { startTransition, useEffect } from "react"
import { useStore } from "../../../data/store"
import { BossState, WorldPartBoss } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Boss from "../actors/Boss"

import { useGLTF } from "@react-three/drei"
import { registerBoss, resetBoss, setBossProp } from "../../../data/store/boss"
import Barrel from "../spawner/Barrel"
import Building from "../spawner/Building"
import Cable from "../decoration/Cable"
import Dirt from "../decoration/Dirt" 
import timeout from "../../../data/timeout" 
 
export function BossFloor(props) {
    const { nodes } = useGLTF("/models/floor5.glb") as any
    const materials = useStore(i => i.materials) 

    return (
        <group {...props} dispose={null}>
            {/* cylinders */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.bossfloor_1.geometry}
                material={materials.floorBase}
            />

            {/* cylinders hi */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.bossfloor_2.geometry}
                material={materials.bossLightBlue}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.bossfloor_3.geometry}
                material={materials.buildingHi}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.bossfloor_4.geometry}
                material={materials.buildingBase}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.bossfloor_5.geometry}
                material={materials.floorBase}
            />  
        </group>
    )
} 

useGLTF.preload("/models/floor5.glb")

export default function BossPart({
    id,
    position,
    size,
}: WorldPartBoss) {
    let bossZ = position.z + 23
    let pauseAt = position.z + 5
    let state = useStore(i => i.boss.state) 

    useEffect(() => {
        if (state === BossState.DEAD) {
            timeout(() => {
                setBossProp("state", BossState.OUTRO)
                timeout(() => setBossProp("state", BossState.UNKNOWN), 6_000)
            }, 2000)
        }
    }, [state])

    useEffect(() => {
        startTransition(() => {
            registerBoss({
                pauseAt,
                position: [0, 0, position.z],
            })
        })

        return () => resetBoss()
    }, [])

    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        > 
            <Boss startPosition={[0, 0, bossZ]} />
            <BossFloor position={[9.5, 0, position.z]} />
            
            <Barrel
                position={[6, 0, 15]}
            />
            <Barrel
                position={[5, 0, 32]}
            />
            <Barrel
                position={[5.5, 0, 29]}
            />
            <Building
                position={[0, 0, 1]}
                size={[4, 2, 4]}
            />
            <Cable
                position={[0, 0, 10]}
                scale={1.25}
            />
            <Cable
                position={[-5, 0, 30]}
                scale={1}
                rotation={1.5}
            />
            <Dirt
                position={[3, 0, 32]}
                scale={2}
                rotation={1}
            />
        </WorldPartWrapper>
    )
}