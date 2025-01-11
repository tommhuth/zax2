import { GLTFModel } from "src/types.global"
import { useStore } from "../../../data/store"
import bossModel from "@assets/models/boss.glb"
import bossDestroyedModel from "@assets/models/boss-destroyed.glb"
import { useGLTF } from "@react-three/drei"
import { forwardRef, ReactNode } from "react"
import { Group } from "three"

interface BossModelProps {
    destroyed: boolean
    children?: ReactNode
}

export default forwardRef<Group, BossModelProps>(
    function BossModel({ destroyed = false, children }, ref) {
        let { nodes: bossDestroyed } = useGLTF(bossDestroyedModel) as GLTFModel<["Cube001", "Cube001_1", "Cube001_2", "Cube001_3", "Cube001_4"]>
        let { nodes: boss } = useGLTF(bossModel) as GLTFModel<["Cube012", "Cube012_1", "Cube012_2", "Cube012_3", "Cube012_4", "Cube012_5"]>
        let materials = useStore(i => i.materials)

        return (
            <group ref={ref}>
                <group
                    dispose={null}
                    visible={destroyed}
                >
                    <mesh
                        receiveShadow
                        geometry={bossDestroyed.Cube001.geometry}
                        material={materials.bossLightBlue}
                    />
                    <mesh
                        receiveShadow
                        geometry={bossDestroyed.Cube001_1.geometry}
                        material={materials.bossBlack}
                    />
                    <mesh
                        receiveShadow
                        geometry={bossDestroyed.Cube001_2.geometry}
                        material={materials.bossDarkBlue}
                    />
                    <mesh
                        receiveShadow
                        geometry={bossDestroyed.Cube001_3.geometry}
                        material={materials.bossBlue}
                    />
                    <mesh
                        receiveShadow
                        geometry={bossDestroyed.Cube001_4.geometry}
                        material={materials.bossSecondaryBlue}
                    />
                </group>

                <group
                    dispose={null}
                    visible={!destroyed}
                >
                    <mesh
                        geometry={boss.Cube012.geometry}
                        material={materials.bossLightBlue}
                    />
                    <mesh
                        geometry={boss.Cube012_1.geometry}
                        material={materials.bossBlack}
                    />
                    <mesh
                        geometry={boss.Cube012_2.geometry}
                        material={materials.bossDarkBlue}
                    />
                    <mesh
                        castShadow
                        geometry={boss.Cube012_3.geometry}
                        material={materials.bossBlue}
                    />
                    <mesh
                        geometry={boss.Cube012_4.geometry}
                        material={materials.bossSecondaryBlue}
                    />
                    <mesh
                        geometry={boss.Cube012_5.geometry}
                        material={materials.bossWhite}
                    />
                </group>

                {children}
            </group>
        )
    }
)