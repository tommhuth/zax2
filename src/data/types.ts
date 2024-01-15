import { Box3, InstancedMesh, Object3D, Vector3 } from "three"
import { Tuple2, Tuple3 } from "../types"
import Counter from "./world/Counter"
import { Client } from "./world/SpatialHashGrid3D"

export type MaterialName = "bossLightBlue" | "bossBlack" | "bossDarkBlue" | "bossBlue" | "bossSecondaryBlue"
    | "bossWhite" | "buildingHi" | "buildingHi" | "buildingBase" | "buildingHi"
    | "floorBase" | "floorHi" | "floorMark"

export type InstanceName = "scrap" |  "line" | "box" | "sphere" | "device"
    | "barrel1" | "barrel2" | "barrel3" | "barrel4" | "fireball"
    | "turret" | "rocket" | "platform" | "cylinder" | "shimmer"
    | "grass" | "plant" | "shockwave" | "blast" | "impact" | "exhaust"

export type RepeaterName = "building1" | "building2" | "building3"
    | "building4" | "building5" | "tanks" | "wall1"
    | "hangar" | "floor1" | "floor2" | "floor3" | "floor4"

export type CollisionObjectType = "barrel" | "player" | "boss" | "heatseaker" | "plane" | "turret" | "building" | "rocket"

export interface Fireball {
    isPrimary?: boolean
    position: Tuple3
    index: number
    startRadius: number
    maxRadius: number
    lifetime: number
    time: number
    id: string
}

export interface Explosion {
    position: Tuple3
    radius: number
    id: string
    blast: {
        radius: number
        lifetime: number
        time: number
        index: number
    }
    shockwave: {
        radius: number
        lifetime: number
        time: number
        index: number
    } | null
    fireballs: Fireball[]
}

export interface Rocket {
    position: Vector3
    size: Tuple3
    client: Client
    aabb: Box3
    id: string
    speed: number
    health: number
}
export interface Shimmer {
    position: Vector3
    id: string
    speed: Vector3
    index: number
    time: number
    gravity: number
    friction: number
    lifetime: number
    opacity: number
    radius: number
}

export interface Instance {
    mesh: InstancedMesh;
    maxCount: number;
    index: Counter;
}

export interface Building {
    id: string
    size: Tuple3
    position: Vector3
    client: Client
    color: number
    aabb: Box3
}

export interface HeatSeaker {
    position: Vector3
    velocity: Vector3
    client: Client
    size: Tuple3
    id: string
    index: number
}

export interface Turret {
    id: string
    position: Vector3
    size: Tuple3
    rotation: number
    client: Client
    aabb: Box3
    health: number
    fireFrequency: number
}

export interface Barrel {
    id: string
    position: Vector3
    size: Tuple3
    client: Client
    aabb: Box3
    index: number
    rotation: number
    health: number
}

export interface Plane {
    id: string
    position: Vector3
    size: Tuple3
    client: Client
    aabb: Box3
    targetY: number
    takeoffDistance: number;
    startY: number
    health: number
    fireFrequency: number
    speed: number
}

export enum WorldPartType {
    DEFAULT = "default",
    BUILDINGS_GAP = "gapbuildings",
    BOSS = "boss",
    BUILDINGS_LOW = "lowbuildings",
    AIRSTRIP = "airstrip",
    START = "start",
}

export interface WorldPart {
    id: string
    size: Tuple2
    position: Vector3
    color: number
    type: WorldPartType
}

export interface SpawnedBuilding {
    position: Tuple3
    size: Tuple3
    id: string
}

export interface SpawnedPlane {
    position: Tuple3
    id: string
    speed?: number
    fireFrequency?: number
}

export interface SpawnedRocket {
    position: Tuple3
    id: string
    speed?: number
}

export interface SpawnedTurret {
    position: Tuple3
    id: string
}

export interface SpawnedBarrel {
    position: Tuple3
    id: string
}

export interface WorldPartBuildingsGap extends WorldPart {
    type: WorldPartType.BUILDINGS_GAP
}

export interface WorldPartDefault extends WorldPart {
    type: WorldPartType.DEFAULT
}
export interface WorldPartStart extends WorldPart {
    type: WorldPartType.START
}
export interface WorldPartBoss extends WorldPart {
    type: WorldPartType.BOSS
    level: number
}

export interface WorldPartBuildingsLow extends WorldPart {
    type: WorldPartType.BUILDINGS_LOW
}

export interface WorldPartAirstrip extends WorldPart {
    type: WorldPartType.AIRSTRIP
}


export enum Owner {
    PLAYER = "player",
    ENEMY = "enemy",
}

export interface Bullet {
    id: string
    position: Vector3
    speed: number
    index: number
    rotation: number
    direction: Tuple3
    obb: Tuple3
    mounted: boolean
    size: Tuple3
    aabb: Box3
    color: string
    damage: number
    owner: Owner
}

export interface Particle {
    velocity: Vector3
    position: Vector3
    acceleration: Vector3
    friction: number
    mounted: boolean
    restitution: number
    lifetime: number
    maxLifetime: number
    instance: Instance
    radius: number
    rotation: Vector3
    index: number
    color: string
    id: string
}

export interface RepeaterMesh {
    meshes: Object3D[]
    index: Counter
}

export interface Message {
    text: string
    lifetime: number
    id: string
}