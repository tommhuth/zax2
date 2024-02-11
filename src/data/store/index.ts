import { Frustum, Object3D, Vector3 } from "three"
import type { Material } from "three"
import { create } from "zustand"
import { Tuple3 } from "../../types"
import {
    Barrel, BossState, Building, Bullet, Explosion, HeatSeaker, Instance, InstanceName, MaterialName, Particle,
    Plane, RepeaterMesh, Rocket, Shimmer, Turret, WorldPart
} from "../types"
import { SpatialHashGrid3D } from "../world/SpatialHashGrid3D"
import { clamp } from "../utils"
import { WORLD_BOTTOM_EDGE, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE, WORLD_TOP_EDGE } from "../../components/world/World"

export const zoom = 70 - clamp(1 - (Math.min(window.innerWidth, window.innerHeight) - 400) / 600, 0, 1) * 30 

export let isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 900
export const pixelSize = isSmallScreen ? 4 : 5
export const dpr = 1 / pixelSize
export const bulletSize: Tuple3 = [.15, .2, 1.5] 

export const edgeMin = new Vector3(WORLD_RIGHT_EDGE, WORLD_BOTTOM_EDGE, -Infinity)
export const edgeMax = new Vector3(WORLD_LEFT_EDGE, WORLD_TOP_EDGE, Infinity)

interface ControlsMap {
    d?: boolean
    a?: boolean
    w?: boolean
    s?: boolean
    space?: boolean
}

export interface Store {
    loaded: boolean
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
        shimmer: Shimmer[]
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

const store = create<Store>(() => ({
    loaded: false,
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
        shimmer: [],
    },
    instances: {} as Store["instances"],
    repeaters: {},
    materials: {} as Store["materials"],
    boss: {
        pauseAt: -Infinity,
        health: Infinity,
        position: new Vector3(),
        maxHealth: Infinity,
        heatSeakers:  [],
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
const useStore = store

export { store, useStore }