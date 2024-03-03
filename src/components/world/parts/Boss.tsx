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
 
export function Model(props) {
    const { nodes } = useGLTF("/models/floor5.glb") as any
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null} receiveShadow>
            {/* cylinder base */}   
            <mesh
                receiveShadow 
                geometry={nodes.bossfloor_1.geometry}
                material={materials.floorBase}
            />

            {/* cylinder hi */}
            <mesh
                receiveShadow
                geometry={nodes.bossfloor_2.geometry}
                material={materials.bossFloorHi}
            />

            {/* building hi */}
            <mesh
                receiveShadow
                geometry={nodes.bossfloor_3.geometry}
                material={materials.buildingHi}
            />

            {/* coords */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.bossfloor_5.geometry}
                material={materials.bossCable}
            /> 

            {/* floor valley */}
            <mesh 
                receiveShadow
                geometry={nodes.bossfloor_4.geometry}
                material={materials.bossFloorValley}
            />
            {/* hardware */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.bossfloor_6.geometry}
                material={materials.bossHardware}
            />
            {/* rocks */}
            <mesh
                castShadow 
                receiveShadow 
                geometry={nodes.bossfloor_7.geometry}
                material={materials.bossRock}
            />
            {/* edge building */}
            <mesh 
                receiveShadow
                geometry={nodes.bossfloor_8.geometry}
                material={materials.buildingBase} 
            />
            {/* base floor */}
            <mesh 
                receiveShadow
                geometry={nodes.bossfloor_9.geometry}
                material={materials.floorBase} 
            />
            {/* pillars */}
            <mesh 
                receiveShadow
                geometry={nodes.bossfloor_10.geometry}
                material={materials.bossPillar}
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
            return timeout(() => setBossProp("state", BossState.OUTRO), 4000)
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
            <Model position={[10, 0, position.z]} />
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