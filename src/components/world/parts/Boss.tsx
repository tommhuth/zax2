import { startTransition, useEffect } from "react"
import { useStore } from "../../../data/store"
import { BossState, WorldPartBoss } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Boss from "../actors/Boss"

import { useGLTF } from "@react-three/drei"
import { registerBoss, resetBoss, setBossProp } from "../../../data/store/boss"
import Barrel from "../spawner/Barrel" 
import Cable from "../decoration/Cable"
import Dirt from "../decoration/Dirt"
import timeout from "../../../data/timeout"
import { uiTunnel } from "../../ui/tunnels"
import EdgeElement from "../decoration/EdgeElement" 

import model from "@assets/models/floor5.glb" 
import { GLTFModel } from "src/types"

export function BossFloor(props) {
    const { nodes } = useGLTF(model) as GLTFModel<["floor5_1", "floor5_2", "floor5_3"]>
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null}>
            <EdgeElement type="wall2" x={9} z={13} />
            <EdgeElement type="wall3" x={7} z={33} />
            <EdgeElement type="wall3" x={7} z={41} />
            <EdgeElement type="tower1" x={6.5} z={18.5} />
            <EdgeElement type="tower1" x={6.5} z={21.2} />
            <EdgeElement type="tower1" x={6.5} z={24} />

            {/* cylinders */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.floor5_1.geometry}
                material={materials.floorBase}
            />

            {/* cylinders hi */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.floor5_2.geometry}
                material={materials.floorHi}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.floor5_3.geometry}
                material={materials.floorBase}
            /> 
        </group>
    )
}

export default function BossPart({
    id,
    position,
    size,
}: WorldPartBoss) {
    let bossZ = position.z + 23
    let pauseAt = position.z + 5
    let boss = useStore(i => i.boss)
    let level = useStore(i => i.world.level)

    useEffect(() => {
        if (boss.state === BossState.DEAD) {
            timeout(() => {
                setBossProp("state", BossState.OUTRO)
                timeout(() => setBossProp("state", BossState.UNKNOWN), 6_000)
            }, 2000)
        }
    }, [boss.state])

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

            <uiTunnel.In>
                <div
                    className="boss-health"
                    style={{
                        display: boss.state === BossState.ACTIVE ? "block" : "none"
                    }} 
                    key="bosshealth"
                >
                    <div
                        className="boss-health__bar"
                        style={{
                            width: boss ? (boss.health / boss.maxHealth) * 100 + "%" : 0,
                        }}
                    />
                </div>

                <div
                    className={"level"}
                    key="level"
                    style={{
                        display: boss?.state === BossState.OUTRO ? "block" : "none"
                    }}
                >
                    <h1>Level#{level}</h1>
                </div>
            </uiTunnel.In>
        </WorldPartWrapper>
    )
}