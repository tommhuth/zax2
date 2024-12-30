import { useFrame, useThree } from "@react-three/fiber"
import { useCallback, useEffect, useLayoutEffect, useRef } from "react"
import { DirectionalLight } from "three"
import { useStore } from "../data/store"
import { CAMERA_OFFSET } from "../data/const"

export default function Lights() {
    let shadowLightRef = useRef<DirectionalLight>(null)
    let { scene, camera } = useThree()
    let time = useRef(0)
    let ready = useStore(i => i.ready)
    let diagonal = useStore(i => i.world.diagonal)
    let updateShadowCamera = useCallback(() => {
        let { player } = useStore.getState()
        let z = player.object ? player.object.position.z + CAMERA_OFFSET.z : camera.position.z + 20

        if (!shadowLightRef.current) {
            return
        }

        shadowLightRef.current.position.z = z
        shadowLightRef.current.target.position.z = z
    }, [camera])

    useEffect(() => {
        if (!shadowLightRef.current) {
            return
        }

        scene.add(shadowLightRef.current.target)
    }, [scene])

    useLayoutEffect(() => {
        if (ready) {
            updateShadowCamera()
            shadowLightRef.current?.shadow.camera.updateProjectionMatrix()
        }
    }, [ready, updateShadowCamera])

    useFrame((state, delta) => {
        let { ready } = useStore.getState()

        // update camera shadow position every 1s
        if (shadowLightRef.current && ready && time.current >= 1000) {
            updateShadowCamera()
            time.current = 0
        } else {
            time.current += delta * 1000
        }
    })

    return (
        <>
            <ambientLight
                color={"#ffffff"}
                intensity={.4} />

            <directionalLight
                ref={shadowLightRef}
                color={"#eef"}
                position={[0, 10, 0]}
                intensity={.65}
                castShadow
                shadow-camera-near={0} // y
                shadow-camera-far={20}
                shadow-camera-left={-8} // x
                shadow-camera-right={14}
                shadow-camera-top={diagonal * .75} // z
                shadow-camera-bottom={-diagonal * 1}
                shadow-mapSize={[512, 512]}
                shadow-bias={-0.003}
            />
            <directionalLight
                position={[-6, 15, -15]}
                intensity={.8}
                color={"#aaeaff"}
            />
        </>
    )
}