import { WorldPartStart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Barrel from "../spawner/Barrel"
import Dirt from "../decoration/Dirt"
import { useGLTF } from "@react-three/drei"
import { MeshRetroMaterial } from "../materials/MeshRetroMaterial"
import { useStore } from "../../../data/store"
import Cable from "../decoration/Cable"

export default function Start({
    id,
    position,
    size,
}: WorldPartStart) {
    const materials = useStore(i => i.materials)

    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
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

            <EdgeBuilding
                type="tanks"
                z={34}
                x={6}
                rotation={-Math.PI * .5}
            />
            <EdgeBuilding
                type="tanks"
                z={20}
                x={6}
            />
            <EdgeBuilding
                type="tanks"
                z={6}
                x={-6}
            />
            <EdgeBuilding
                type="tanks"
                z={-12}
                x={6}
                rotation={Math.PI * .75}
            />
            <EdgeBuilding
                type="tanks"
                z={-12}
                x={-6}
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

useGLTF.preload("/models/logo.glb")

function Logo(props) {
    const { nodes } = useGLTF("/models/logo.glb") as any

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text.geometry}
                material={nodes.Text.material}
            >
                <MeshRetroMaterial color="#fff" emissive={"#fff"} emissiveIntensity={.4} />
            </mesh>
        </group>
    )
}