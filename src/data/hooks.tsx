import { startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Box3, IUniform, Renderer, Shader, Vector3 } from "three"
import { glsl } from "./utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { store, useStore } from "./store"
import { Client } from "./SpatialHashGrid3D"
import { Tuple3 } from "src/types.global"

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

        if (health > 0) {
            client.position = position.toArray()
            world.grid.updateClient(client)
        }

        if (aabb && size) {
            aabb.setFromCenterAndSize(position, _size.set(...size))
        }
    })

    useEffect(() => {
        if (shouldExit) {
            setTimeout(() => startTransition(remove), removeDelay)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldExit, removeDelay])

    useEffect(() => {
        return () => {
            remove()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useLayoutEffect(() => {
        if (health <= 0) {
            let { world } = store.getState()

            world.grid.removeClient(client)
            startTransition(() => {
                destroy(position)
                setShouldExit(!keepAround)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [health, client, keepAround, position])
}

export const useAnimationFrame = (callback: (delta: number) => void) => {
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = useRef<number>()
    const previousTimeRef = useRef<number>()

    useEffect(() => {
        const animate = (time: number) => {
            if (previousTimeRef.current != undefined) {
                const deltaTime = time - previousTimeRef.current

                callback(deltaTime)
            }
            previousTimeRef.current = time
            requestRef.current = requestAnimationFrame(animate)
        }

        requestRef.current = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(requestRef.current as number)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}

export interface ShaderPart {
    head?: string
    main?: string
}

type UniformsRecord = Record<string, IUniform>

type ReturnUniformsRecord<T extends Record<string, IUniform> | undefined> = T extends UniformsRecord
    ? {
        [K in keyof T]: {
            value: T[K]["value"];
            needsUpdate?: boolean;
        };
    }
    : undefined;

export interface UseShaderParams<T extends UniformsRecord> {
    uniforms?: T | undefined
    shared?: string
    vertex?: ShaderPart
    fragment?: ShaderPart
}

interface ReturnUseShader<T extends UniformsRecord | undefined> {
    uniforms: ReturnUniformsRecord<T>
    onBeforeCompile: (shader: Shader, renderer: Renderer) => void
    customProgramCacheKey: () => string
}

export function useShader<T extends UniformsRecord>({
    uniforms: incomingUniforms,
    shared = "",
    vertex = {
        head: "",
        main: "",
    },
    fragment = {
        head: "",
        main: "",
    }
}: UseShaderParams<T>): ReturnUseShader<T> {
    let uniforms = useMemo(() => {
        return incomingUniforms || {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vertex?.head, vertex?.main, fragment?.head, fragment?.main, shared])

    return {
        // aaah why is this cast neccessary ts
        uniforms: uniforms as ReturnUniformsRecord<T>,
        customProgramCacheKey,
        onBeforeCompile
    }
}