import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { plantColor } from "@data/theme"
import { DoubleSide, Mesh } from "three"
import leafModel from "@assets/models/leaf.glb"
import InstancedMesh from "../InstancedMesh"
import { MeshRetroMaterial } from "@components/world/materials/MeshRetroMaterial"

export default function Leaf() {
    let leaf = useLoader(GLTFLoader, leafModel)

    return (
        <InstancedMesh
            name="leaf"
            count={40}
            castShadow
            receiveShadow
        >
            <primitive
                object={(leaf.nodes.leaf as Mesh).geometry}
                dispose={null}
                attach="geometry"
            />
            <MeshRetroMaterial
                color={plantColor}
                name="leaf"
                vertexColors
                rightColorIntensity={.5}
                rightColor="#ffbb00"
                backColor="#ff0000"
                backColorIntensity={.4}
                side={DoubleSide}
                colorCount={6}
            />
        </InstancedMesh>
    )
}