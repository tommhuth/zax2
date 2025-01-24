import { glsl } from "@data/utils"
import { MeshRetroMaterial } from "./MeshRetroMaterial"
import { rocketColor } from "@data/theme"

export default function RocketMaterial() {
    return (
        <MeshRetroMaterial
            color={rocketColor}
            name="rocket"
            emissive={rocketColor}
            emissiveIntensity={.05}
            shader={{
                fragment: {
                    main: glsl`
                        if (vGlobalPosition.y > 8. && vGlobalPosition.x > 5.) {
                            discard;
                        }
                    `
                }
            }}
        />
    )
}