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
            shader={{
                fragment: {
                    main: glsl` 
                        vec3 t = vec3(uTime, uTime * .25, uTime);
                        float n = easeInOutQuad((noise(vGlobalPosition * .25 + t * 1.5) + 1.) / 2.);
                        float n2 = easeInOutQuad((noise(vGlobalPosition * .1 + t * 1.) + 1.) / 2.);
                        float h = easeInQuad(clamp((-(vGlobalPosition.y + 1.) / 6.), 0., 1.));
                        float h2 = easeInQuad(clamp((-(vGlobalPosition.y + 5.5) / 1.5), 0., 1.));
        
                        vec3 color = vec3(0.01, 0.01, 0.2);
                        vec3 highlight = vec3(0., .0, .7); 

                        gl_FragColor.rgb = mix(gl_FragColor.rgb, highlight, clamp(n * h + h2, 0., 1.));
                        gl_FragColor.rgb = mix(gl_FragColor.rgb, color, n2 * h * 1.);
                    `
                }
            }}
        />
    )
}
