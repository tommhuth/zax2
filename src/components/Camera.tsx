import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useState } from "react"
import { Matrix4 } from "three"
import { store, useStore } from "../data/store"
import { setTrauma } from "../data/store/effects"
import random from "@huth/random"
import { clamp, damp } from "three/src/math/MathUtils.js"
import { CAMERA_OFFSET, CAMERA_POSITION, WORLD_PLAYER_START_Z } from "../data/const"

let _matrix = new Matrix4()

export function getZoom() {
    return 70 - clamp(1 - (Math.min(window.innerWidth, window.innerHeight) - 400) / 600, 0, 1) * 30
}

export default function Camera({ editorMode = false, z = 0 }) {
    let { camera } = useThree()
    let setup = useStore(i => i.setup)
    let attempts = useStore(i => i.player.attempts)

    useEffect(() => {
        let update = () => {
            camera.zoom = getZoom()
            camera.updateProjectionMatrix()
        }

        screen.orientation.addEventListener("change", update)
        window.addEventListener("resize", update)

        return () => {
            screen.orientation.removeEventListener("change", update)
            window.removeEventListener("resize", update)
        }
    }, [camera])


    useLayoutEffect(() => {
        camera.position.copy(CAMERA_POSITION)
        camera.lookAt(0, 0, 0)
    }, [camera, attempts])

    useLayoutEffect(() => {
        if (setup || attempts > 0) {
            camera.position.z = WORLD_PLAYER_START_Z + CAMERA_POSITION.z
        }
    }, [setup, camera, attempts])

    useFrame(() => {
        let { world } = store.getState()

        _matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        world.frustum.setFromProjectionMatrix(_matrix)
    })

    useEffect(() => {
        if (editorMode && typeof z === "number" && setup) {
            camera.position.z = WORLD_PLAYER_START_Z
                + CAMERA_POSITION.z
                + z
        }
    }, [z, editorMode, camera, setup])

    useFrame((_, delta) => {
        let { player, effects, state } = store.getState()

        if (player.object && setup && !editorMode) {
            let centerOffsetZ = 4 // magic number to adjust for off center x
            let offsetZ = ["running", "gameover"].includes(state) ? CAMERA_OFFSET.z : centerOffsetZ
            let targetZ = player.object.position.z
                + CAMERA_POSITION.z
                + offsetZ

            camera.position.z = damp(camera.position.z, targetZ, 4, delta)
            camera.position.x = CAMERA_POSITION.x
                + CAMERA_OFFSET.x
                + effects.trauma.x * random.float(-1, 1)

            setTrauma(damp(effects.trauma.x, 0, 3, delta))
        }
    })

    return null
}