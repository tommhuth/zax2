import { BULLET_LIGHT_COUNT, LIGHT_SOURCES_COUNT } from "@data/const"
import Counter from "@data/Counter"
import { store } from "@data/store"
import { bulletColor, explosionColor } from "@data/theme"
import { glsl, ndelta } from "@data/utils"
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

        float currentLightEffect = (1. - clamp(length(light.position - vGlobalPosition) / light.radius, 0., 1.));

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

type UniformLightSource = { value: { radius: number; strength: number; position: Vector3 }[]; needsUpdate?: boolean }
type UniformBulletLight = { value: { radius: number; position: Vector3 }[]; needsUpdate?: boolean }

export function useLightsUpdater(uniforms: { uLightSources: UniformLightSource; uBulletLights: UniformBulletLight }) {
    let lightSourceCounter = useMemo(() => new Counter(LIGHT_SOURCES_COUNT - 1), [])

    useFrame(() => {
        let bullets = store.getState().world.bullets

        for (let i = 0; i < BULLET_LIGHT_COUNT; i++) {
            uniforms.uBulletLights.value[i].radius = 0
        }

        for (let i = 0; i < BULLET_LIGHT_COUNT; i++) {
            let bullet = bullets[i]

            if (bullet) {
                uniforms.uBulletLights.value[bullet.lightIndex].position.copy(bullet.position)
                uniforms.uBulletLights.value[bullet.lightIndex].radius = 5
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

                uniforms.uLightSources.value[lightSourceCounter.current].strength = 1
                uniforms.uLightSources.value[lightSourceCounter.current].radius = lastExplosion.radius * 1.6
                uniforms.uLightSources.value[lightSourceCounter.current].position.set(...lastExplosion.position)

                lightSourceCounter.next()
            }
        )
    }, [lightSourceCounter, uniforms])

    useFrame((state, delta) => {
        for (let i = 0; i < uniforms.uLightSources.value.length; i++) {
            uniforms.uLightSources.value[i].strength = damp(uniforms.uLightSources.value[i].strength, 0, 1.25, ndelta(delta))
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
            value: new Array(LIGHT_SOURCES_COUNT).fill(null).map(() => {
                return {
                    position: new Vector3(),
                    strength: 0,
                    radius: 0,
                }
            })
        },
        uBulletLights: {
            value: new Array(BULLET_LIGHT_COUNT).fill(null).map(() => {
                return {
                    position: new Vector3(),
                    radius: 0,
                }
            })
        },
    }
}