import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

export default function Tanks(props) {
    const { nodes } = useGLTF("/models/tanks.glb")
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null}>
            <group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cylinder001.geometry}
                    material={materials.buildingBase}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cylinder001_1.geometry}
                    material={materials.bossBlue}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cylinder001_2.geometry}
                    material={materials.buildingHi}
                />
            </group>
        </group>
    )
}

useGLTF.preload("/models/tanks.glb")