import { ReactElement, ReactNode, cloneElement, memo, startTransition, useCallback, useMemo } from "react"
import { buildingBaseColor, buildingHiColor, deviceColor, floorBaseColor, floorHiColor, floorMarkColor, platformColor } from "../../../data/theme"
import { MeshRetroMaterial } from "./MeshRetroMaterial"
import { BoxGeometry, BufferGeometry, Material, Mesh } from "three"
import { setMaterial } from "../../../data/store/utils"
import { MaterialName } from "../../../data/types"
import ExhaustMaterial from "./ExhaustMaterial"
import GrassMaterial from "./GrassMaterial"
import RocketMaterial from "./RocketMaterial"
import BarrelMaterial from "./BarrelMaterial"
import TurretMaterial from "./TurretMaterial"
import PlaneMaterial from "./PlaneMaterial"
import RockMaterial from "./RockMaterial"
import { glsl } from "@data/utils"

function MaterialLoader() {
    let materials = useMemo(() => {
        return {
            rocket: <RocketMaterial />,
            platform: (
                <MeshRetroMaterial
                    color={platformColor}
                    name="rocket"
                />
            ),
            plane: <PlaneMaterial />,
            turret: <TurretMaterial />,
            turretDark: <TurretMaterial emissiveIntensity={.4} color={"#ff1e00"} />,
            barrel: <BarrelMaterial />,
            buildingBase: (
                <MeshRetroMaterial
                    backColorIntensity={.5}
                    color={buildingBaseColor}
                    emissive={buildingBaseColor}
                    emissiveIntensity={.1}
                    rightColorIntensity={.4}
                />
            ),
            buildingDark: (
                <MeshRetroMaterial
                    color={"#005"}
                    backColorIntensity={0}
                    rightColorIntensity={0}
                    emissive={"#000"}
                    emissiveIntensity={.0}
                />
            ),
            buildingHi: (
                <MeshRetroMaterial
                    color={buildingHiColor}
                    emissive={buildingHiColor}
                    emissiveIntensity={.5}
                    backColorIntensity={0}
                    rightColorIntensity={0}
                />
            ),
            device: <MeshRetroMaterial color={deviceColor} name="device" />,
            rock: <RockMaterial />,
            exhaust: <ExhaustMaterial />,
            floorBase: <MeshRetroMaterial color={floorBaseColor} />,
            floorHi: <MeshRetroMaterial color={floorHiColor} />,
            floorMark: <meshBasicMaterial color={floorMarkColor} />,
            white: <meshBasicMaterial color={"#fff"} />,
            floorRock: <MeshRetroMaterial
                fog={.25}
                color={"#059"}
                backColorIntensity={0}
                dither={.01}
                shader={{
                    fragment: {
                        main: glsl`
                            gl_FragColor.rgb = mix(
                                gl_FragColor.rgb * .75, 
                                gl_FragColor.rgb * vec3(0., .4, 1.) * 1.5, 
                                smoothstep( 
                                    .2, 
                                    .8, 
                                    (noise(vGlobalPosition * vec3(.2, .3, .05) + vec3(.7, 0., 0.)) + 1.)  / 2.
                                )
                            );
                        `
                    }
                }}
            />,
            bossLightBlue: (
                <MeshRetroMaterial
                    rightColorIntensity={.4}
                    rightColor="blue"
                    color="#b5dbff"
                    emissive="#04f"
                    emissiveIntensity={.5}
                />
            ),
            bossBlack: <MeshRetroMaterial color="black" />,
            bossDarkBlue: <MeshRetroMaterial color="darkblue" />,
            bossBlue: <MeshRetroMaterial color="blue" />,
            bossSecondaryBlue: <MeshRetroMaterial color="#00f" />,
            bossWhite: <meshLambertMaterial color="white" />,
            grass: <GrassMaterial />,
            muzzle: (
                <meshLambertMaterial
                    color="#d9f3ff"
                    emissive="#ffffff"
                    emissiveIntensity={.35}
                />
            )
        } satisfies Record<MaterialName, ReactNode>
    }, [])

    return (
        <>
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
        </>
    )
}

let geometry = new BoxGeometry()

function MaterialHandler({ children, name }: { children: React.ReactNode; name: MaterialName }) {
    let handleRef = useCallback((mesh: Mesh<BufferGeometry, Material>) => {
        if (mesh) {
            startTransition(() => setMaterial(name, mesh.material))
        }
    }, [name])

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