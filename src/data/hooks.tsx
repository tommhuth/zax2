import { RefObject, startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Box3, IUniform, Object3D, Shader, Vector3 } from "three"
import { glsl, ndelta } from "./utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { store, useStore } from "./store"
import { Client } from "./SpatialHashGrid3D"
import { Tuple3 } from "src/types.global"

interface UseGravityOptions {
    ref: RefObject<Object3D>
    active: boolean
    force?: number
    stopAt?: number
    onGrounded?: () => void
}

export function useGravity({
    ref,
    active,
    force = -15,
    stopAt = 0,
    onGrounded = () => { }
}: UseGravityOptions) {
    let velocity = useRef(0)
    let acceleration = useRef(0)
    let grounded = useRef(false)

    useFrame((state, delta) => {
        let nd = ndelta(delta)

        if (active && ref.current && ref.current.position.y > stopAt) {
            velocity.current += acceleration.current * nd
            acceleration.current += force * nd

            ref.current.position.y += velocity.current * nd

            ref.current.rotation.x += force * nd * .001
            ref.current.rotation.y += force * nd * .0005
            ref.current.rotation.z += force * nd * -.008
        } else if (active && !grounded.current) {
            startTransition(onGrounded)
            grounded.current = true
        }
    })
}

interface UseBaseActorHandlerOptions {
    health?: number
    client: Client
    position: Vector3
    keepAround?: boolean
    removeDelay?: number
    aabb?: Box3
    size?: Tuple3
    remove: () => void
    destroy: (position: Vector3) => void
}

let _size = new Vector3()

export function useBaseActorHandler({
    health = Infinity,
    client,
    position,
    removeDelay = 0,
    keepAround = false,
    aabb,
    size,
    remove,
    destroy,
}: UseBaseActorHandlerOptions) {
    let [shouldExit, setShouldExit] = useState(false)

    useFrame(() => {
        let { player, world } = useStore.getState()
        let outsideFrustum = player.object && position.z < player.object.position.z - world.diagonal * .5

        if (!shouldExit && outsideFrustum) {
            setShouldExit(true)
        }
    })

    useFrame(() => {
        let { world } = store.getState()

        client.position = position.toArray()
        world.grid.updateClient(client)

        if (aabb && size) {
            aabb.setFromCenterAndSize(position, _size.set(...size))
        }
    })

    useEffect(() => {
        if (shouldExit) {
            setTimeout(() => startTransition(remove), removeDelay)
        }
    }, [shouldExit])

    useEffect(() => {
        return () => {
            remove()
        }
    }, [])

    useLayoutEffect(() => {
        if (health === 0) {
            let { world } = store.getState()

            world.grid.remove(client)
            startTransition(() => {
                destroy(position)
                setShouldExit(!keepAround)
            })
        }
    }, [health, keepAround])
}

export const useAnimationFrame = (callback: (delta: number) => void) => {
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = useRef<number>()
    const previousTimeRef = useRef<number>()

    const animate = (time: number) => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current

            callback(deltaTime)
        }
        previousTimeRef.current = time
        requestRef.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(requestRef.current as number)
    }, []) // Make sure the effect runs only once
}

interface ShaderPart {
    head?: string
    main?: string
}

export interface UseShaderParams<T = Record<string, IUniform<any>>> {
    uniforms?: T
    shared?: string
    vertex?: ShaderPart
    fragment?: ShaderPart
}

export function useWindowEvent(name: string | string[], func: (e: any) => void, deps: any[] = []) {
    useEffect(() => {
        if (Array.isArray(name)) {
            name.forEach(name => window.addEventListener(name, func))
        } else {
            window.addEventListener(name, func)
        }

        return () => {
            if (Array.isArray(name)) {
                name.forEach(name => window.removeEventListener(name, func))
            } else {
                window.removeEventListener(name, func)
            }
        }
    }, deps)
}

export function useShader({
    uniforms: incomingUniforms = {},
    shared = "",
    vertex = {
        head: "",
        main: "",
    },
    fragment = {
        head: "",
        main: "",
    }
}: UseShaderParams) {
    let uniforms = useMemo(() => {
        return Object.entries(incomingUniforms)
            .map(([key, value]) => ({ [key]: { needsUpdate: true, ...value } }))
            .reduce((previous, current) => ({ ...previous, ...current }), {})
    }, [])
    let id = useMemo(() => random.id(), [])
    let customProgramCacheKey = useCallback(() => id, [id])
    let onBeforeCompile = useCallback((shader: Shader) => {
        shader.uniforms = {
            ...shader.uniforms,
            ...uniforms
        }

        shader.vertexShader = shader.vertexShader.replace("#include <common>", glsl`
            #include <common>
            
            ${shared}
            ${vertex.head}  
        `)
        shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", glsl`
            #include <begin_vertex>
    
            ${vertex?.main}  
        `)
        shader.fragmentShader = shader.fragmentShader.replace("#include <common>", glsl`
            #include <common>

            ${shared}
            ${fragment?.head}  
        `)
        shader.fragmentShader = shader.fragmentShader.replace("#include <dithering_fragment>", glsl`
            #include <dithering_fragment> 

            ${fragment?.main}  
        `)
    }, [vertex?.head, vertex?.main, fragment?.head, fragment?.main])

    return {
        uniforms,
        customProgramCacheKey,
        onBeforeCompile
    }
}