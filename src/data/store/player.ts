import { Object3D } from "three"
import { store } from "../store"

export function setLastImpactLocation(x: number, y: number, z: number) {
    store.setState({
        player: {
            ...store.getState().player,
            lastImpactLocation: [x, y, z]
        },
    })

}

export function setPlayerSpeed(speed: number) {
    store.setState({
        player: {
            ...store.getState().player,
            speed,
        }
    })
}

export function setPlayerObject(object: Object3D) {
    store.setState({
        player: {
            ...store.getState().player,
            object
        }
    })
}

export function increaseScore(amount: number) {
    store.setState({
        player: {
            ...store.getState().player,
            score: store.getState().player.score + amount,
        }
    })
}

export function damagePlayer(damage: number) {
    let player = store.getState().player

    store.setState({
        player: {
            ...player,
            health: Math.max(player.health - damage, 0),
        }
    })
}

export function setCameraShake(cameraShake: number) {
    store.setState({
        player: {
            ...store.getState().player,
            cameraShake,
        }
    })
}