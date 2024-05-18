import { startTransition, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import random from "@huth/random"
import { useStore } from "../../../data/store"
import { ndelta } from "../../../data/utils"
import Counter from "../../../data/world/Counter"

import TrafficElement, { TrafficElementObject, createTrafficElement } from "./TrafficElement"

interface TrafficProps {
    z: number
    depth?: number
    frequency?: number
    levels?: [min: number, max: number]
}

export default function Traffic({
    z,
    depth = 3,
    frequency = 3250, // per level
    levels: [minLevel, maxLevel] = [0, 2]
}: TrafficProps) {
    let lastAddAt = useRef(0)
    let nextAddAt = useRef(frequency)
    let level = useMemo(() => new Counter(maxLevel, minLevel), [maxLevel, minLevel])
    let [vehicles, setVehicles] = useState<TrafficElementObject[]>([])
    let hasRun = useRef(false)

    useLayoutEffect(() => {
        if (hasRun.current) {
            return
        }

        setVehicles([
            createTrafficElement(z, level, depth, 6, 1),
            createTrafficElement(z, level, depth, -8, 2),
        ])
        hasRun.current = true
    }, [])

    useFrame((state, delta) => {
        let player = useStore.getState().player.object
        let diagonal = useStore.getState().world.diagonal

        if (
            lastAddAt.current > nextAddAt.current 
            && player && player.position.z < z
            && z > player.position.z - diagonal 
        ) { 
            startTransition(() => { 
                setVehicles([
                    ...vehicles,
                    ...new Array(maxLevel - minLevel)
                        .fill(null)
                        .map(() => createTrafficElement(z - 2, level, depth))

                ])
            })

            lastAddAt.current = 0
            nextAddAt.current = random.integer(frequency, frequency * 1.3)
        } else {
            lastAddAt.current += ndelta(delta) * 1000
        }
    })

    return vehicles.map(i => (
        <TrafficElement
            vehicle={i}
            key={i.id}
            remove={() => {
                setVehicles(vehicles.filter(j => j.id !== i.id))
            }}
        />
    ))
}