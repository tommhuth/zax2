import { useEffect, useMemo, useRef } from "react"
import { IUniform, Shader } from "three"
import { glsl } from "./utils"

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

interface UseShaderParams {
    uniforms?: Record<string, IUniform<any>>
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

    return {
        uniforms,
        onBeforeCompile(shader: Shader) {
            shader.uniforms = {
                ...shader.uniforms,
                ...uniforms
            }

            shader.vertexShader = shader.vertexShader.replace("#include <common>", glsl`
                #include <common>
         
                ${vertex.head}  
            `)
            shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", glsl`
                #include <begin_vertex>
        
                ${vertex?.main}  
            `)
            shader.fragmentShader = shader.fragmentShader.replace("#include <common>", glsl`
                #include <common>

                ${fragment?.head}  
            `)
            shader.fragmentShader = shader.fragmentShader.replace("#include <dithering_fragment>", glsl`
                #include <dithering_fragment> 

                ${fragment?.main}  
            `)
        }
    }
}