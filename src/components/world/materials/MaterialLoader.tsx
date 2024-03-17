import { ReactElement, ReactNode, cloneElement, memo, startTransition, useCallback, useMemo } from "react"
import { barellColor, buildingBaseColor, buildingHiColor, floorBaseColor, floorHiColor, floorMarkColor } from "../../../data/theme"
import { MeshRetroMaterial } from "./MeshRetroMaterial"
import { BoxGeometry, BufferGeometry, Material, Mesh } from "three"
import { setMaterial } from "../../../data/store/utils"
import { MaterialName } from "../../../data/types" 
import BossFogMaterial from "./BossFogMaterial"
import ExhaustMaterial from "./ExhaustMaterial"
import GrassMaterial from "./GrassMaterial"

function MaterialLoader() { 
    let materials: Record<MaterialName, ReactNode> = useMemo(() => {
        return {
            barrel:  (
                <MeshRetroMaterial 
                    backColorIntensity={.0}  
                    color={barellColor} 
                    rightColorIntensity={.5} 
                    rightColor="#f00"
                    vertexColors
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
            buildingHi: (
                <MeshRetroMaterial 
                    backColorIntensity={.0}  
                    color={buildingHiColor} 
                    emissive={buildingHiColor} 
                    emissiveIntensity={.5} 
                    rightColorIntensity={0} 
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
            bossFloorValley: <BossFogMaterial color="#016" />, 
            bossFloorHi: <MeshRetroMaterial color="#fff" />,
            bossCable: <BossFogMaterial color="#f00" />,
            bossHardware: <BossFogMaterial color="#00f" />,
            bossRock: <BossFogMaterial color="#00d" />,
            bossPillar: <BossFogMaterial color="#00f" />,  
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
        >
            {cloneElement(children as ReactElement, { name })}
        </mesh>
    )
}

export default memo(MaterialLoader)