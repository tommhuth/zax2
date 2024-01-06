import random from "@huth/random"
import { store } from "."
import { Tuple3 } from "../../types"
import { Vector3 } from "three"

export function registerBoss({
    pauseAt,  
    position,
}) { 
    store.setState({
        boss: {
            pauseAt,
            position, 
            health: 100,
            maxHealth: 100,
            heatSeakers: [],
        }
    })
}

export function removeHeatSeaker(id: string) {
    let { boss } = store.getState()

    if (boss) {
        store.setState({
            boss: {
                ...boss,
                heatSeakers: boss.heatSeakers.filter(i => i.id !== id)
            }
        })
    }
}

export function createHeatSeaker([x, y, z]: Tuple3) {
    let { world, boss, instances } = store.getState()

    if (boss) {
        let id = random.id()
        let position = new Vector3(x, y, z)
        let size: Tuple3 = [.35, .35, .35]
        let client = world.grid.createClient(position.toArray(), size, {
            type: "heatseaker",
            id, 
        })

        store.setState({
            boss: {
                ...boss,
                heatSeakers: [
                    ...boss.heatSeakers,
                    {
                        id,
                        client,
                        velocity: new Vector3(),
                        size,
                        position,
                        index: instances.sphere.index.next(),
                    }
                ]
            }
        })

        return id
    }
}

export function removeBoss() {
    let boss = store.getState().boss

    if (boss) {
        for (let heatSeaker of boss.heatSeakers) {
            removeHeatSeaker(heatSeaker.id)
        }
    }

    store.setState({
        boss: null
    })
}

export function damageBoss(amount: number) {
    let boss = store.getState().boss

    if (boss) {
        store.setState({
            boss: {
                ...boss,
                health: Math.max(boss.health - amount, 0)
            }
        })
    }
}