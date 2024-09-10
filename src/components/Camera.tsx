import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useLayoutEffect } from "react"
import { Matrix4 } from "three"
import { store, useStore } from "../data/store"
import { setTrauma } from "../data/store/effects"
import random from "@huth/random"
import { damp } from "three/src/math/MathUtils.js"
import { CAMERA_OFFSET, CAMERA_POSITION, WORLD_PLAYER_START_Z } from "../data/const"

let _matrix = new Matrix4()

export default function Camera({ editorMode = false, z = 0 }) {
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
    }, [setup, editorMode])

    useFrame(() => {
        let { world } = store.getState()

        _matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        world.frustum.setFromProjectionMatrix(_matrix)
    })

    useEffect(()=> {
        if (editorMode && z) {
            camera.position.z = WORLD_PLAYER_START_Z + CAMERA_POSITION.z + z
        }
    }, [z, editorMode])

    useFrame((state, delta) => {
        let { player, effects } = store.getState()

        if (player.object && setup && !editorMode) {
            let targetZ = player.object.position.z + CAMERA_POSITION.z + CAMERA_OFFSET.z

            camera.position.z = damp(camera.position.z, targetZ, 5, delta)
            camera.position.x = CAMERA_POSITION.x + CAMERA_OFFSET.x + effects.trauma.x * random.float(-1, 1)

            setTrauma(damp(effects.trauma.x, 0, 3, delta))
        }
    })

    return null
}