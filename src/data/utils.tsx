import React, { useRef } from "react"
import { BufferAttribute, BufferGeometry, Color, ColorRepresentation, Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three"
import { Tuple2, Tuple3, Tuple4 } from "../types"
import { clamp, mapLinear as map } from "three/src/math/MathUtils.js"
import { store } from "./store"

export { clamp, map }

export function ndelta(delta: number) {
    let nDelta = clamp(delta, 0, 1 / 30) * store.getState().world.timeScale

    return nDelta
}

export function Only(props: { if: any, children: React.ReactNode, once?: boolean }) {
    let firstIf = useRef(props.if)

    if (props.once && firstIf.current) {
        return <>{props.children}</>
    } else if (props.once) {
        return null
    }

    return props.if ? <>{props.children}</> : null
}

export function glsl(strings: TemplateStringsArray, ...variables) {
    let str: string[] = []

    strings.forEach((x, i) => {
        str.push(x)
        str.push(variables[i] || "")
    })

    return str.join("")
}

let _matrix = new Matrix4()
let _quaternion = new Quaternion()
let _position = new Vector3(0, 0, 0)
let _scale = new Vector3(1, 1, 1)
let _euler = new Euler()

interface SetMatrixAtParams {
    instance: InstancedMesh
    index: number
    position?: Tuple3
    rotation?: Tuple3 | Tuple4
    scale?: Tuple3 | number
}

export function setMatrixAt({
    instance,
    index,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
}: SetMatrixAtParams) {
    instance.setMatrixAt(index, _matrix.compose(
        _position.set(...position),
        rotation.length === 3 ? _quaternion.setFromEuler(_euler.set(...rotation, "XYZ")) : _quaternion.set(...rotation),
        Array.isArray(scale) ? _scale.set(...scale) : _scale.set(scale, scale, scale),
    ))
    instance.instanceMatrix.needsUpdate = true 
}

export function setMatrixNullAt(instance: InstancedMesh, index: number) {
    setMatrixAt({
        instance,
        index,
        position: [0, 0, 100_000],
        scale: [0, 0, 0],
        rotation: [0, 0, 0]
    })
}

const _color = new Color()

export function setColorAt(instance: InstancedMesh, index: number, color: ColorRepresentation) {
    instance.setColorAt(index, _color.set(color))

    if (instance.instanceColor) {
        instance.instanceColor.needsUpdate = true
    } else {
        console.warn("Instance is not initialized with instanceColor: setColorAt will do nothing.")
    }
}

export function setBufferAttribute(
    geometry: BufferGeometry,
    name: string,
    value: number | Tuple2 | Tuple3,
    index: number
) {
    let attribute = geometry.getAttribute(name) as BufferAttribute

    attribute.set(Array.isArray(value) ? value : [value], index)
    attribute.needsUpdate = true
}