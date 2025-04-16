import { BULLET_LIGHT_COUNT, LIGHT_SOURCES_COUNT } from "@data/const"
import Counter from "@data/lib/Counter"
import { store } from "@data/store"
import { bulletColor, explosionColor } from "@data/theme"
import { glsl, list, ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import { Color, ColorRepresentation, Vector3 } from "three"
import { damp } from "three/src/math/MathUtils.js"

export const lightFragmentHead = glsl` 
    uniform vec3 uBulletColor;  
    uniform vec3 uExplosionColor;  

    struct LightSource {
        vec3 position;
        float strength;
        float radius;
    };
    uniform LightSource uLightSources[${LIGHT_SOURCES_COUNT}];

    struct BulletLight {
        vec3 position;  
        float radius;
        float strength;
    };
    uniform BulletLight uBulletLights[${BULLET_LIGHT_COUNT}];
`

export const lightFragment = glsl`
    float fogLightEffect = 0.;

    for (int i = 0; i < uLightSources.length(); i++) { 
        LightSource light = uLightSources[i];

        float currentLightEffect = (1. - clamp(length(light.position - vGlobalPosition) / light.radius, 0., 1.)) 
            * light.strength;

        fogLightEffect = max(fogLightEffect, currentLightEffect);
    }  

    float bulletLightEffect = 0.;

    for (int i = 0; i < uBulletLights.length(); i++) { 
        BulletLight light = uBulletLights[i];

        float currentLightEffect = (1. - clamp(length(light.position - vGlobalPosition) / light.radius, 0., 1.))
            * light.strength;

        bulletLightEffect = max(bulletLightEffect, currentLightEffect);
    } 
 
    // bullet light
    gl_FragColor.rgb = mix(
        gl_FragColor.rgb, 
        mix(gl_FragColor.rgb, uBulletColor, .95),
        easeInSine(bulletLightEffect)
    );  

    // light highlights 
    gl_FragColor.rgb = mix(
        gl_FragColor.rgb, 
        uExplosionColor * 1.6,
        easeInOutCubic(fogLightEffect)
    ); 
`

type UniformLightSource = {
    value: {
        radius: number
        strength: number
        position: Vector3
    }[];
    needsUpdate?: boolean
}

interface LightUniforms {
    uLightSources: UniformLightSource
    uBulletLights: UniformLightSource
}

export function useLightsUpdater(uniforms: LightUniforms) {
    let lightSourceCounter = useMemo(() => new Counter(LIGHT_SOURCES_COUNT - 1), [])

    useFrame((state, delta) => {
        let bullets = store.getState().world.bullets

        for (let i = 0; i < BULLET_LIGHT_COUNT; i++) {

            let uniform = uniforms.uBulletLights.value[i]

            uniform.radius = damp(uniform.radius, 0, 1, ndelta(delta))
            uniform.strength = damp(uniform.strength, 0, 2, ndelta(delta))
        }

        for (let i = 0; i < BULLET_LIGHT_COUNT; i++) {
            let bullet = bullets[i]

            if (bullet) {
                let uniform = uniforms.uBulletLights.value[bullet.lightIndex]

                uniform.position.copy(bullet.line.position)
                uniform.radius = 5
                uniform.strength = 1
            }
        }

        uniforms.uBulletLights.needsUpdate = true
    })

    useEffect(() => {
        return store.subscribe(
            state => state.effects.explosions[0],
            (lastExplosion) => {
                if (!lastExplosion) {
                    return
                }

                let uniform = uniforms.uLightSources.value[lightSourceCounter.current]

                uniform.strength = 1
                uniform.radius = lastExplosion.radius * 1.6
                uniform.position.set(...lastExplosion.position)

                lightSourceCounter.next()
            }
        )
    }, [lightSourceCounter, uniforms])

    useFrame((state, delta) => {
        for (let i = 0; i < uniforms.uLightSources.value.length; i++) {
            let uniform = uniforms.uLightSources.value[i]

            uniform.strength = damp(uniform.strength, 0, 1.25, ndelta(delta))
        }

        uniforms.uLightSources.needsUpdate = true
    })
}

export function makeLightUniforms(
    bulletColorOverride: ColorRepresentation = bulletColor
) {
    return {
        uBulletColor: {
            value: new Color(bulletColorOverride),
        },
        uExplosionColor: {
            value: new Color(explosionColor),
        },
        uLightSources: {
            value: list(LIGHT_SOURCES_COUNT).map(() => {
                return {
                    position: new Vector3(),
                    strength: 0,
                    radius: 0,
                }
            })
        },
        uBulletLights: {
            value: list(BULLET_LIGHT_COUNT).map(() => {
                return {
                    position: new Vector3(),
                    radius: 0,
                    strength: 0,
                }
            })
        },
    }
}