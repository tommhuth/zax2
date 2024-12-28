import { useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import { Mesh } from "three" 
import { useWindowEvent } from "../data/hooks"
import { useStore } from "../data/store" 
import { EDGE_MAX, EDGE_MIN } from "../data/const"
 
export default function Controls() {
    let {pointerPosition, keys, startPointerPosition} = useStore(i => i.controls)
    let playerTargetPosition = useStore(i => i.player.targetPosition)
    let playerPosition = useStore(i => i.player.position)
    let hitboxRef = useRef<Mesh>(null) 
    let [isMovingUp, setIsMovingUp] = useState(false)
    let previousZ = useRef<null | number>(null)

    useWindowEvent("keydown", (e: KeyboardEvent) => {
        keys[e.code.replace("Key", "").toLowerCase()] = true
    })

    useWindowEvent("keyup", (e: KeyboardEvent) => {
        keys[e.code.replace("Key", "").toLowerCase()] = false
    })

    useEffect(() => {
        let shootDiv = document.getElementById("shoot") as HTMLElement
        // shoot 
        let onTouchStartShoot = () => {
            keys.space = true
        }
        let onTouchEndShoot = () => {
            delete keys.space
        }

        shootDiv.addEventListener("touchstart", onTouchStartShoot)
        shootDiv.addEventListener("touchend", onTouchEndShoot)
        shootDiv.addEventListener("touchcancel", onTouchEndShoot)

        return () => {
            shootDiv.removeEventListener("touchstart", onTouchStartShoot)
            shootDiv.removeEventListener("touchend", onTouchEndShoot)
            shootDiv.removeEventListener("touchcancel", onTouchEndShoot)
        }
    }, [keys])

    useFrame(() => { 
        if (previousZ.current !== null) { 
            // also move any pointer start position forward too
            pointerPosition.z += playerPosition.z - previousZ.current   
        }

        previousZ.current = playerPosition.z  
    })

    useFrame(()=> {
        if (!hitboxRef.current) {
            return 
        }

        hitboxRef.current.position.z = playerPosition.z
    })

    return ( 
        <mesh
            ref={hitboxRef}
            position-y={.1}
            visible={false}
            rotation-x={-Math.PI / 2}
            onPointerUp={() => {
                setIsMovingUp(false) 
            }}
            onPointerMove={({ pointerType, point }) => {
                if (pointerType === "touch") {
                    let depthThreshold = 2  

                    if (Math.abs(startPointerPosition.z - point.z) > depthThreshold) {
                        setIsMovingUp(true) 
                    }

                    if (isMovingUp) { 
                        playerTargetPosition.y += (point.z - pointerPosition.z)
                    }

                    playerTargetPosition.x += (point.x - pointerPosition.x) * 1.5
                    playerTargetPosition.clamp(EDGE_MIN, EDGE_MAX)
                    pointerPosition.copy(point)
                }
            }}
            onPointerDown={(e) => {
                if (e.pointerType === "touch") {
                    pointerPosition.set(e.point.x, 0, e.point.z)
                    startPointerPosition.set(0, 0, e.point.z)
                }
            }}
        >
            <planeGeometry args={[20, 20, 1, 1]} />
            <meshBasicMaterial name="hitbox" />
        </mesh>
    )
}