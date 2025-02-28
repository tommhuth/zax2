import { MeshRetroMaterial, MeshRetroMaterialProps } from "./MeshRetroMaterial"
import { turretColor } from "@data/theme"

export default function TurretMaterial(props: MeshRetroMaterialProps) {
    return (
        <MeshRetroMaterial
            color={turretColor}
            name="turret"
            emissive={turretColor}
            emissiveIntensity={0.55}
            rightColor="#f00"
            rightColorIntensity={.45}
            backColorIntensity={0}
            colorCount={8}
            additionalShadowStrength={.6}
            dither={.005}
            {...props}
        />
    )
}