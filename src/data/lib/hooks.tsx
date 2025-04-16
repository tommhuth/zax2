import { useEffect, useRef } from "react"

export const useAnimationFrame = (callback: (delta: number) => void) => {
    const requestRef = useRef<number>()
    const previousTimeRef = useRef<number>()

    useEffect(() => {
        const animate = (time: number) => {
            if (typeof previousTimeRef.current == "number") {
                const deltaTime = time - previousTimeRef.current

                callback(deltaTime)
            }

            previousTimeRef.current = time
            requestRef.current = requestAnimationFrame(animate)
        }

        requestRef.current = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(requestRef.current as number)
    })
}

export function useWindowEvent(name: string | string[], func: (e: any) => void, deps: any[] = []) {
    useEffect(() => {
        if (Array.isArray(name)) {
            name.forEach(name => window.addEventListener(name, func))
        } else {
            window.addEventListener(name, func)
        }

        return () => {
            if (Array.isArray(name)) {
                name.forEach(name => window.removeEventListener(name, func))
            } else {
                window.removeEventListener(name, func)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}