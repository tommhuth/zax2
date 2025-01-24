import { glsl } from "@data/utils"
import { MeshRetroMaterial } from "./MeshRetroMaterial"

export default function AsteroidMaterial() {
    return (
        <MeshRetroMaterial
            color="#5e00c9"
            emissive={"#5e00c9"}
            fog={.1}
            emissiveIntensity={.2}
            rightColorIntensity={0}
            backColorIntensity={0}
            name="asteroid"
            shader={{
                fragment: {
                    main: glsl` 
                        float n = (noise(vGlobalPosition * .25 + uTime * .5) + 1.) / 2.;
                        vec3 highlightPosition = vec3(-1., -.2, -.25) * n;

                        gl_FragColor.rgb = mix(
                            gl_FragColor.rgb, 
                            vec3(0., 0., .1), 
                            easeInQuad(clamp(-vPosition.y / 2.2, 0., 1.))  
                        );

                        gl_FragColor.rgb = mix(
                            gl_FragColor.rgb, 
                            mix(gl_FragColor.rgb, vec3(1., 0., 0.), 0.75), 
                            clamp(dot(vGlobalNormal, highlightPosition), 0., 1.)
                        );
                    `
                }
            }}
        />
    )
}