import { Box3, ColorRepresentation, InstancedMesh, Object3D, Vector3 } from "three"
import { Tuple2, Tuple3 } from "../types.global"
import Counter from "./Counter"
import { Client } from "./SpatialHashGrid3D"
import LineSegment from "./LineSegment"

export type MaterialName = "device" | "plane" | "rocket" | "platform" | "grass" | "exhaust"
    | "bossLightBlue" | "bossBlack" | "bossDarkBlue" | "bossBlue" | "bossSecondaryBlue" | "muzzle"
    | "bossWhite" | "buildingHi" | "buildingBase" | "buildingDark" | "barrel" | "rock" | "white"
    | "floorBase" | "floorHi" | "floorMark" | "floorRock" | "turret" | "asteroid" | "turretDark"

export type InstanceName = "leaf" | "scrap" | "line" | "sphere" | "particle"
    | "fireball" | "cable" | "shimmer" | "dirt" | "plant" | "shockwave" | "decal"

export type RepeaterName = "tower1" | "tower2" | "tower3"
    | "tanks" | "hangar"
    | "wall1" | "wall2" | "wall3" | "wall4"
    | "floor1" | "floor2" | "floor3" | "floor4" | "floor5" | "floor6"

export type CollisionObjectType = "plant" | "barrel" | "player" | "boss" | "heatSeaker"
    | "plane" | "turret" | "building" | "rocket" | "vehicle" | "obstacle"

export enum BossState {
    IDLE = "idle",
    ACTIVE = "active",
    DEAD = "dead",
    OUTRO = "outro",
    UNKNOWN = "unknown"
}

export type State = "intro" | "running" | "gameover"

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
    health: number
}

export interface Instance {
    mesh: InstancedMesh;
    maxCount: number;
    index: Counter;
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
    floorAt: number
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
    BOSS = "boss",
    START = "start",
    DEFAULT = "default",
    BUILDINGS_GAP = "buildings-gap",
    BUILDINGS_LOW = "buildings-low",
    AIRSTRIP = "airstrip",
    ROCK_VALLEY = "rock-valley",
    GRASS = "grass",
}

export interface WorldPart {
    id: string
    size: Tuple2
    position: Vector3
    type: WorldPartType
}

export enum Owner {
    PLAYER = "player",
    ENEMY = "enemy",
}

export interface Bullet {
    id: string
    speed: number
    index: number
    rotation: number
    mounted: boolean
    color: ColorRepresentation
    owner: Owner
    lightIndex: number
    line: LineSegment
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
    color: ColorRepresentation
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