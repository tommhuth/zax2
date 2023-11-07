import { Color } from "three"
import { useShader } from "../../data/hooks"
import { bcolor, fogColorEnd, fogColorStart } from "../../data/theme"
import easings from "../../shaders/easings.glsl"
import { glsl } from "../../data/utils"
import { useFrame } from "@react-three/fiber"

export function MeshLambertFogMaterial({
    color = bcolor,
    isInstance = true,
    usesTime = false,
    fragmentShader = "",
    vertexShader = "",
    debug,
    fogDensity = .75,
    ...rest
}) {
    let { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            uTime: { value: 0 },
            uFogColorStart: { value: new Color(fogColorStart) },
            uFogColorEnd: { value: new Color(fogColorEnd) },
        },
        vertex: {
            head: glsl`
                varying vec3 vPosition;   
                varying vec3 vGlobalPosition;    
                uniform float uTime; 

                ${easings}
            `,
            main: glsl` 
                vec4 globalPosition = ${isInstance ? "instanceMatrix" : "modelMatrix"}  * vec4(position, 1.);

                vGlobalPosition = globalPosition.xyz;
                vPosition = position.xyz;

                ${vertexShader}
            `
        },
        fragment: {
            head: glsl` 
                varying vec3 vPosition;   
                varying vec3 vGlobalPosition;    
                uniform float uTime; 
                uniform vec3 uFogColorStart; 
                uniform vec3 uFogColorEnd;  
                ${easings}
            `,
            main: glsl` 
                ${fragmentShader} 

                float fogDensity = ${fogDensity};
                vec3 bottomColor = mix(uFogColorStart, gl_FragColor.rgb , 1. - fogDensity); 
                float heightDistance = 2.8;
                
                gl_FragColor.rgb = mix(bottomColor, gl_FragColor.rgb, easeOutCubic(clamp(vGlobalPosition.y / heightDistance, .0, 1.)));
            
            `
        }
    }) 

    useFrame((state, delta) => {
        if (usesTime) {
            uniforms.uTime.value += delta * .2
            uniforms.uTime.needsUpdate = true
        }
    })

    return (
        <meshLambertMaterial
            onBeforeCompile={onBeforeCompile}
            color={color}
            attach={"material"}
            dithering
            {...rest}
        />
    )
}


/*

float fogScale = .095;
float verticalScale = .1;
vec3 pos = vec3(
  vPosition.x * fogScale + uTime, 
  vPosition.y * verticalScale + uTime, 
  vPosition.z * fogScale * 1.2
);
float fogDensity = 1.;
float heightRange = 8.;
float heightOffset = 0.;
float heightEffect = easeInQuad(1. - clamp((vPosition.y - heightOffset) / heightRange, 0., 1.));
float fogEffect = easeInOutCubic((noise(pos) + 1.) / 2.) * 1.;

vec3 baseColor = gl_FragColor.rgb; 
vec3 fogColor = mix(uFogColorStart, uFogColorStart, easeInOutCubic(clamp(vPosition.y / heightRange, 0., 1.)));

gl_FragColor = vec4(mix(baseColor, fogColor, heightEffect * fogEffect * fogDensity), 1.);
*/