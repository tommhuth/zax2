import { useGLTF } from "@react-three/drei"
import { floorColor, floorColorHi } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"
import { Mesh } from "three"

export default function Floor4(props) {
    const { nodes, materials } = useGLTF("/models/floor4.glb")

    return (
        <group {...props} dispose={null}>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005"] as Mesh).geometry}
            >
                <MeshLambertFogMaterial color="white" />
            </mesh>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_1"] as Mesh).geometry}
            >
                <MeshLambertFogMaterial color={floorColorHi} />
            </mesh>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_2"] as Mesh).geometry}
            >
                <MeshLambertFogMaterial color="white" />
            </mesh>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_3"] as Mesh).geometry}
            >
                <MeshLambertFogMaterial color="white" />
            </mesh>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_4"] as Mesh).geometry}
            >
                <MeshLambertFogMaterial color={floorColor} />
            </mesh>
        </group>
    )
}