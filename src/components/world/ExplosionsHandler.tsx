import { startTransition, useEffect, useMemo, useRef } from "react"
import { AdditiveBlending, BufferAttribute, Color, LinearFilter, Sprite, Texture } from "three"
import { clamp, glsl, ndelta, setMatrixAt } from "../../data/utils"
import { useShader } from "../../data/hooks"
import { useFrame, useLoader } from "@react-three/fiber"
import InstancedMesh from "../InstancedMesh"
import { TextureLoader } from "three/src/loaders/TextureLoader.js"
import { useStore } from "../../data/store"
import { removeExplosion } from "../../data/store/effects"
import { explosionColor, explosionEndColor } from "../../data/theme"
import easings from "../../shaders/easings.glsl"
import dither from "../../shaders/dither.glsl"
import noise from "../../shaders/noise.glsl"
import { blend, easeInQuint, easeOutExpo, easeOutQuart } from "../../data/shaping"

export default function ExplosionsHandler() {
    let explosionsCount = 200
    let latestExplosion = useStore(i => i.effects.explosions[0])
    let [glowMap, impactMap]: Texture[] = useLoader(TextureLoader, ["/textures/glow.png", "/textures/decal1.png"])
    let glowRef = useRef<Sprite>(null)
    let shockwaveOpacityAttributes = useMemo(() => {
        return new Float32Array(new Array(explosionsCount).fill(0))
    }, [explosionsCount])
    let impactOpacityAttributes = useMemo(() => {
        return new Float32Array(new Array(10).fill(0))
    }, [explosionsCount])
    let centerAttributes = useMemo(() => {
        return new Float32Array(new Array(explosionsCount * 3).fill(0))
    }, [explosionsCount])
    let lifetimeAttributes = useMemo(() => {
        return new Float32Array(new Array(explosionsCount).fill(0))
    }, [explosionsCount])
    let radiusAttributes = useMemo(() => {
        return new Float32Array(new Array(explosionsCount).fill(0))
    }, [explosionsCount])
    let instance = useStore(i => i.instances.fireball?.mesh)
    let fireballShader = useShader({
        uniforms: {
            uEndColor: { value: new Color(explosionEndColor) },
        },
        vertex: {
            head: glsl` 
                attribute vec3 aCenter;   
                attribute float aRadius;   
                varying float vRadius;
                varying float vDistance;
                varying float vLifetime;
                varying vec3 vGlobalPosition;
                attribute float aLifetime;   
                 
                ${easings}
            `,
            main: glsl`
                vec4 globalPosition = instanceMatrix * vec4(transformed, 1.);   
 
                vDistance = clamp(length(globalPosition.xyz - aCenter) / aRadius, 0., 1.); // );
                vLifetime = aLifetime;
                vGlobalPosition = globalPosition.xyz; 
                vRadius = aRadius;  
            `
        },
        fragment: {
            head: glsl`  
                varying float vDistance; 
                varying float vLifetime;
                varying float vRadius;
                varying vec3 vGlobalPosition;  
                uniform vec3 uEndColor;   
                 
                ${easings}
                ${noise}
                ${dither}
            `,
            main: glsl`     
                vec3 baseColor = mix(uEndColor, gl_FragColor.rgb, easeOutQuart(vDistance)); 
                float noiseEffect = (noise(vGlobalPosition * .65) + 1.) / 2.;
 
                gl_FragColor = vec4(
                    mix(baseColor, vec3(1., .0, .79), easeInCubic(noiseEffect) * .6) * 1.05, 
                    easeOutQuart(1. - vDistance)  
                );

                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 10., .005);
            `
        }
    })
    let shockwaveShader = useShader({
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
                ${dither}
            `,
            main: glsl`      
                
                gl_FragColor = vec4(
                    mix(vec3(.0, .0, 1.), vec3(1., 1., 1.), 1. - easeOutQuart(vDistanceFromCenter)), 

                    easeInCubic(vOpacity * vDistanceFromCenter)
                ); 
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 18., .005);
            `
        }
    })
    let blastShader = useShader({
        vertex: {
            head: glsl` 
                varying vec3 vGlobalNormal;
            `,
            main: glsl` 
                vGlobalNormal = normal;
            `
        },
        fragment: {
            head: glsl`   
                varying float vOpacity;  
                varying vec3 vGlobalNormal;
                varying float vDistanceFromCenter;   

                ${easings}
                ${dither}
            `,
            main: glsl`  
                // this isnt accurate is it
                vec3 cameraDirection = normalize(vec3(-57.2372, 50., -61.237));
                float directionToCamera = 1. - clamp(1. - dot(cameraDirection, vGlobalNormal), .0, 1.);
 
                gl_FragColor = vec4(
                    mix(vec3(1., 0., 0.65), vec3(1., .5, 0.), easeInQuad(directionToCamera)),
                    directionToCamera
                );
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 10., .005);
            `
        }
    })
    let impactShader = useShader({
        vertex: {
            head: glsl`
                attribute float aOpacity;
                varying float vOpacity;
            `,
            main: glsl`
                vOpacity = aOpacity;
            `
        },
        fragment: {
            head: glsl`
                varying float vOpacity;
                
                ${dither} 
            `,
            main: glsl` 
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 16., .005);
                gl_FragColor.a *= vOpacity;
            `
        },
    })

    useEffect(()=>{
        impactMap.magFilter = LinearFilter
        impactMap.minFilter = LinearFilter
    }, [impactMap])

    // init
    useEffect(() => {
        if (!instance || !latestExplosion) {
            return
        }

        let centerAttribute = instance.geometry.attributes.aCenter as BufferAttribute
        let radiusAttribute = instance.geometry.attributes.aRadius as BufferAttribute

        for (let fireball of latestExplosion.fireballs) {
            centerAttribute.setXYZ(fireball.index, ...latestExplosion.position)
            centerAttribute.needsUpdate = true

            radiusAttribute.set([latestExplosion.radius], fireball.index)
            radiusAttribute.needsUpdate = true
        }
    }, [latestExplosion])

    // glow init
    useEffect(() => {
        if (glowRef.current && latestExplosion) {
            glowRef.current.position.set(...latestExplosion.position)
            glowRef.current.position.y += 4
            glowRef.current.position.x -= 5
            glowRef.current.position.z -= 5
            glowRef.current.material.opacity = 1
        }
    }, [latestExplosion])

    // main
    useFrame((state, delta) => {
        if (!instance) {
            return
        }
        let {
            effects: { explosions },
            instances: { shockwave: shockwaveInstance, blast: blastInstance }
        } = useStore.getState()
        let dead: string[] = []

        for (let { shockwave, blast, ...explosion } of explosions) {
            let fireballs = explosion.fireballs
            let shockwaveDone = shockwave ? shockwave.time > shockwave.lifetime : true
            let blastDone = blast.time > blast.lifetime

            if (fireballs[0].time > fireballs[0].lifetime && shockwaveDone && blastDone) {
                dead.push(explosion.id)
                continue
            }

            if (shockwave) {
                let t = clamp(shockwave.time / (shockwave.lifetime), 0, 1)
                let opacityAttribute = shockwaveInstance.mesh.geometry.attributes.aOpacity as BufferAttribute

                opacityAttribute.set([easeInQuint(1 - t)], shockwave.index)
                opacityAttribute.needsUpdate = true

                setMatrixAt({
                    instance: shockwaveInstance.mesh,
                    index: shockwave.index,
                    position: [explosion.position[0], explosion.position[1] + 1, explosion.position[2]],
                    scale: easeOutExpo(t) * shockwave.radius + 2,
                })

                shockwave.time += ndelta(delta) * 1000
            }

            let t2 = clamp(blast.time / (blast.lifetime * .5), 0, 1)

            setMatrixAt({
                instance: blastInstance.mesh,
                index: blast.index,
                position: [explosion.position[0], explosion.position[1] + 1, explosion.position[2]],
                scale: blend([0, blast.radius, 0], easeOutExpo(t2)),
            })

            blast.time += ndelta(delta) * 1000

            for (let sphere of fireballs) {
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

    // glow anim
    useFrame(() => {
        if (glowRef.current) {
            glowRef.current.material.opacity *= .95
        }
    })

    return (
        <>
            <InstancedMesh
                name="impact"
                count={10}
                castShadow={false}
                receiveShadow
            >
                <planeGeometry args={[2, 2, 1, 1]} >
                    <instancedBufferAttribute
                        needsUpdate={true}
                        attach="attributes-aOpacity"
                        args={[impactOpacityAttributes, 1, false, 1]}
                    />
                </planeGeometry>
                <meshBasicMaterial
                    map={impactMap} 
                    color={"black"}
                    depthWrite={false}
                    transparent
                    onBeforeCompile={impactShader.onBeforeCompile}
                />
            </InstancedMesh>

            <InstancedMesh
                castShadow={false}
                receiveShadow={false}
                count={explosionsCount}
                name="blast"
            >
                <sphereGeometry args={[1, 24, 24]} />
                <meshLambertMaterial
                    onBeforeCompile={blastShader.onBeforeCompile}
                    transparent
                />
            </InstancedMesh>

            <InstancedMesh
                castShadow={false}
                receiveShadow={false}
                count={explosionsCount}
                name="shockwave"
            >
                <cylinderGeometry args={[1, 1, .01, 32, 1]}>
                    <instancedBufferAttribute
                        needsUpdate={true}
                        attach="attributes-aOpacity"
                        args={[shockwaveOpacityAttributes, 1, false, 1]}
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
                count={explosionsCount}
                name="fireball"
            >
                <sphereGeometry args={[1, 24, 24]} >
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
                    onBeforeCompile={fireballShader.onBeforeCompile}
                    color={explosionColor}
                    emissive={"#FFF"}
                    emissiveIntensity={.45}
                />
            </InstancedMesh>
 
            <sprite ref={glowRef} scale={10} >
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