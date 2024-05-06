import { Mesh } from "three"
import { useStore } from "../../../data/store"
import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { useWorldPart } from "../WorldPartWrapper" 

export default function Grass({ position, ...props }) { 
    let materials = useStore(i => i.materials) 
    let [grass] = useLoader(GLTFLoader, ["/models/grass.glb"]) 
    let partPosition = useWorldPart() 
 
    return ( 
        <mesh 
            dispose={null}
            position={[position[0], position[1], position[2] + partPosition[2]]}
            scale-y={1.75}
            {...props}
        >
            <primitive object={(grass.nodes.grass as Mesh).geometry} attach="geometry" />
            <primitive object={materials.grass} attach="material" />
        </mesh>
    )
} 

useLoader.preload(GLTFLoader, "/models/grass.glb")