import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo } from "react"
import { Matrix4, Vector3 } from "three"
import { store, useStore } from "../data/store"
import { Tuple3 } from "../types"
import { setCameraShake } from "../data/store/player"
import random from "@huth/random"
import { damp } from "three/src/math/MathUtils.js"

let _matrix = new Matrix4()

export default function Camera({ startPosition = [0, 15, 0] }: { startPosition?: Tuple3 }) {
    let { camera } = useThree()
    let basePosition = useMemo(() => new Vector3(), [])
    let ready = useStore(i => i.ready)

    useLayoutEffect(() => {
        camera.position.setFromSphericalCoords(
            100,
            -Math.PI / 3, // 60 degrees from positive Y-axis and 30 degrees to XZ-plane
            Math.PI / 4  // 45 degrees, between positive X and Z axes, thus on XZ-plane
        )
        camera.lookAt(0, 0, 0)
        camera.position.x += 4
        basePosition.copy(camera.position)
    }, [camera, ...startPosition])

    useEffect(()=> {
        if (ready) {
            camera.position.z = 65
        }
    }, [ready])

    useFrame(()=> {
        let { world } = store.getState()

        _matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse) 
        world.frustum.setFromProjectionMatrix(_matrix)

    })

    useFrame((state, delta) => {
        let { player } = store.getState()

        if (player.object && ready) {
            let targetZ = (basePosition.z + player.object.position.z + 6) 

            camera.position.z = damp(camera.position.z, targetZ, 5, delta) 
            camera.position.x = basePosition.x + player.cameraShake * random.float(-1, 1) 
            setCameraShake(damp(player.cameraShake, 0, 7, delta))
        }
    })

    return null
}