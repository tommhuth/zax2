import { Frustum, Object3D, Vector3 } from "three"
import type { Material } from "three"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { Tuple3 } from "../../types"
import {
    Barrel, BossState, Building, Bullet, Explosion, HeatSeaker, Instance, InstanceName, MaterialName, Particle,
    Plane, RepeaterMesh, Rocket, Turret, WorldPart
} from "../types"
import { SpatialHashGrid3D } from "../world/SpatialHashGrid3D" 


interface ControlsMap {
    d?: boolean
    a?: boolean
    w?: boolean
    s?: boolean
    space?: boolean
}

export interface Store {
    loaded: boolean
    setup: boolean
    ready: boolean
    state: "intro" | "running" | "gameover"
    world: {
        parts: WorldPart[]
        frustum: Frustum
        level: number
        grid: SpatialHashGrid3D
        bullets: Bullet[]
        turrets: Turret[]
        barrels: Barrel[]
        rockets: Rocket[]
        planes: Plane[]
        buildings: Building[]
        lastImpactLocation: Tuple3
    }
    effects: {
        particles: Particle[] 
        explosions: Explosion[]
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
    },
    controls: {
        startPointerPosition: Vector3
        pointerPosition: Vector3
        keys: ControlsMap
    },
    player: {
        speed: number
        velocity: Vector3
        cameraShake: number
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

const store = create(
    subscribeWithSelector<Store>(() => ({
        loaded: false,
        setup: false,
        ready: false,
        state: "intro",
        world: {
            grid: new SpatialHashGrid3D([4, 3, 4]),
            frustum: new Frustum(),
            level: 1,
            parts: [],
            buildings: [],
            planes: [],
            turrets: [],
            barrels: [],
            bullets: [],
            rockets: [],
            lastImpactLocation: [0, 0, -Infinity],
        },
        effects: {
            explosions: [],
            particles: [], 
        },
        instances: {} as Store["instances"],
        repeaters: {},
        materials: {} as Store["materials"],
        boss: {
            pauseAt: -Infinity,
            health: Infinity,
            position: new Vector3(),
            maxHealth: Infinity,
            heatSeakers: [],
            state: BossState.UNKNOWN,
            time: 0,
        },
        controls: {
            startPointerPosition: new Vector3(),
            pointerPosition: new Vector3(),
            keys: {}
        },
        player: {
            position: new Vector3(),
            targetPosition: new Vector3(),
            velocity: new Vector3(),
            speed: 0,
            cameraShake: 0,
            health: 100,
            score: 0,
            object: null,
            weapon: {
                fireFrequency: 150,
                damage: 35,
                color: "yellow",
                speed: 40,
            },
        }
    }))
)
const useStore = store

export { store, useStore }