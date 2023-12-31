import { Frustum, Object3D, Vector3 } from "three"
import { create } from "zustand"
import { Tuple3 } from "../../types"
import {
    Barrel, Building, Bullet, Explosion, HeatSeaker, Instance, InstanceName, Particle,
    Plane, RepeaterMesh, Rocket, Shimmer, Turret, WorldPart
} from "../types"
import { makeBuildingsLow, makeStart } from "../world/generators"
import { SpatialHashGrid3D } from "../world/SpatialHashGrid3D"

export let isSmallScreen = window.matchMedia("(max-height: 400px)").matches || window.matchMedia("(max-width: 800px)").matches
export const pixelSize = isSmallScreen ? 4 : 5
export const dpr = 1 / pixelSize
export const bulletSize: Tuple3 = [.15, .2, 1.5]

export interface Store {
    loaded: boolean
    state: "intro" | "running" | "gameover"
    world: {
        parts: WorldPart[]
        frustum: Frustum
        grid: SpatialHashGrid3D
        bullets: Bullet[]
        turrets: Turret[]
        barrels: Barrel[]
        rockets: Rocket[]
        planes: Plane[]
        buildings: Building[]
    }
    effects: {
        particles: Particle[]
        shimmer: Shimmer[]
        explosions: Explosion[]
    }
    instances: Record<InstanceName, Instance>
    repeaters: Record<string, RepeaterMesh>
    boss: { 
        pauseAt: number
        health: number
        position: Vector3 
        maxHealth: number
        heatSeakers: HeatSeaker[] 
    } | null,
    player: {
        speed: number
        cameraShake: number
        health: number
        score: number
        lastImpactLocation: Tuple3
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
    state: "intro",
    world: {
        grid: new SpatialHashGrid3D([4, 3, 4]),
        frustum: new Frustum(),
        parts: [
            makeBuildingsLow({ position: new Vector3(0, 0, 0), size: [0, 0] }),
        ],
        buildings: [],
        planes: [],
        turrets: [],
        barrels: [],
        bullets: [],
        rockets: [],
    },
    effects: {
        explosions: [],
        particles: [],
        shimmer: [],
    },
    instances: {} as Store["instances"],
    repeaters: {},
    boss: null,
    player: {
        speed: 0,
        cameraShake: 0,
        health: 100,
        score: 0,
        object: null,
        lastImpactLocation: [0, -10, 0],
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