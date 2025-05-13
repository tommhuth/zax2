import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useLayoutEffect } from "react"
import { Matrix4 } from "three"
import { store, useStore } from "../data/store"
import { setTrauma } from "../data/store/effects"
import random from "@huth/random"
import { clamp, damp } from "three/src/math/MathUtils.js"
import { CAMERA_OFFSET, CAMERA_DIRECTION, WORLD_PLAYER_START_Z } from "../data/const"
import { ndelta } from "@data/utils"

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
        camera.position.copy(CAMERA_DIRECTION)
        camera.lookAt(0, 0, 0)
    }, [camera, attempts])

    useLayoutEffect(() => {
        if (setup || attempts > 0) {
            camera.position.z = WORLD_PLAYER_START_Z + CAMERA_DIRECTION.z
        }
    }, [setup, camera, attempts])

    useEffect(() => {
        if (editorMode && typeof z === "number" && setup) {
            camera.position.z = WORLD_PLAYER_START_Z
                + CAMERA_DIRECTION.z
                + z
        }
    }, [z, editorMode, camera, setup])

    useFrame(() => {
        let { world } = store.getState()

        _matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        world.frustum.setFromProjectionMatrix(_matrix)
    })

    useFrame((_, delta) => {
        let { player, effects, state } = store.getState()
        let nd = ndelta(delta)

        if (player.object && setup && !editorMode) {
            let centerOffsetZ = 4 // magic number to adjust for off center x
            let offsetZ = ["running", "gameover"].includes(state) ? CAMERA_OFFSET.z : centerOffsetZ
            let targetZ = player.object.position.z
                + CAMERA_DIRECTION.z
                + offsetZ

            camera.position.z = damp(camera.position.z, targetZ, 2, nd)
            camera.position.x = CAMERA_DIRECTION.x
                + CAMERA_OFFSET.x
                + effects.trauma * random.float(-1, 1)

            setTrauma(damp(effects.trauma, 0, 2, nd))
        }
    })

    return null
}