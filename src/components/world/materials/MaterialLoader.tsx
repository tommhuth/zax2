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
                    backColorIntensity={.0}
                    backColor="yellow"
                    color={floorBaseColor}
                    emissive={floorBaseColor}
                    emissiveIntensity={.1}
                    rightColorIntensity={.0}
                    rightColor="yellow"
                    shader={{
                        fragment: {
                            main: glsl`
                                vec3 npos = vec3(vGlobalPosition.x * .6, vPosition.y * 2., vGlobalPosition.z * .5);
                                float grassN = easeInOutQuad((noise(npos) + 1.) / 2.);
                                float i = luma(gl_FragColor.rgb) * 4.;
                                float ye = (clamp((vPosition.y + .5) / 1., 0., 1.));
                                vec3 grassColor = vec3(0., 1., .4);

                                gl_FragColor.rgb = mix(
                                    gl_FragColor.rgb,  
                                    grassColor * i, 
                                    ye - (1. - ye) * grassN
                                ); 
                                gl_FragColor.rgb = mix(
                                    gl_FragColor.rgb,  
                                    vec3(0., .9, .7), 
                                    ye  * grassN * .75
                                ); 
                            `
                        }
                    }}
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