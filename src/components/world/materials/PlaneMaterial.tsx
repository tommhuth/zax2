import { MeshRetroMaterial } from "./MeshRetroMaterial"
import { planeColor } from "@data/theme"

export default function PlaneMaterial() {
    return (
        <MeshRetroMaterial
            color={planeColor}
            name="plane"
            colorCount={5}
            emissive={planeColor}
            emissiveIntensity={.25}
            rightColorIntensity={.5}
            rightColor="#f00"
            backColor="#f00"
            backColorIntensity={.1}
            dither={.005}
        />
    )
}