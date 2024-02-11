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


export function BossFloorMaterial({ color = floorBaseColor, name }) {
    return (
        <MeshRetroMaterial
            usesTime
            color={color}
            isInstance={false}
            name={name}
            fogDensity={floorFogIntensity}
            colorCount={12} 
            rightColorIntensity={.5}
            fragmentShader={glsl` 
                vec3 t = vec3(uTime, uTime * .25, uTime);
                float n = easeInOutQuad((noise(vGlobalPosition * .25 + t * 1.5) + 1.) / 2.);
                float n2 = easeInOutQuad((noise(vGlobalPosition * .1 + t * 1.) + 1.) / 2.);
                float h = easeInQuad(clamp((-(vGlobalPosition.y + 1.) / 6.), 0., 1.));
                float h2 = easeInQuad(clamp((-(vGlobalPosition.y + 5.5) / 1.5), 0., 1.));

                /*
                gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(.0, 0.7, 1.), clamp(n * h + h2, 0., 1.));
                gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(.0, .01, .8), n2 * h * .57);
                */

                gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0., .2, 1.0), clamp(n * h + h2, 0., 1.) * 1.);
                gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1., 1., 1.) , n2 * h * 1.);
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
    let bossZ = position.z + 20 
    let pauseAt = position.z + 3 
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
        </WorldPartWrapper>
    )
}