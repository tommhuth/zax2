import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { cableColor } from "@data/theme"
import { Mesh } from "three"
import cableModel from "@assets/models/cable.glb"
import InstancedMesh from "../InstancedMesh"
import { MeshRetroMaterial } from "@components/world/materials/MeshRetroMaterial"

export default function Cable() {
    let cable = useLoader(GLTFLoader, cableModel)

    return (
        <InstancedMesh
            name="cable"
            count={4}
            castShadow
            receiveShadow
        >
            <primitive
                object={(cable.nodes.cable as Mesh).geometry}
                dispose={null}
                attach="geometry"
            />
            <MeshRetroMaterial
                color={cableColor}
                name="cable"
                emissive={cableColor}
                rightColorIntensity={.8}
                emissiveIntensity={.5}
            />
        </InstancedMesh>
    )
}