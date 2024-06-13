import { GLTFModel } from "src/types"
import { useStore } from "../../../data/store"
import { useWorldPart } from "../WorldPartWrapper" 
import model from "@assets/models/grass.glb" 
import { useGLTF } from "@react-three/drei"

export default function Grass({ position }) { 
    let materials = useStore(i => i.materials) 
    let { nodes } = useGLTF( model)  as GLTFModel<["grass"]>
    let partPosition = useWorldPart() 
 
    return ( 
        <mesh
            castShadow
            receiveShadow
            geometry={nodes.grass.geometry}
            material={materials.grass} 
            dispose={null}
            position={[position[0], position[1], position[2] + partPosition[2]]}
            scale-y={1.75}
        /> 
    )
} 