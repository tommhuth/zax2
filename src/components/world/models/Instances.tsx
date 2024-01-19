import { useLoader } from "@react-three/fiber"
import InstancedMesh from "./InstancedMesh"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { deviceColor, groundFogIntensity, platformColor, turretColor } from "../../../data/theme"
import { FrontSide, Mesh } from "three"
import { MeshRetroMaterial } from "../MeshRetroMaterial"
import { memo } from "react"
import Barrels from "./instances/Barrels"
import Plant from "./instances/Plant"
import Grass from "./instances/Grass"
import Exhaust from "./instances/Exhaust"

function Instances() {
    let [
        turret2, rocket, platform, device, scrap
    ] = useLoader(GLTFLoader, [
        "/models/turret2.glb",
        "/models/rocket.glb",
        "/models/platform.glb",
        "/models/device.glb",
        "/models/scrap.glb",
    ])

    return (
        <> 
            <InstancedMesh
                name="sphere"
                count={100}
                castShadow={false}
                receiveShadow={false}
            >
                <sphereGeometry args={[1, 3, 4]} attach="geometry" />
                <MeshRetroMaterial
                    name="sphere"
                />
            </InstancedMesh>

            <InstancedMesh name="line" count={50} colors={false}>
                <boxGeometry args={[1, 1, 1, 1, 1, 1]} attach="geometry" />
                <meshBasicMaterial name="line" color={"white"} />
            </InstancedMesh>

            <InstancedMesh name="scrap" count={50} colors={true}>
                <primitive object={(scrap.nodes.scrap as Mesh).geometry} dispose={null} attach="geometry" />
                <MeshRetroMaterial side={FrontSide} name="scrap" color={"white"} />
            </InstancedMesh>

            <InstancedMesh name="turret" count={15}>
                <primitive object={(turret2.nodes.turret2 as Mesh).geometry} attach="geometry" />
                <MeshRetroMaterial
                    color={turretColor}
                    name="turret"
                    emissive={turretColor}
                    emissiveIntensity={.4}
                    fogDensity={.65}
                    fogHeight={.6}
                />
            </InstancedMesh>

            <InstancedMesh name="rocket" count={8} castShadow={false}>
                <primitive object={(rocket.nodes.rocket as Mesh).geometry} attach="geometry" />
                <MeshRetroMaterial
                    emissive={turretColor}
                    emissiveIntensity={.4}
                    name="rocket"
                    color={turretColor}
                />
            </InstancedMesh>

            <InstancedMesh name="platform" count={8}>
                <primitive object={(platform.nodes.platform as Mesh).geometry} attach="geometry" />
                <MeshRetroMaterial
                    color={platformColor}
                    name="platform"
                    fogDensity={.4}
                />
            </InstancedMesh>

            <InstancedMesh name="device" castShadow={false} count={30}>
                <primitive object={(device.nodes.device as Mesh).geometry} attach="geometry" />
                <MeshRetroMaterial
                    name="device"
                    color={deviceColor}
                    fogDensity={groundFogIntensity}
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