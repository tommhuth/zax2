import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { dirtColor } from "@data/theme"
import { Mesh } from "three"
import dirtModel from "@assets/models/dirt.glb"
import InstancedMesh from "../InstancedMesh"
import { MeshRetroMaterial } from "@components/world/materials/MeshRetroMaterial"

export default function Dirt() {
    let dirt = useLoader(GLTFLoader, dirtModel)

    return ( 
        <InstancedMesh
            name="dirt"
            count={5}
            castShadow
            receiveShadow
        >
            <primitive
                object={(dirt.nodes.dirt as Mesh).geometry}
                dispose={null}
                attach="geometry"
            />
            <MeshRetroMaterial
                color={dirtColor}
                name="dirt"
                emissive={dirtColor}
                emissiveIntensity={.2}
            />
        </InstancedMesh>
    )
}