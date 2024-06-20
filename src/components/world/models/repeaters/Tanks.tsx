import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "@assets/models/tanks.glb"
import { GLTFModel } from "src/types.global"

export default function Tanks(props) {
    const { nodes } = useGLTF(model) as GLTFModel<["Cylinder001", "Cylinder001_1", "Cylinder001_2"]>
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