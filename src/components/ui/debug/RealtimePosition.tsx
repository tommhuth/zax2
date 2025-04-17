import { useAnimationFrame } from "@data/lib/hooks"
import { useState } from "react"
import type { Vector3 } from "three"

export default function RealtimePosition({ position }: { position?: Vector3 }) {
    let [ref, setRef] = useState<HTMLOutputElement | null>(null)

    useAnimationFrame(() => {
        if (!ref || !position) {
            return
        }

        ref.innerText = `[${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}]`
    })

    return (
        <output ref={setRef} style={{ height: "1em", lineHeight: 1 }} />
    )
}