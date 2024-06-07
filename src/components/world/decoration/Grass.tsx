import { useStore } from "../../../data/store"
import { useWorldPart } from "../WorldPartWrapper" 
import model from "@assets/models/grass.glb" 
import { useGLTF } from "@react-three/drei"

export default function Grass({ position, ...props }) { 
    let materials = useStore(i => i.materials) 
    const { nodes } = useGLTF( model) 
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