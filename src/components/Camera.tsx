import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect } from "react"
import { Matrix4 } from "three"
import { store, useStore } from "../data/store"
import { setCameraShake } from "../data/store/player"
import random from "@huth/random"
import { damp } from "three/src/math/MathUtils.js"
import { CAMERA_CENTER_OFFSET, CAMERA_OFFSET, CAMERA_POSITION, WORLD_PLAYER_START_Z } from "../data/const"

let _matrix = new Matrix4()

export default function Camera() {
    let { camera } = useThree() 
    let setup = useStore(i => i.setup)

    useLayoutEffect(() => {
        camera.position.copy(CAMERA_POSITION)
        camera.lookAt(0, 0, 0) 
        camera.position.add(CAMERA_OFFSET)
    }, [camera])

    useLayoutEffect(() => {
        if (setup) { 
            camera.position.z = WORLD_PLAYER_START_Z + CAMERA_POSITION.z + CAMERA_OFFSET.z
        }
    }, [setup])

    useFrame(() => {
        let { world } = store.getState()

        _matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        world.frustum.setFromProjectionMatrix(_matrix)
    })

    useFrame((state, delta) => {
        let { player } = store.getState()

        if (player.object && setup) {
            let targetZ = player.object.position.z + CAMERA_POSITION.z + CAMERA_OFFSET.z

            camera.position.z = damp(camera.position.z, targetZ, 5, delta)
            camera.position.x = CAMERA_POSITION.x + CAMERA_OFFSET.x + player.cameraShake * random.float(-1, 1)
            setCameraShake(damp(player.cameraShake, 0, 7, delta))
        }
    })

    return null
}