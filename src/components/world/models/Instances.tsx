import { useLoader } from "@react-three/fiber"
import InstancedMesh from "../../InstancedMesh"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { barellcolor, barrellEmissiveIntensity, deviceColor, grassColor, grassColorEnd, grassColorStart, groundFogIntensity, plantColor, plantColorEnd, plantColorStart, platformColor, turretColor } from "../../../data/theme"
import { DoubleSide, Mesh } from "three"
import { glsl } from "../../../data/utils"
import { MeshLambertFogMaterial } from "../MeshLambertFogMaterial"

export default function Instances() {
    let [
        barrel1, barrel2, barrel3, barrel4,
        turret2, rocket, platform, device, plant, grass,
    ] = useLoader(GLTFLoader, [
        "/models/barrel1.glb",
        "/models/barrel2.glb",
        "/models/barrel3.glb",
        "/models/barrel4.glb",
        "/models/turret2.glb",
        "/models/rocket.glb",
        "/models/platform.glb",
        "/models/device.glb",
        "/models/plant.glb",
        "/models/grass.glb"
    ])

    return (
        <>
            <InstancedMesh name="box" count={30}>
                <boxGeometry args={[1, 1, 1, 1, 1, 1]} attach="geometry" />
                <MeshLambertFogMaterial />
            </InstancedMesh>

            <InstancedMesh name="sphere" count={100}>
                <sphereGeometry args={[1, 3, 4]} attach="geometry" />
                <MeshLambertFogMaterial />
            </InstancedMesh>

            <InstancedMesh name="line" count={35} colors={false}>
                <boxGeometry args={[1, 1, 1, 1, 1, 1]} attach="geometry" />
                <meshBasicMaterial color={"white"} />
            </InstancedMesh> 

            <InstancedMesh name="barrel1" count={25}>
                <primitive object={(barrel1.nodes.barrel as Mesh).geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    fogDensity={.35}
                    fogHeight={.6}
                    color={barellcolor}
                    emissive={barellcolor}
                    emissiveIntensity={barrellEmissiveIntensity}
                />
            </InstancedMesh>

            <InstancedMesh name="barrel2" count={25}>
                <primitive object={(barrel2.nodes.barrel2 as Mesh).geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    fogDensity={.35}
                    color={barellcolor}
                    fogHeight={.6}
                    emissive={barellcolor}
                    emissiveIntensity={barrellEmissiveIntensity}
                />
            </InstancedMesh>

            <InstancedMesh name="barrel3" count={25}>
                <primitive object={(barrel3.nodes.barrel3 as Mesh).geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    fogDensity={.35}
                    color={barellcolor}
                    fogHeight={.6}
                    emissive={barellcolor}
                    emissiveIntensity={barrellEmissiveIntensity}
                />
            </InstancedMesh>

            <InstancedMesh name="barrel4" count={25}>
                <primitive object={(barrel4.nodes.barrel4 as Mesh).geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    fogDensity={.35}
                    color={barellcolor}
                    emissive={barellcolor}
                    fogHeight={.6}
                    emissiveIntensity={barrellEmissiveIntensity}
                />
            </InstancedMesh>

            <InstancedMesh name="turret" count={25}>
                <primitive object={(turret2.nodes.turret2 as Mesh).geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    color={turretColor}
                    emissive={turretColor}
                    emissiveIntensity={.4}
                    fogDensity={.65}
                    fogHeight={.6}
                />
            </InstancedMesh>

            <InstancedMesh name="rocket" count={15} castShadow={false}>
                <primitive object={(rocket.nodes.rocket as Mesh).geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    emissive={turretColor}
                    emissiveIntensity={.4}
                    color={turretColor}
                />
            </InstancedMesh>

            <InstancedMesh name="platform" count={15}>
                <primitive object={(platform.nodes.platform as Mesh).geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    color={platformColor}
                    fogDensity={.4}
                />
            </InstancedMesh>

            <InstancedMesh name="device" castShadow={false} count={30}>
                <primitive object={(device.nodes.device as Mesh).geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    color={deviceColor}
                    fogDensity={groundFogIntensity}
                />
            </InstancedMesh>

            <InstancedMesh
                name="plant"
                count={10}
                receiveShadow={false}
                castShadow={true}
            >
                <primitive object={(plant.nodes.plant as Mesh).geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    usesTime
                    usesPlayerPosition
                    fogDensity={groundFogIntensity}
                    color={plantColor}
                    side={DoubleSide}
                    vertexShader={glsl`
                        float height = 2.75;
                        float heightScale = easeInQuad(clamp(position.y / height, 0., 1.));
                        float offsetSize = .3;
                        float timeScale = 16.;

                        transformed.x += cos((globalPosition.x) * .5 + uTime * timeScale) * heightScale * offsetSize;
                        transformed.x += sin((globalPosition.x) * .4 + uTime * timeScale) * heightScale * offsetSize * 1.1;

                        transformed.z += cos((globalPosition.z) * .35 + uTime * timeScale) * heightScale * offsetSize;
                        transformed.z += sin((globalPosition.z) * .24 + uTime * timeScale) * heightScale * offsetSize * 1.15 ;

                        transformed.y += cos((globalPosition.y) * .35 + uTime * timeScale) * heightScale * offsetSize * .5;
                        transformed.y += cos((globalPosition.y) * .3 + uTime * timeScale) * heightScale * offsetSize * 1.25 * .5;  
                    `}
                    fragmentShader={glsl`
                        vec3 start = mix(gl_FragColor.rgb, vec3(${plantColorStart.toArray().map(i => i + .001).join(", ")}), .7);
                        vec3 end = mix(gl_FragColor.rgb, vec3(${plantColorEnd.toArray().map(i => i + .001).join(", ")}), .5);
 
                        gl_FragColor.rgb = mix(start, end, easeOutCubic(clamp(length(vPosition) / 5., 0., 1.))) * 1.25;
                    `}
                />
            </InstancedMesh>
            <InstancedMesh
                name="grass"
                castShadow={false}
                receiveShadow={false}
                colors={false}
                count={4}
            >
                <primitive object={(grass.nodes.grass as Mesh).geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    usesTime
                    color={grassColor}
                    side={DoubleSide}
                    usesPlayerPosition
                    fogDensity={0}
                    dither={false}
                    transparent
                    vertexShader={glsl`
                        float height = 1.75;
                        float heightScale = easeInQuad(clamp(position.y / height, 0., 1.));
                        float offsetSize = .4;
                        float timeScale = 8.;
                        vec3 playerPosition = vec3(uPlayerPosition.x, vGlobalPosition.y, uPlayerPosition.z);
                        vec3 offsetNormal = normalize(vGlobalPosition - playerPosition);
                        float playerRadius = 6.;
                        float offsetEffect = 1. - clamp(length(playerPosition - vGlobalPosition) / playerRadius, 0., 1.);
                        float offsetHeightEffect = 1. - clamp((uPlayerPosition.y - 1.) / (height * 2. - 1.), 0., 1.);

                        transformed += offsetNormal 
                            * easeInCubic(offsetEffect) 
                            * easeOutCubic(offsetHeightEffect) 
                            * clamp(position.y / height, 0., 1.) 
                            * 2.; 

                        transformed.x += cos((globalPosition.x) * .5 + uTime * timeScale) * heightScale * offsetSize;
                        transformed.x += cos((globalPosition.z) * .4 + uTime * timeScale) * heightScale * 1.1 * offsetSize; 
                    `}
                    fragmentShader={glsl`
                        float height = 2.25;
                        vec3 start = mix(gl_FragColor.rgb, vec3(${grassColorStart.toArray().map(i => i + .001).join(", ")}), .2);
                        vec3 end = mix(gl_FragColor.rgb, vec3(${grassColorEnd.toArray().map(i => i + .001).join(", ")}), .8);

                        gl_FragColor.rgb = mix(start, end, easeInQuad(clamp(vGlobalPosition.y / height, 0., 1.)));
                        gl_FragColor.a = clamp((vPosition.y) / .75, 0., 1.);
                    `}
                />
            </InstancedMesh>
        </>
    )
}