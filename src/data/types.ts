import { Box3, InstancedMesh, Object3D, Vector3 } from "three"
import { Tuple2, Tuple3 } from "../types"
import Counter from "./Counter"
import { Client } from "./SpatialHashGrid3D"

export type MaterialName = "plane" |  "rocket" | "platform" | "grass" | "exhaust" 
    | "bossLightBlue" | "bossBlack" | "bossDarkBlue" | "bossBlue" | "bossSecondaryBlue"
    | "bossWhite" | "buildingHi" | "buildingBase" | "buildingDark" | "barrel" | "rock"
    | "floorBase" | "floorHi" | "floorMark" | "floorSolid"  | "bossFloorHi" | "turret"

export type InstanceName = "leaf" | "scrap" |  "line" | "box" | "sphere" | "particle" | "device"
    | "fireball" | "cable" | "cylinder" | "shimmer" | "dirt"
    | "grass" | "plant" | "shockwave" | "blast" | "decal"  

export type RepeaterName = "tower1" | "tower2"| "tower3"| "tower3"| "tower3"| "tower3"
    | "tanks" | "wall1" | "wall2" | "wall3" | "wall4" | "floor6"
    | "hangar" | "floor1" | "floor2" | "floor3" | "floor4"

export type CollisionObjectType = "plant" | "barrel" | "player" | "boss" | "heatseaker" 
    | "plane" | "turret" | "building" | "rocket" | "vehicle"

export enum BossState {
    IDLE = "idle",
    ACTIVE = "active",  
    DEAD = "dead",
    OUTRO = "outro",
    UNKNOWN = "unknown"
}

export interface Fireball {
    isPrimary?: boolean
    position: Tuple3
    index: number
    startRadius: number
    maxRadius: number
    lifetime: number 
    time: number
    id: string
    type?: "primary" | "secondary"
}

export interface Explosion {
    position: Tuple3
    radius: number
    lifetime: number
    time: number
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
    size: number
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
    floorLevel: number
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
    rotation: number
    targetY: number
    takeoffAt: number;
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
    velocity: Tuple3
    position: Tuple3
    acceleration: Tuple3
    friction: number
    mounted: boolean
    restitution: number
    time: number 
    instance: Instance
    radius: number
    rotation: Tuple3
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