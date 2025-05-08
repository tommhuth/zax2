import { MeshRetroMaterial } from "./MeshRetroMaterial"
import { planeColor } from "@data/theme"

export default function PlaneMaterial() {
    return (
        <MeshRetroMaterial
            color={planeColor}
            name="plane"
            colorCount={5}
            emissive={planeColor}
            emissiveIntensity={.4}
            rightColorIntensity={.4}
            rightColor="#f00"
            backColor="#f00"
            fog={.25}
            backColorIntensity={.0}
            dither={.005}
        />
    )
}