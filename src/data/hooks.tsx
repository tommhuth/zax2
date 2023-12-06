import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { Box3, IUniform, Matrix4, Quaternion, Shader, Vector3 } from "three"
import { OBB } from "three/examples/jsm/math/OBB.js"
import { SpatialHashGrid3D, Client } from "./SpatialHashGrid3D"
import { useStore } from "./store"
import { Tuple3 } from "../types"
import { glsl } from "./utils"
import { Bullet } from "./types"

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

interface CollisionObject {
    position: Vector3
    size: Tuple3
    rotation?: number
    obb?: OBB
}


interface UseCollisionDetectionParams {  
    interval?: number
    source: CollisionObject
    predicate?: () => boolean
    actions: Record<string, (data: any) => void>
}


let _box1 = new Box3()
let _box2 = new Box3()
let _size1 = new Vector3()
let _size2 = new Vector3()
let _matrix = new Matrix4()
let _quat = new Quaternion()
let _y = new Vector3(0, 1, 0)
let _scale = new Vector3(1, 1, 1)

export function getCollisions({
    grid,  
    source,
}: Omit<UseCollisionDetectionParams, "actions" | "predicate" | "interval"> & { grid: SpatialHashGrid3D }) {
    let near = grid.findNear(source.position.toArray(), source.size)
    let result: Client[] = []

    for (let i = 0; i < near.length; i++) {
        let client = near[i]

        _box1.setFromCenterAndSize(client.data.position, _size1.set(...client.data.size as Tuple3))
        _box2.setFromCenterAndSize(source.position, _size2.set(...source.size))

        // broadphase
        if (_box1.intersectsBox(_box2)) {
            // has narrowphase
            if (source.obb && typeof source.rotation === "number") {
                source.obb.center.set(0, 0, 0)
                source.obb.rotation.identity()
                source.obb.applyMatrix4(
                    _matrix.compose(
                        source.position,
                        _quat.setFromAxisAngle(_y, source.rotation),
                        _scale
                    )
                )

                // narrowphase
                if (source.obb.intersectsBox3(_box1)) {
                    result.push(client)
                }
            } else {
                // if no narrowphase, broadphase is narrowphase
                result.push(client)
            }
        }
    }

    return result
}

export function useCollisionDetection({ 
    interval = 1, 
    source,
    actions,
    predicate = () => true,
}: UseCollisionDetectionParams) {
    let grid = useStore(i => i.world.grid)
    let tick = useRef(0)
    let types = Object.keys(actions) 

    useFrame(() => {
        if (predicate() && tick.current % interval === 0) {
            let collisions = getCollisions({
                grid, 
                source
            })   

            for (let i = 0; i < collisions.length; i++) {
                let client = collisions[i]
                let action = actions[client.data.type]

                if (!types.includes(client.data.type)) {
                    continue
                } 

                action(client.data)
            }
        }

        tick.current++
    })
}

interface CollisionEventDetails {
    client: Client
    bullet: Bullet
    movement: Tuple3
    intersection: Tuple3
}

interface UseCollisionEventParams {
    name: string,
    handler: (e: CustomEvent<CollisionEventDetails>) => void,
    deps?: any[]
}

export function useBulletCollision({
    name,
    handler,
    deps = []
}: UseCollisionEventParams) {
    useEffect(() => {
        window.addEventListener(name, handler as EventListener)

        return () => {
            window.removeEventListener(name, handler as EventListener) 
        }
    }, deps)
}