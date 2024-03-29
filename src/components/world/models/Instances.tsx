import { useLoader } from "@react-three/fiber"
import InstancedMesh from "./InstancedMesh"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { 
    cableColor,
    deviceColor,
    dirtColor,
    planeColor,
    plantColor,
    platformColor,
    rightColor,
    rocketColor,
    scrapColor,
    turretColor,
} from "../../../data/theme"
import { DoubleSide, FrontSide, Mesh } from "three"
import { MeshRetroMaterial } from "../materials/MeshRetroMaterial"
import { memo } from "react"
import Barrels from "./instances/Barrels"
import Plant from "./instances/Plant" 
import { glsl } from "../../../data/utils" 

function Instances() {
    let [
        turret, rocket, platform, device, 
        scrap, cable, dirt, plane, leaf
    ] = useLoader(GLTFLoader, [
        "/models/turret.glb",
        "/models/rocket.glb",
        "/models/platform.glb",
        "/models/device.glb",
        "/models/scrap.glb",
        "/models/cable.glb",
        "/models/dirt.glb",
        "/models/plane.glb",
        "/models/leaf.glb",
    ])  

    return (
        <>
            <InstancedMesh
                name="plane"
                count={20}
                castShadow
                receiveShadow
            >
                <primitive
                    object={(plane.nodes.plane as Mesh).geometry}
                    dispose={null}
                    attach="geometry"
                />
                <MeshRetroMaterial
                    color={planeColor}
                    name="plane"
                    colorCount={8} 
                    emissive={planeColor}
                    emissiveIntensity={.2}
                    rightColorIntensity={.5}  
                />
            </InstancedMesh>
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
                    colorCount={8} 
                    rightColorIntensity={0}
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
                    colorCount={6}
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
                count={20}
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
                name="turret"
                count={14}
                receiveShadow
                colors
            >
                <primitive
                    object={(turret.nodes.turret2 as Mesh).geometry}
                    attach="geometry"
                />
                <MeshRetroMaterial
                    color={turretColor}
                    name="turret"
                    emissive={turretColor}
                    emissiveIntensity={0.3}
                    rightColorIntensity={.4}
                    backColor="#ff0"
                    backColorIntensity={.7}
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
                    color={rocketColor}
                    name="rocket"
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

            <Barrels />
            <Plant /> 
        </>
    )
}

export default memo(Instances)