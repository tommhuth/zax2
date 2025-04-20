import { ObjectMap } from "@react-three/fiber"
import { BufferGeometry, Object3D } from "three"
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js"

export type Tuple4 = [number, number, number, number]
export type Tuple3 = [number, number, number]
export type Tuple2 = [number, number]

export interface GLTFModel<T extends string[]> extends GLTF, Omit<ObjectMap, "nodes"> {
    nodes: Record<T[number], { geometry: BufferGeometry }> & Record<string, Object3D>
} 