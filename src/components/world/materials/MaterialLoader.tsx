import { ReactElement, ReactNode, cloneElement, memo, startTransition, useCallback, useMemo } from "react"
import { barellColor, buildingBaseColor, buildingHiColor, floorBaseColor, floorHiColor, floorMarkColor, planeColor, platformColor, rocketColor, turretColor } from "../../../data/theme"
import { MeshRetroMaterial } from "./MeshRetroMaterial"
import { BoxGeometry, BufferGeometry, Material, Mesh } from "three"
import { setMaterial } from "../../../data/store/utils"
import { MaterialName } from "../../../data/types"
import ExhaustMaterial from "./ExhaustMaterial"
import GrassMaterial from "./GrassMaterial"
import { glsl } from "../../../data/utils"

function MaterialLoader() {
    let materials: Record<MaterialName, ReactNode> = useMemo(() => {
        return {
            rocket: (
                <MeshRetroMaterial
                    color={rocketColor}
                    name="rocket"
                />
            ),
            platform: (
                <MeshRetroMaterial
                    color={platformColor}
                    name="rocket"
                />
            ),
            plane: (
                <MeshRetroMaterial
                    color={planeColor}
                    name="plane"
                    colorCount={5}
                    emissive={planeColor}
                    emissiveIntensity={.2}
                    rightColorIntensity={.5}
                    rightColor="#f00"
                    backColor="#f00"
                    backColorIntensity={.1}
                    dither={.005}
                />
            ),
            turret: (
                <MeshRetroMaterial
                    color={turretColor}
                    name="turret"
                    emissive={turretColor}
                    emissiveIntensity={0.3}
                    rightColorIntensity={.5}
                    backColor="#f00"
                    backColorIntensity={.1}
                    colorCount={8}
                    dither={.005}
                    shader={{
                        shared: glsl`
                        varying float vTrauma;
                    `,
                        vertex: {
                            head: glsl`
                            attribute float aTrauma;
                        `,
                            main: glsl`
                                vTrauma = aTrauma;
                                /*
                                transformed += normalize(vec3(position.x, 0., position.z)) 
                                    * .25 
                                    * random(globalPosition.xz + uTime) 
                                    * aTrauma ;
                                    * */
                            `
                        },
                        fragment: {
                            main: glsl`
                            gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.), vTrauma);
                        `
                        }
                    }}
                />
            ),
            barrel: (
                <MeshRetroMaterial
                    backColorIntensity={.0}
                    color={barellColor}
                    rightColorIntensity={.5}
                    rightColor="#f00"
                    emissive={barellColor}
                    emissiveIntensity={.2}
                    additionalShadowStrength={0}
                />
            ),
            buildingBase: (
                <MeshRetroMaterial
                    backColorIntensity={.4}
                    color={buildingBaseColor}
                    rightColorIntensity={.9}
                    rightColor="#f00"
                    emissive={buildingBaseColor}
                    emissiveIntensity={.0}
                />
            ),
            buildingDark: (
                <MeshRetroMaterial
                    backColorIntensity={.0}
                    color={"#005"}
                    rightColorIntensity={.1}
                    rightColor="#f00"
                    emissive={"#000"}
                    emissiveIntensity={.0}
                />
            ),
            buildingHi: (
                <MeshRetroMaterial
                    backColorIntensity={.0}
                    color={buildingHiColor}
                    emissive={buildingHiColor}
                    emissiveIntensity={.5}
                    rightColorIntensity={0}
                />
            ),
            rock: (
                <MeshRetroMaterial
                    backColorIntensity={.15}
                    backColor="black"
                    color={floorBaseColor}
                    emissive={floorBaseColor}
                    emissiveIntensity={.1}
                    rightColorIntensity={.1}
                    rightColor="white"
                    shader={{
                        fragment: {
                            main: glsl`  
                                float grassAt = 1.;
                                float intensity = luma(gl_FragColor.rgb) * 5.;
                                float baseNoise1 = (noise(
                                    vec3(vGlobalPosition.x * .7, vGlobalPosition.y * .7, vGlobalPosition.z * .7)
                                ) + 1.) / 2.;
                                float ye = clamp(vGlobalPosition.y / grassAt, 0., 1.);
                                vec3 grassColor = vec3(0.1, .8, .4) * .85;  

                                float ye2 = 1. - clamp(abs(vGlobalPosition.y - 1.25) / 1.5, 0., 1.);

                                gl_FragColor.rgb = mix(
                                    gl_FragColor.rgb,  
                                    grassColor * intensity, 
                                    ye - easeInOutQuad(ye2) * easeInOutQuad(baseNoise1)
                                );  
                            `
                        }
                    }}
                />
            ),
            floorRock: (
                <MeshRetroMaterial
                    backColorIntensity={0}
                    backColor="black"
                    color={"#0bc8b8"}
                    emissive={floorBaseColor}
                    emissiveIntensity={.1}
                    rightColorIntensity={0}
                    rightColor="white" 
                />
            ),
            exhaust: <ExhaustMaterial />,
            floorBase: <MeshRetroMaterial color={floorBaseColor} />,
            floorHi: <MeshRetroMaterial color={floorHiColor} />,
            floorSolid: <meshBasicMaterial color={"red"} />,
            floorMark: <meshBasicMaterial color={floorMarkColor} />,
            bossLightBlue: <MeshRetroMaterial color="lightblue" />,
            bossBlack: <MeshRetroMaterial color="black" />,
            bossDarkBlue: <MeshRetroMaterial color="darkblue" />,
            bossBlue: <MeshRetroMaterial color="blue" />,
            bossSecondaryBlue: <MeshRetroMaterial color="#00f" />,
            bossWhite: <meshLambertMaterial color="white" />,
            bossFloorHi: <meshBasicMaterial color="#fff" />,
            grass: <GrassMaterial />,
        }
    }, [])

    return (
        <group>
            {Object.entries(materials).map(([name, material]) => {
                return (
                    <MaterialHandler
                        name={name as MaterialName}
                        key={name}
                    >
                        {material}
                    </MaterialHandler>
                )
            })}
        </group>
    )
}

let geometry = new BoxGeometry()

function MaterialHandler({ children, name }: { children: React.ReactNode; name: MaterialName }) {
    let handleRef = useCallback((mesh: Mesh<BufferGeometry, Material>) => {
        if (mesh) {
            startTransition(() => setMaterial(name, mesh.material))
        }
    }, [])

    return (
        <mesh
            geometry={geometry}
            ref={handleRef}
            dispose={null}
            frustumCulled={false}
        >
            {cloneElement(children as ReactElement, { name })}
        </mesh>
    )
}

export default memo(MaterialLoader)