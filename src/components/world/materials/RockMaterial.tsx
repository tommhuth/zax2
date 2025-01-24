import { glsl } from "@data/utils"
import { MeshRetroMaterial } from "./MeshRetroMaterial"
import { floorBaseColor } from "@data/theme"

export default function RockMaterial() {
    return (
        <MeshRetroMaterial
            backColorIntensity={.15}
            backColor="black"
            name="rock"
            color={floorBaseColor}
            emissive={floorBaseColor}
            emissiveIntensity={.1}
            rightColorIntensity={.1}
            rightColor="white"
            shader={{
                fragment: {
                    main: glsl`  
                        float grassAt = 1.;
                        float intensity = luma(gl_FragColor.rgb) * 5.;
                        float baseNoise1 = (noise(
                            vec3(vGlobalPosition.x * .7, vGlobalPosition.y * .7, vGlobalPosition.z * .7)
                        ) + 1.) / 2.;
                        float ye = clamp(vGlobalPosition.y / grassAt, 0., 1.);
                        vec3 grassColor = vec3(0., .8, .8) * .85;  

                        float ye2 = 1. - clamp(abs(vGlobalPosition.y - 1.25) / 1.5, 0., 1.);

                        gl_FragColor.rgb = mix(
                            gl_FragColor.rgb,  
                            grassColor * intensity, 
                            ye - easeInOutQuad(ye2) * easeInOutQuad(baseNoise1)
                        );   
                    `
                }
            }}
        />
    )
}