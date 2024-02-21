import { startTransition, useEffect } from "react"
import { useStore } from "../../../data/store"
import { floorBaseColor, floorFogIntensity } from "../../../data/theme"
import { BossState, WorldPartBoss } from "../../../data/types"
import { glsl } from "../../../data/utils"
import { MeshRetroMaterial } from "../MeshRetroMaterial"
import WorldPartWrapper from "../WorldPartWrapper"
import Boss from "../actors/Boss"

import { useGLTF } from "@react-three/drei"
import { registerBoss, resetBoss, setBossProp } from "../../../data/store/boss"
import Barrel from "../spawner/Barrel"
import Building from "../spawner/Building"
import Cable from "../decoration/Cable"
import Dirt from "../decoration/Dirt"

export function BossFloorMaterial({ color = floorBaseColor, name }) {
    return (
        <MeshRetroMaterial
            usesTime
            color={color} 
            name={name}
            fogDensity={floorFogIntensity}
            colorCount={13} 
            rightColorIntensity={.5}
            fragmentShader={glsl` 
                vec3 t = vec3(uTime, uTime * .25, uTime);
                float n = easeInOutQuad((noise(vGlobalPosition * .25 + t * 1.5) + 1.) / 2.);
                float n2 = easeInOutQuad((noise(vGlobalPosition * .1 + t * 1.) + 1.) / 2.);
                float h = easeInQuad(clamp((-(vGlobalPosition.y + 1.) / 6.), 0., 1.));
                float h2 = easeInQuad(clamp((-(vGlobalPosition.y + 5.5) / 1.5), 0., 1.));
 
                vec3 color = vec3(0., 0., 0.1);
                vec3 highlight = vec3(0., .15, .6); 

                gl_FragColor.rgb = mix(gl_FragColor.rgb, highlight, clamp(n * h + h2, 0., 1.));
                gl_FragColor.rgb = mix(gl_FragColor.rgb, color, n2 * h * 1.);
            `}
        />
    )
}

export function Model(props) {
    const { nodes } = useGLTF("/models/floor5.glb")
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null} receiveShadow>
            <mesh 
                receiveShadow
                castShadow
                geometry={nodes.bossfloor_1.geometry} 
                material={materials.bossFloorBase}
            /> 
            <mesh 
                receiveShadow
                geometry={nodes.bossfloor_2.geometry} 
                material={materials.bossFloorHi}
            />
            <mesh 
                receiveShadow
                geometry={nodes.bossfloor_3.geometry} 
                material={materials.black}
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

    useEffect(()=> {
        if (state === BossState.DEAD) {
            setTimeout(() => setBossProp("state", BossState.OUTRO), 4000)
        }
    }, [state])

    useEffect(() => { 
        startTransition(()=> { 
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
                position={[6,0,15]}
            />
            <Barrel 
                position={[5,0,32]}
            />
            <Barrel 
                position={[5.5,0,29]}
            />
            <Building 
                position={[0,0,1]}
                size={[4, 2, 4]}
            />
            <Cable 
                position={[0,0,10]}
                scale={1.25}
            />
            <Cable 
                position={[-5,0,30]}
                scale={1}
                rotation={1.5}
            />
            <Dirt 
                position={[0,0,12]}
                scale={3}
                rotation={1.5} 
            />
        </WorldPartWrapper>
    )
}