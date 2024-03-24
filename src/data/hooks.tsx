import { startTransition, useCallback, useEffect, useMemo, useRef } from "react"
import { IUniform, Shader, Vector3 } from "three"
import { glsl } from "./utils"
import random from "@huth/random"
import { useFrame, useThree } from "@react-three/fiber"
import { useStore } from "./store"

export function useRemoveWhenBehind(position: Vector3, removeFunc: () => void) {
    let removed = useRef(false)
    let diagonal = useStore(i => i.world.diagonal)

    useFrame(() => {
        let { player } = useStore.getState()
        let outsideFrustum = player.object && position.z < player.object.position.z - diagonal * .5

        if (!removed.current && outsideFrustum) {
            removed.current = true
            startTransition(removeFunc)
        }
    })

    return removed
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