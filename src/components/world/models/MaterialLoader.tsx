import { ReactElement, ReactNode, cloneElement, memo, startTransition, useCallback, useMemo } from "react"
import { barellColor, buildingBaseColor, buildingHiColor, floorBaseColor, floorFogIntensity, floorHiColor, floorMarkColor, groundFogIntensity } from "../../../data/theme"
import { MeshRetroMaterial } from "../MeshRetroMaterial"
import { BoxGeometry, BufferGeometry, Material, Mesh } from "three"
import { setMaterial } from "../../../data/store/utils"
import { MaterialName } from "../../../data/types"
import { BossFloorMaterial } from "../parts/Boss"

function MaterialLoader() { 
    let materials: Record<MaterialName, ReactNode> = useMemo(() => {
        return {
            barrel:  (
                <MeshRetroMaterial 
                    backColorIntensity={.1} 
                    colorCount={14}  
                    fogDensity={.5} 
                    fogHeight={1}
                    color={barellColor} 
                    rightColorIntensity={.8} 
                    rightColor="#00f"
                    emissive={barellColor}
                    emissiveIntensity={.2}
                />
            ),
            buildingBase: (
                <MeshRetroMaterial 
                    backColorIntensity={.4} 
                    colorCount={16}  
                    fogDensity={groundFogIntensity * .75} 
                    color={buildingBaseColor} 
                    rightColorIntensity={.7} 
                    rightColor="#10d"
                    emissive={buildingBaseColor}
                    emissiveIntensity={.2}
                />
            ),
            buildingHi: (
                <MeshRetroMaterial 
                    backColorIntensity={.0} 
                    colorCount={16}  
                    fogDensity={groundFogIntensity * .75} 
                    color={"#001199"} 
                    rightColorIntensity={0} 
                />
            ), 
            floorBase: <MeshRetroMaterial  fogDensity={floorFogIntensity} color={floorBaseColor} />,
            floorHi: <MeshRetroMaterial  fogDensity={floorFogIntensity} color={floorHiColor} />,
            floorSolid: <meshBasicMaterial color={"red"} />,
            floorMark: <meshBasicMaterial color={floorMarkColor} />,
            bossLightBlue: <MeshRetroMaterial  color="lightblue" />,
            bossBlack: <MeshRetroMaterial  color="black" />,
            bossDarkBlue: <MeshRetroMaterial  color="darkblue" />,
            bossBlue: <MeshRetroMaterial  color="blue" />,
            bossSecondaryBlue: <MeshRetroMaterial  color="#00f" />,
            bossWhite: <meshLambertMaterial color="white" />,
            bossFloorBase: <BossFloorMaterial />,
            bossFloorHi: <BossFloorMaterial color="red" />,
            black: <meshLambertMaterial color="#000"  />,
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
        >
            {cloneElement(children as ReactElement, { name })}
        </mesh>
    )
}

export default memo(MaterialLoader)