import { store } from "../store"

export function registerBoss({
    pauseAt,
    parts,
    size,
    position,
}) {
    store.setState({
        boss: {
            pauseAt,
            parts,
            position,
            size,
            health: 100,

        }
    })
}

export function removeBoss() {
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