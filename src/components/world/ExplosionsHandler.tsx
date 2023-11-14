import { startTransition, useEffect, useMemo, useRef } from "react"
import { AdditiveBlending, BufferAttribute, Color, Sprite } from "three"
import { clamp, glsl, ndelta, setMatrixAt } from "../../data/utils"
import { useShader } from "../../data/hooks"
import { useFrame, useLoader } from "@react-three/fiber"
import InstancedMesh from "../InstancedMesh"
import { TextureLoader } from "three/src/loaders/TextureLoader.js"
import { useStore } from "../../data/store"
import { removeExplosion } from "../../data/store/effects"
import { explosionColor, explosionEndColor, explosionMidColor, explosionStartColor } from "../../data/theme"
import random from "@huth/random"
import easings from "../../shaders/easings.glsl"

function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4)
}

function blend(values = [75, 100, 0], t = 0, threshold = .5) {
    let left = t >= threshold ? 1 : 0
    let right = left + 1

    if (t <= threshold) {
        return (1 - t / (1 - threshold)) * values[left] + t / (1 - threshold) * values[right]
    }

    return (1 - (t - threshold) / (1 - threshold)) * values[left] + (t - threshold) / (1 - threshold) * values[right]
}

export default function ExplosionsHandler() {
    let latestExplosion = useStore(i => i.effects.explosions[0])
    let glowMap = useLoader(TextureLoader, "/textures/glow.png")
    let ref = useRef<Sprite>(null)
    let centerAttributes = useMemo(() => {
        return new Float32Array(new Array(100 * 3).fill(0))
    }, [])
    let lifetimeAttributes = useMemo(() => {
        return new Float32Array(new Array(100).fill(0))
    }, [])
    let radiusAttributes = useMemo(() => {
        return new Float32Array(new Array(100).fill(0))
    }, [])
    let instance = useStore(i => i.instances.fireball?.mesh)
    let { onBeforeCompile } = useShader({
        uniforms: {
            uStartColor: { value: new Color(explosionStartColor) },
            uMidColor: { value: new Color(explosionMidColor) },
            uEndColor: { value: new Color(explosionEndColor) },
        },
        vertex: {
            head: glsl` 
                attribute vec3 aCenter;   
                attribute float aRadius;   
                varying float vRadius;
                varying float vDistance;
                varying float vLifetime;
                varying vec3 vPosition;
                attribute float aLifetime;  
                varying vec3 vGlobalNormal;  
                 
                ${easings}
            `,
            main: glsl`
                vec4 globalPosition = instanceMatrix * vec4(transformed, 1.);   
 
                vDistance = clamp(length(globalPosition.xyz - aCenter) / aRadius, 0., 1.); // );
                vLifetime = aLifetime;
                vPosition = globalPosition.xyz; 
                vRadius = aRadius; 
            `
        },
        fragment: {
            head: glsl`  
                varying float vDistance; 
                varying float vLifetime;
                varying float vRadius;
                varying vec3 vPosition; 
                uniform vec3 uStartColor; 
                uniform vec3 uMidColor; 
                uniform vec3 uEndColor;  
                varying vec3 vGlobalNormal;   
                 
                ${easings}
            `,
            main: glsl`     
                vec3 baseColor = mix(uEndColor, gl_FragColor.rgb, easeOutQuart(vDistance));

                gl_FragColor = vec4(baseColor, easeOutQuart(1. - vDistance));
            `
        }
    })

    useEffect(() => {
        if (!instance || !latestExplosion) {
            return
        }

        let centerAttribute = instance.geometry.attributes.aCenter as BufferAttribute
        let radiusAttribute = instance.geometry.attributes.aRadius as BufferAttribute

        for (let fireball of latestExplosion.fireballs) {
            centerAttribute.setXYZ(fireball.index, ...latestExplosion.position)
            centerAttribute.needsUpdate = true

            radiusAttribute.set([random.float(4, 7)], fireball.index)
            radiusAttribute.needsUpdate = true
        }
    }, [latestExplosion])

    useFrame((state, delta) => {
        if (!instance) {
            return
        }

        let explosions = useStore.getState().effects.explosions
        let dead: string[] = []

        for (let explosion of explosions) {
            if (explosion.fireballs[0].time > explosion.fireballs[0].lifetime) {
                dead.push(explosion.id)
                continue
            }

            for (let sphere of explosion.fireballs) {
                let t = clamp(sphere.time / sphere.lifetime, 0, 1)
                let scale = blend([sphere.startRadius, sphere.maxRadius, 0], easeOutQuart(t))

                if (sphere.time < 0) {
                    scale = 0
                }

                let attribute = instance.geometry.attributes.aLifetime as BufferAttribute

                attribute.set([t], sphere.index)
                attribute.needsUpdate = true

                setMatrixAt({
                    instance: instance,
                    index: sphere.index,
                    position: [
                        sphere.position[0],
                        sphere.position[1] + t * (sphere.index % 3 + 1),
                        sphere.position[2],
                    ],
                    scale
                })

                sphere.time += ndelta(delta) * 1000
            }
        }

        if (dead.length) {
            startTransition(() => removeExplosion(dead))
        }
    })

    useEffect(() => {
        if (ref.current && latestExplosion) {
            ref.current.position.set(...latestExplosion.position)
            ref.current.position.y += 6
            ref.current.position.x -= 5
            ref.current.position.z -= 5
            ref.current.material.opacity = .8
        }
    }, [latestExplosion])

    useFrame(() => {
        if (ref.current) {
            ref.current.material.opacity *= .9
        }
    })

    return (
        <>
            <InstancedMesh castShadow={false} receiveShadow={false} count={100} name="fireball">
                <sphereGeometry args={[1, 12, 12]} >
                    <instancedBufferAttribute
                        needsUpdate={true}
                        attach="attributes-aCenter"
                        args={[centerAttributes, 3, false, 1]}
                    />
                    <instancedBufferAttribute
                        needsUpdate={true}
                        attach="attributes-aRadius"
                        args={[radiusAttributes, 1, false, 1]}
                    />
                    <instancedBufferAttribute
                        needsUpdate={true}
                        attach="attributes-aLifetime"
                        args={[lifetimeAttributes, 1, false, 1]}
                    />
                </sphereGeometry>
                <meshPhongMaterial
                    transparent
                    onBeforeCompile={onBeforeCompile}
                    color={explosionColor}
                    emissive={"#FFF"}
                    emissiveIntensity={.35}
                />
            </InstancedMesh>

            <sprite ref={ref} scale={10} >
                <spriteMaterial
                    depthWrite={false}
                    color={"#fff"}
                    blending={AdditiveBlending}
                    map={glowMap}
                    transparent
                />
            </sprite>
        </>
    )
}


/*
    vec3 c1 = mix(uStartColor, uMidColor, easeInOutCubic(vDistance));
    vec3 c2 = mix(c1, uEndColor, (vLifetime));
    vec3 cameraLook = vec3(-59.23724356957945, -50.000000000000014, -53.08744356953773);
    
    float a = clamp(-dot(vGlobalNormal, normalize(cameraLook)), 0., 1.);
 
    vec3 xx = gl_FragColor.rgb;
    xx.r = 0.;
    xx.g *= a;
    xx.b *= a;

    gl_FragColor = vec4(xx, 1.);
*/