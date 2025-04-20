import { ColorRepresentation } from "three"
import { MeshRetroMaterial } from "./MeshRetroMaterial"
import { turretColor } from "@data/theme"

export default function TurretMaterial(props?: { emissiveIntensity?: number; color?: ColorRepresentation }) {
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