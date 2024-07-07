import { useLoader } from "@react-three/fiber"
import InstancedMesh from "./InstancedMesh"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import {
    cableColor,
    dirtColor,
    plantColor,
    scrapColor,
} from "../../../data/theme"
import { DoubleSide, FrontSide, Mesh } from "three"
import { MeshRetroMaterial } from "../materials/MeshRetroMaterial"
import { memo } from "react"
import Plant from "./instances/Plant"
import { glsl } from "../../../data/utils"
import scrapModel from "@assets/models/scrap.glb"
import cableModel from "@assets/models/cable.glb"
import dirtModel from "@assets/models/dirt.glb"
import leafModel from "@assets/models/leaf.glb"

function Instances() {
    let [
        scrap, cable, dirt, leaf
    ] = useLoader(GLTFLoader, [
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
                    rightColorIntensity={.5}
                    rightColor="#ffbb00"
                    backColor="#ff0000"
                    backColorIntensity={.4}
                    side={DoubleSide}
                    colorCount={6} 
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
        </>
    )
}

export default memo(Instances)