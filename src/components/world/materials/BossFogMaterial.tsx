import { floorBaseColor } from "../../../data/theme"
import { glsl } from "../../../data/utils"
import { MeshRetroMaterial } from "../materials/MeshRetroMaterial"

export default function BossFogMaterial({ color = floorBaseColor, name = undefined, ...rest }) {
    return (
        <MeshRetroMaterial 
            color={color}
            name={name} 
            rightColorIntensity={.5}
            {...rest}
            additionalShadowStrength={0}
            shader={{
                fragment: {
                    main: glsl` 
                        vec3 t = vec3(uTime * .75, uTime * .25, uTime * .6);
                        float baseNoise = easeInOutQuad((noise(vGlobalPosition * .25 + t * 1.5) + 1.) / 2.);
                        float baseHeightEffect = easeInQuad(clamp((-(vGlobalPosition.y + 2.) / 4.), 0., 1.));
                        float highlightNoise = easeInQuad((noise(vGlobalPosition * .1 + t * .8) + 1.) / 2.);
                        float heightEffect = easeInQuad(clamp((-(vGlobalPosition.y + 4.) / 3.), 0., 1.));
        
                        vec3 baseColor = vec3(0.0, 0.0, 0.2);
                        vec3 highlightColor = vec3(0., .2, .98); 

                        gl_FragColor.rgb = mix(gl_FragColor.rgb, baseColor, max(baseNoise * baseHeightEffect, heightEffect));
                        gl_FragColor.rgb = mix(gl_FragColor.rgb, highlightColor, highlightNoise * baseHeightEffect);
                    `
                }
            }}
        />
    )
}