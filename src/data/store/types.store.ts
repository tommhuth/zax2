import { SpatialHashGrid3D } from "@data/lib/SpatialHashGrid3D"
import { WorldPartType, WorldPart, Bullet, Plane, Turret, Barrel, Rocket, Particle, Explosion, InstanceName, RepeaterMesh, MaterialName, HeatSeaker, BossState, Instance, State } from "@data/types"
import { Tuple3 } from "src/types.global"
import { Frustum, Vector2, Material, Vector3, Object3D } from "three"

interface ControlsMap {
    d?: boolean
    a?: boolean
    w?: boolean
    s?: boolean
    space?: boolean
}

export interface ZaxStore {
    debug: {
        showColliders: boolean
        forcedWorldParts: WorldPartType[]
        pauseWorldGeneration: boolean
    }
    loaded: boolean
    setup: boolean
    ready: boolean
    state: State
    world: {
        diagonal: number
        parts: WorldPart[]
        frustum: Frustum
        grid: SpatialHashGrid3D
        bullets: Bullet[]
        turrets: Turret[]
        barrels: Barrel[]
        rockets: Rocket[]
        planes: Plane[]
    }
    effects: {
        particles: Particle[]
        explosions: Explosion[]
        trauma: Vector2
        lastImpactLocation: Tuple3
        timeScale: number
        time: number
    }
    instances: Record<InstanceName, Instance>
    repeaters: Record<string, RepeaterMesh>
    materials: Record<MaterialName, Material>
    boss: {
        pauseAt: number
        health: number
        maxHealth: number
        heatSeakers: HeatSeaker[]
        state: BossState
        time: number
        lastActiveAt: Date
        interval: number
    },
    controls: {
        keys: ControlsMap
    },
    player: {
        speed: number
        velocity: Vector3
        health: number
        score: number
        level: number
        position: Vector3
        targetPosition: Vector3
        attempts: number,
        weapon: {
            fireFrequency: number,
            color: string,
            speed: number
        }
        object: Object3D | null
    }
}