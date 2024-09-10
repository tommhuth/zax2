import { useGLTF } from "@react-three/drei"
import model from "@assets/models/turret2.glb"
import { GLTFModel } from "src/types.global"
import { useStore } from "@data/store"
import { useEditorObject } from "../data/hooks"

export default function TurretEditor({id}) {
    let { nodes } = useGLTF(model) as GLTFModel<["turret2_1", "turret2_2"]>
    let materials = useStore(i => i.materials)
    let object = useEditorObject(id)

    return (
        <group
            dispose={null}
            position={object.position}
            rotation={[0, -object.rotation + Math.PI * .5, 0]}
        >
            <group>
                <mesh
                    castShadow
                    receiveShadow
                    material={materials.turret}
                >
                    <primitive
                        object={nodes.turret2_1.geometry}
                        attach="geometry"
                    />
                </mesh>
                {/* barrell */}
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.turret2_2.geometry}
                    material={materials.turret}
                />
            </group>
        </group>
    )
}