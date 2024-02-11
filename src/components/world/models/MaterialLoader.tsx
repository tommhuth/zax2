import { ReactElement, ReactNode, cloneElement, memo, startTransition, useCallback, useMemo } from "react"
import { buildingBaseColor, buildingHiColor, floorBaseColor, floorFogIntensity, floorHiColor, floorMarkColor, groundFogIntensity } from "../../../data/theme"
import { MeshRetroMaterial } from "../MeshRetroMaterial"
import { BoxGeometry, BufferGeometry, Material, Mesh } from "three"
import { setMaterial } from "../../../data/store/utils"
import { MaterialName } from "../../../data/types"
import { BossFloorMaterial } from "../parts/Boss"

function MaterialLoader() { 
    let materials: Record<MaterialName, ReactNode> = useMemo(() => {
        return {
            buildingBase: <MeshRetroMaterial isInstance={false} fogDensity={groundFogIntensity} color={buildingBaseColor} />,
            buildingHi: <MeshRetroMaterial isInstance={false} fogDensity={groundFogIntensity} color={buildingHiColor} />,
            floorBase: <MeshRetroMaterial isInstance={false} fogDensity={floorFogIntensity} color={floorBaseColor} />,
            floorHi: <MeshRetroMaterial isInstance={false} fogDensity={floorFogIntensity} color={floorHiColor} />,
            floorSolid: <meshBasicMaterial color={"red"} />,
            floorMark: <meshBasicMaterial color={floorMarkColor} />,
            bossLightBlue: <MeshRetroMaterial isInstance={false} color="lightblue" />,
            bossBlack: <MeshRetroMaterial isInstance={false} color="black" />,
            bossDarkBlue: <MeshRetroMaterial isInstance={false} color="darkblue" />,
            bossBlue: <MeshRetroMaterial isInstance={false} color="blue" />,
            bossSecondaryBlue: <MeshRetroMaterial isInstance={false} color="#00f" />,
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