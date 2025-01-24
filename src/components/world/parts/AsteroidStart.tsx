import { useGLTF } from "@react-three/drei"
import { WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import { ComponentPropsWithoutRef, useMemo, useRef } from "react"
import { GLTFModel, Tuple3 } from "src/types.global"
import { useStore } from "@data/store"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Group } from "three"
import model from "@assets/models/asteroid.glb"

export default function AsteroidStart({
    id,
    position,
    size,
}: WorldPart) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Asteroid position={[3, 0, size[1] + position.z]} />
        </WorldPartWrapper>
    )
}

useGLTF.preload(model)

interface Rock {
    position: Tuple3
    speed: number
    id: string
    rotation: Tuple3
    scale: number
}

export function Asteroid(props: ComponentPropsWithoutRef<"group">) {
    let { nodes } = useGLTF(model) as GLTFModel<["Plane001", "Plane001_1", "Plane001_2"]>
    let materials = useStore(i => i.materials)
    let ref = useRef<Group>(null)
    let rockCount = 35
    let rocks = useMemo<Rock[]>(() => {
        return Array.from({ length: rockCount })
            .fill(null)
            .map(() => {
                return {
                    position: [
                        random.float(-15, 15),
                        random.float(-1, -6),
                        random.float(-25, -11),
                    ],
                    scale: random.float(.1, 1.5),
                    id: random.id(),
                    speed: random.float(.35, .65) * random.pick(1, -1),
                    rotation: [
                        random.float(0, Math.PI * 2),
                        random.float(0, Math.PI * 2),
                        random.float(0, Math.PI * 2)
                    ],
                }
            })
    }, [rockCount])

    useFrame((state, delta) => {
        if (!ref.current) {
            return
        }

        for (let [index, rock] of rocks.entries()) {
            let mesh = ref.current.children[index]

            rock.rotation[0] += rock.speed * delta
            rock.rotation[1] += rock.speed * delta

            mesh.rotation.set(...rock.rotation)
        }
    })

    return (
        <group {...props} dispose={null}>
            <group ref={ref}>
                {rocks.map((rock) => {
                    return (
                        <mesh
                            key={rock.id}
                            position={rock.position}
                            scale={rock.scale}
                            castShadow
                            receiveShadow
                            geometry={nodes.Plane001_2.geometry}
                            material={materials.asteroid}
                        />
                    )
                })}
            </group>


            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane001_1.geometry}
                material={materials.floorBase}
            />
            <mesh
                geometry={nodes.Plane001.geometry}
                material={materials.asteroid}
                castShadow
                receiveShadow
            />
        </group>
    )
}