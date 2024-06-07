import { useLoader } from "@react-three/fiber"
import InstancedMesh from "./InstancedMesh"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { 
    cableColor,
    deviceColor,
    dirtColor, 
    plantColor,
    rightColor,
    scrapColor, 
} from "../../../data/theme"
import { DoubleSide, FrontSide, Mesh } from "three"
import { MeshRetroMaterial } from "../materials/MeshRetroMaterial"
import { memo } from "react" 
import Plant from "./instances/Plant" 
import { glsl } from "../../../data/utils"  
import deviceModel from "@assets/models/device.glb"
import scrapModel from "@assets/models/scrap.glb"
import cableModel from "@assets/models/cable.glb"
import dirtModel from "@assets/models/dirt.glb"
import leafModel from "@assets/models/leaf.glb"

function Instances() {
    let [
        device, scrap, cable, dirt, leaf
    ] = useLoader(GLTFLoader, [  
        deviceModel,
        scrapModel,
        cableModel,
        dirtModel, 
        leafModel,
    ])  

    return (
        <>  
            <Plant />  
            
            <InstancedMesh
                name="leaf"
                count={40}
                castShadow 
            >
                <primitive
                    object={(leaf.nodes.leaf as Mesh).geometry}
                    dispose={null}
                    attach="geometry"
                />
                <MeshRetroMaterial
                    color={plantColor}
                    name="leaf"
                    vertexColors
                    side={DoubleSide}
                    colorCount={6}  
                    rightColorIntensity={.5}
                    rightColor="#ff0"
                />
            </InstancedMesh>

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
                    //colorCount={6}
                    emissive={cableColor}
                    emissiveIntensity={.05}
                />
            </InstancedMesh>

            <InstancedMesh
                name="dirt"
                count={5}
                receiveShadow
            >
                <primitive
                    object={(dirt.nodes.dirt as Mesh).geometry}
                    dispose={null}
                    attach="geometry"
                />
                <MeshRetroMaterial
                    color={dirtColor}
                    name="dirt"
                    emissive={dirtColor}
                    emissiveIntensity={.2}
                />
            </InstancedMesh>

            <InstancedMesh
                name="sphere"
                count={10}
                castShadow
            >
                <sphereGeometry
                    args={[1, 16, 16]}
                    attach="geometry"
                />
                <meshBasicMaterial color="yellow" name="sphere" />
            </InstancedMesh>

            <InstancedMesh
                name="box"
                count={100}
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[1, 1, 1, 1, 1, 1]}
                    attach="geometry"
                />
                <MeshRetroMaterial color={deviceColor} name="box" />
            </InstancedMesh>

            <InstancedMesh
                castShadow
                name="line"
                count={50}
                colors={false}
            >
                <boxGeometry
                    args={[1, 1, 1, 1, 1, 1]}
                    attach="geometry"
                />
                <meshBasicMaterial
                    name="line"
                    color={"white"}
                />
            </InstancedMesh>

            <InstancedMesh
                name="scrap"
                count={50}
                receiveShadow
                colors={true} 
            >
                <primitive
                    object={(scrap.nodes.scrap as Mesh).geometry}
                    dispose={null}
                    attach="geometry"
                />
                <MeshRetroMaterial
                    side={FrontSide}
                    name="scrap"
                    color={scrapColor}
                    shader={{
                        fragment: {
                            main: glsl`
                                gl_FragColor.rgb = mix(gl_FragColor.rgb, vColor, .6); 
                            `
                        }
                    }}
                />
            </InstancedMesh> 

            <InstancedMesh
                name="device"
                count={30}
                receiveShadow
            >
                <primitive
                    object={(device.nodes.device as Mesh).geometry}
                    attach="geometry"
                />
                <MeshRetroMaterial
                    name="device"
                    vertexColors
                    color={deviceColor}
                    backColorIntensity={.0}
                    rightColorIntensity={.97}
                    rightColor={rightColor}

                />
            </InstancedMesh>
        </>
    )
}

export default memo(Instances)