import { SpatialHashGrid3D } from "@data/SpatialHashGrid3D"
import { WorldPartType, WorldPart, Bullet, Plane, Turret, Barrel, Rocket, Particle, Explosion, InstanceName, RepeaterMesh, MaterialName, HeatSeaker, BossState, Instance } from "@data/types"
import { Tuple3 } from "src/types.global"
import { Frustum, Vector2, Material, Vector3, Object3D } from "three"

interface ControlsMap {
    d?: boolean
    a?: boolean
    w?: boolean
    s?: boolean
    space?: boolean
}

export interface Store {
    debug: {
        showColliders: boolean
        forcedWorldParts: WorldPartType[]
        pauseWorldGeneration: boolean
    }
    loaded: boolean
    setup: boolean
    ready: boolean
    state: "intro" | "running" | "gameover"
    world: {
        diagonal: number
        parts: WorldPart[]
        frustum: Frustum
        level: number
        timeScale: number
        grid: SpatialHashGrid3D
        bullets: Bullet[]
        turrets: Turret[]
        barrels: Barrel[]
        rockets: Rocket[]
        planes: Plane[]
        lastImpactLocation: Tuple3
    }
    effects: {
        particles: Particle[]
        explosions: Explosion[]
        cameraShake: Vector2
    }
    instances: Record<InstanceName, Instance>
    repeaters: Record<string, RepeaterMesh>
    materials: Record<MaterialName, Material>
    boss: {
        pauseAt: number
        health: number
        position: Vector3
        maxHealth: number
        heatSeakers: HeatSeaker[]
        state: BossState
        time: number
        lastActiveAt: Date
        interval: number
    },
    controls: {
        startPointerPosition: Vector3
        pointerPosition: Vector3
        keys: ControlsMap
    },
    player: {
        speed: number
        velocity: Vector3
        health: number
        score: number
        position: Vector3
        targetPosition: Vector3
        weapon: {
            fireFrequency: number,
            color: string,
            speed: number
            damage: number
        }
        object: Object3D | null
    }
}