import { WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import EdgeElement from "../decoration/EdgeElement"
import Barrel from "../spawner/Barrel"
import Dirt from "../decoration/Dirt"
import { useGLTF } from "@react-three/drei"
import { MeshRetroMaterial } from "../materials/MeshRetroMaterial"
import { useStore } from "../../../data/store"
import Cable from "../decoration/Cable"
import model from "@assets/models/logo.glb"
import Plant from "../actors/Plant"
import { GLTFModel } from "src/types.global"

function Logo(props) {
    const { nodes } = useGLTF(model) as GLTFModel<["Text"]>

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text.geometry}
            >
                <MeshRetroMaterial color="#fff" emissive={"#fff"} emissiveIntensity={.4} />
            </mesh>
        </group>
    )
}

export default function Start({
    id,
    position,
    size,
}: WorldPart) {
    const materials = useStore(i => i.materials)

    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Plant
                position={[-1, 0, 6]}
                scale={1}
            />
            <Plant
                position={[5, 0, 6]}
                scale={1.1}
            />
            <Cable
                position={[-4, 0, 35]}
                scale={1.25}
                rotation={.5}
            />

            <Barrel position={[3, 0, 29]} />

            <Dirt
                position={[-4, 0, 30]}
                scale={2}
                rotation={2.985}
            />

            <EdgeElement
                type="tanks"
                position={[6, 0, 24]}
                rotation={-Math.PI * .5}
            />
            <EdgeElement
                type="tanks"
                position={[6, 0, 20]}
            />
            <EdgeElement
                type="tanks"
                position={[-6, 0, 6]}
            />
            <EdgeElement
                type="tanks"
                position={[6, 0, -12]}
                rotation={Math.PI * .75}
            />
            <EdgeElement
                type="tanks"
                position={[-6, 0, -12]}
                rotation={Math.PI * -.75}
            />

            <Logo
                position={[3, .15 + 2 * .125, position.z + 5]}
                scale={[5, 1.5, 5]}
                rotation={[0, -Math.PI * .5, 0]}
            />

            <mesh
                position={[0, -.5, position.z + size[1] / 2 - 15]}
                receiveShadow
                material={materials.floorBase}
            >
                <boxGeometry args={[30, 1, size[1] + 10 + 20 + 20, 1, 1]} />
            </mesh>
        </WorldPartWrapper>
    )
} 