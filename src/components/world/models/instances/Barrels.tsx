import { Mesh } from "three"
import { barellcolor, barrellEmissiveIntensity } from "../../../../data/theme"
import { MeshRetroMaterial } from "../../MeshRetroMaterial"
import InstancedMesh from "../InstancedMesh"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { useLoader } from "@react-three/fiber"

export default function Barrels() {
    let [
        barrel1, barrel2, barrel3, barrel4, 
    ] = useLoader(GLTFLoader, [
        "/models/barrel1.glb",
        "/models/barrel2.glb",
        "/models/barrel3.glb",
        "/models/barrel4.glb", 
    ])

    return (
        <>
            <InstancedMesh name="barrel1" count={15}>
                <primitive object={(barrel1.nodes.barrel as Mesh).geometry} dispose={null} attach="geometry" />
                <MeshRetroMaterial
                    fogDensity={.35}
                    name="barrel1"
                    fogHeight={.6}
                    color={barellcolor}
                    emissive={barellcolor}
                    emissiveIntensity={barrellEmissiveIntensity}
                />
            </InstancedMesh>

            <InstancedMesh name="barrel2" count={15}>
                <primitive object={(barrel2.nodes.barrel2 as Mesh).geometry} attach="geometry" />
                <MeshRetroMaterial
                    fogDensity={.35}
                    name="barrel2"
                    color={barellcolor}
                    fogHeight={.6}
                    emissive={barellcolor}
                    emissiveIntensity={barrellEmissiveIntensity}
                />
            </InstancedMesh>

            <InstancedMesh name="barrel3" count={15}>
                <primitive object={(barrel3.nodes.barrel3 as Mesh).geometry} attach="geometry" />
                <MeshRetroMaterial
                    fogDensity={.35}
                    name="barrel3"
                    color={barellcolor}
                    fogHeight={.6}
                    emissive={barellcolor}
                    emissiveIntensity={barrellEmissiveIntensity}
                />
            </InstancedMesh>

            <InstancedMesh name="barrel4" count={15}>
                <primitive object={(barrel4.nodes.barrel4 as Mesh).geometry} attach="geometry" />
                <MeshRetroMaterial
                    fogDensity={.35}
                    name="barrel4"
                    color={barellcolor}
                    emissive={barellcolor}
                    fogHeight={.6}
                    emissiveIntensity={barrellEmissiveIntensity}
                />
            </InstancedMesh>
        </>
    )
}