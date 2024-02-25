import { Mesh } from "three"
import InstancedMesh from "../InstancedMesh"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { useLoader } from "@react-three/fiber"
import { useStore } from "../../../../data/store"

export default function Barrels() {
    let [barrel1, barrel2, barrel3, barrel4] = useLoader(GLTFLoader, [
        "/models/barrel1.glb",
        "/models/barrel2.glb",
        "/models/barrel3.glb",
        "/models/barrel4.glb",
    ])
    let materials = useStore(i => i.materials)

    return (
        <>
            <InstancedMesh
                name="barrel1"
                count={15}
                castShadow
                receiveShadow
            >
                <primitive
                    object={(barrel1.nodes.barrel as Mesh).geometry}
                    dispose={null}
                    attach="geometry"
                />
                <primitive object={materials.barrel} attach="material" />
            </InstancedMesh>

            <InstancedMesh
                castShadow
                receiveShadow
                name="barrel2"
                count={15}
            >
                <primitive
                    object={(barrel2.nodes.barrel2 as Mesh).geometry}
                    attach="geometry"
                />
                <primitive object={materials.barrel} attach="material" />
            </InstancedMesh>

            <InstancedMesh
                castShadow
                receiveShadow
                name="barrel3"
                count={15}
            >
                <primitive
                    object={(barrel3.nodes.barrel3 as Mesh).geometry}
                    attach="geometry"
                />
                <primitive object={materials.barrel} attach="material" />
            </InstancedMesh>

            <InstancedMesh
                castShadow
                receiveShadow
                name="barrel4"
                count={15}
            >
                <primitive
                    object={(barrel4.nodes.barrel4 as Mesh).geometry}
                    attach="geometry"
                />
                <primitive object={materials.barrel} attach="material" />
            </InstancedMesh>
        </>
    )
}