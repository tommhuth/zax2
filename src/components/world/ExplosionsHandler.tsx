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
import { blend, easeInQuint, easeOutElastic, easeOutQuart } from "../../data/shaping"

export default function ExplosionsHandler() {
    let count = 100
    let latestExplosion = useStore(i => i.effects.explosions[0])
    let glowMap = useLoader(TextureLoader, "/textures/glow.png")
    let glowRef = useRef<Sprite>(null)
    let opacityAttributes = useMemo(() => {
        return new Float32Array(new Array(count).fill(0))
    }, [count])
    let centerAttributes = useMemo(() => {
        return new Float32Array(new Array(count * 3).fill(0))
    }, [count])
    let lifetimeAttributes = useMemo(() => {
        return new Float32Array(new Array(count).fill(0))
    }, [count])
    let radiusAttributes = useMemo(() => {
        return new Float32Array(new Array(count).fill(0))
    }, [count])
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
    let shockwaveShader = useShader({
        uniforms: {
        },
        vertex: {
            head: glsl` 
                attribute float aOpacity;  
                varying float vOpacity;  
                varying float vDistanceFromCenter;   
            `,
            main: glsl`
                vOpacity = aOpacity;
                vDistanceFromCenter = clamp(length(vec3(0., 0., 0.) - position) / .5, 0., 1.); 
            `
        },
        fragment: {
            head: glsl`   
                varying float vOpacity;  
                varying float vDistanceFromCenter;   

                ${easings}
            `,
            main: glsl`      
                
                gl_FragColor = vec4(
                    mix(vec3(.0, 1., 0.), vec3(0., 0., 1.), easeInQuart(vDistanceFromCenter)), 
                    easeInCubic(vOpacity * vDistanceFromCenter)
                ); 
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
        let shockwave = useStore.getState().instances.shockwave
        let dead: string[] = []

        for (let explosion of explosions) {
            if (explosion.fireballs[0].time > explosion.fireballs[0].lifetime) {
                dead.push(explosion.id)
                continue
            }

            let t = clamp(explosion.shockwave.time / (explosion.shockwave.lifetime), 0, 1) 

            let opacityAttribute = shockwave.mesh.geometry.attributes.aOpacity as BufferAttribute

            opacityAttribute.set([easeInQuint(1 - t)], explosion.shockwave.index)
            opacityAttribute.needsUpdate = true

            setMatrixAt({
                instance: shockwave.mesh,
                index: explosion.shockwave.index,
                position: [explosion.position[0], explosion.position[1] + 2, explosion.position[2]],
                scale: easeOutElastic(t) * explosion.shockwave.radius + .1,
            })

            explosion.shockwave.time += ndelta(delta) * 1000 

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
        if (glowRef.current && latestExplosion) {
            glowRef.current.position.set(...latestExplosion.position)
            glowRef.current.position.y += 6
            glowRef.current.position.x -= 5
            glowRef.current.position.z -= 5
            glowRef.current.material.opacity = .8
        }
    }, [latestExplosion])

    useFrame(() => {
        if (glowRef.current) {
            glowRef.current.material.opacity *= .9
        }
    })

    return (
        <>
            <InstancedMesh
                castShadow={false}
                receiveShadow={false}
                count={count}
                name="shockwave"
            >
                <cylinderGeometry args={[1, 1, .01, 16, 1]}>
                    <instancedBufferAttribute
                        needsUpdate={true}
                        attach="attributes-aOpacity"
                        args={[opacityAttributes, 1, false, 1]}
                    />
                </cylinderGeometry>
                <meshBasicMaterial
                    color="#00ffff"
                    depthWrite={false}
                    transparent
                    onBeforeCompile={shockwaveShader.onBeforeCompile}
                />
            </InstancedMesh>
            <InstancedMesh
                castShadow={false}
                receiveShadow={false}
                count={count}
                name="fireball"
            >
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

            <sprite ref={glowRef} scale={15} >
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