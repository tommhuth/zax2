import { useLoader } from "@react-three/fiber"
import InstancedMesh from "./InstancedMesh"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import {
    deviceColor,
    groundFogIntensity,
    platformColor,
    turretColor,
} from "../../../data/theme"
import { FrontSide, Mesh } from "three"
import { MeshRetroMaterial } from "../MeshRetroMaterial"
import { memo } from "react"
import Barrels from "./instances/Barrels"
import Plant from "./instances/Plant"
import Grass from "./instances/Grass"
import Exhaust from "./instances/Exhaust"
import { glsl } from "../../../data/utils"

function Instances() {
    let [turret2, rocket, platform, device, scrap, cable, dirt] = useLoader(GLTFLoader, [
        "/models/turret2.glb",
        "/models/rocket.glb",
        "/models/platform.glb",
        "/models/device.glb",
        "/models/scrap.glb",
        "/models/cable.glb",
        "/models/dirt.glb",
    ])

    return (
        <>
            <InstancedMesh
                name="cable"
                count={5}
                castShadow
                receiveShadow
            >
                <primitive
                    object={(cable.nodes.cable as Mesh).geometry}
                    dispose={null}
                    attach="geometry"
                />
                <MeshRetroMaterial 
                    color={"#0022dd"}
                    name="cable"
                    colorCount={6}
                    emissive={"#0022dd"} 
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
                    color={"#0022dd"}
                    name="dirt"
                    emissive={"#0022dd"} 
                    emissiveIntensity={.2}
                />
            </InstancedMesh>
            <InstancedMesh
                name="sphere"
                count={100}
                castShadow 
            >
                <sphereGeometry
                    args={[1, 3, 4]}
                    attach="geometry"
                />
                <MeshRetroMaterial name="sphere" />
            </InstancedMesh>
            <InstancedMesh
                name="box"
                count={20}
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[1, 1, 1, 1, 1, 1]}
                    attach="geometry"
                />
                <meshLambertMaterial color={"white"} name="box" />
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
                    isInstance={true}
                    color={"white"}
                    fragmentShader={glsl`
                        gl_FragColor.rgb = mix(gl_FragColor.rgb, vColor, .85);
                     
                     `}
                />
            </InstancedMesh>

            <InstancedMesh
                name="turret"
                count={15}
                receiveShadow
            >
                <primitive
                    object={(turret2.nodes.turret2 as Mesh).geometry}
                    attach="geometry"
                />
                <MeshRetroMaterial
                    color={turretColor}
                    name="turret"
                    emissive={turretColor}
                    emissiveIntensity={0.4}
                    fogDensity={0.65}
                    fogHeight={0.6}
                    backColor="#ffff00"
                    backColorIntensity={0}
                />
            </InstancedMesh>

            <InstancedMesh
                name="rocket"
                count={8}
                castShadow={false}
            >
                <primitive
                    object={(rocket.nodes.rocket as Mesh).geometry}
                    attach="geometry"
                />
                <MeshRetroMaterial
                    emissive={turretColor}
                    emissiveIntensity={0.4}
                    name="rocket"
                    color={turretColor}
                />
            </InstancedMesh>

            <InstancedMesh
                name="platform"
                count={8}
                receiveShadow
            >
                <primitive
                    object={(platform.nodes.platform as Mesh).geometry}
                    attach="geometry"
                />
                <MeshRetroMaterial
                    color={platformColor}
                    name="platform"
                    fogDensity={0.4}
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
                    color={deviceColor}
                    fogDensity={groundFogIntensity}
                    backColorIntensity={.2}
                    rightColorIntensity={.7}
                    rightColor="#20f"
                />
            </InstancedMesh>

            <Barrels />
            <Plant />
            <Grass />
            <Exhaust />
        </>
    )
}

export default memo(Instances)
