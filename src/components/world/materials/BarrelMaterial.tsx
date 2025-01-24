import { MeshRetroMaterial } from "./MeshRetroMaterial"
import { barellColor, barrellEmissiveIntensity } from "@data/theme"

export default function BarrelMaterial() {
    return (
        <MeshRetroMaterial
            backColorIntensity={.0}
            color={barellColor}
            rightColorIntensity={.6}
            rightColor="#f00"
            name="barrel"
            emissive={barellColor}
            emissiveIntensity={barrellEmissiveIntensity}
            additionalShadowStrength={0}
        />
    )
}