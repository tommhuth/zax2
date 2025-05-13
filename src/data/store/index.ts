import { Frustum, Vector3 } from "three"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { BossState } from "../types"
import { ZaxStore } from "./types.store"
import { WORLD_CENTER_X } from "@data/const"
import { SpatialHashGrid3D } from "@data/lib/SpatialHashGrid3D"

const store = create(
    subscribeWithSelector<ZaxStore>(() => ({
        debug: {
            showColliders: false,
            forcedWorldParts: [],
            pauseWorldGeneration: false,
        },
        loaded: false,
        setup: false,
        ready: false,
        state: "intro",
        world: {
            diagonal: 1,
            grid: new SpatialHashGrid3D([12, 20, 12]),
            frustum: new Frustum(),
            parts: [],
            planes: [],
            turrets: [],
            barrels: [],
            bullets: [],
            rockets: [],
        },
        effects: {
            explosions: [],
            particles: [],
            trauma: 0,
            lastImpactLocation: [0, 0, -Infinity],
            timeScale: 1,
            time: 0,
        },
        instances: {} as ZaxStore["instances"],
        repeaters: {},
        materials: {} as ZaxStore["materials"],
        boss: {
            pauseAt: -Infinity,
            health: Infinity,
            position: new Vector3(),
            maxHealth: Infinity,
            heatSeakers: [],
            state: BossState.UNKNOWN,
            time: 0,
            lastActiveAt: new Date(),
            interval: 60_000 * 3,
        },
        player: {
            keys: {},
            position: new Vector3(),
            targetPosition: new Vector3(WORLD_CENTER_X, 0, 0),
            velocity: new Vector3(),
            level: 1,
            speed: 5,
            health: 100,
            score: 0,
            object: null,
            attempts: 0,
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