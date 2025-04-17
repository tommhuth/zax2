import "./Debug.scss"

import { useStore } from "@data/store"
import { setPlayerHealth, setPlayerSpeed } from "@data/store/player"
import { addForcedWorldPart, removeForcedWorldPart, setPauseWorldGeneration, setShowColliders } from "@data/store/debug"
import { WorldPartType } from "@data/types"
import { worlPartTypes } from "@data/world/getNextWorldPart"
import { useRef } from "react"
import { setTimeScale } from "@data/store/effects"
import RealtimePosition from "./RealtimePosition"
import { removeWorldPart } from "@data/store/world"
import { useAnimationFrame } from "@data/lib/hooks"
import { useShallow } from "zustand/react/shallow"

function ClientCounter() {
    const clientCountRef = useRef<HTMLDivElement>(null)

    useAnimationFrame(() => {
        let { world } = useStore.getState()

        if (clientCountRef.current) {
            clientCountRef.current.innerText = world.grid.entries.length.toString()
        }
    })

    return (
        <>
            <span ref={clientCountRef} /> clients
        </>
    )
}

function Sliders() {
    const [timeScale, speed] = useStore(
        useShallow(i => [i.effects.timeScale, i.player.speed])
    )

    const sliders = [
        {
            label: "Speed",
            value: speed,
            update: (value: number) => setPlayerSpeed(value),
            range: [0, 15, .1]
        },
        {
            label: "Timescale",
            value: timeScale,
            update: (value: number) => setTimeScale(value),
            range: [0, 2, .001]
        },
    ] as const

    return sliders.map(({ update, label, value, range: [min, max, step] }) => {
        return (
            <label
                key={label}
                className="debug__label"
            >
                {label}: {value.toFixed(3)}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    step={step}
                    onChange={(e) => update(e.currentTarget.valueAsNumber)}
                />
            </label>
        )
    })
}

function Actors() {
    const [boss, world] = useStore(useShallow(i => [i.boss, i.world]))

    return (
        <ul>
            <li>{world.turrets.length} turrets</li>
            <li>{world.planes.length} planes</li>
            <li>{world.barrels.length} barells</li>
            <li>{world.rockets.length} rockets</li>
            <li>{world.bullets.length} bullets</li>
            <li>{boss.heatSeakers.length} heat seakers</li>
            <li><ClientCounter /></li>
        </ul>
    )
}

export default function Debug() {
    const selectRef = useRef<HTMLSelectElement>(null)
    const [
        state,
        parts,
        debug,
        health,
        object,
        position
    ] = useStore(
        useShallow(i => [
            i.state,
            i.world.parts,
            i.debug,
            i.player.health,
            i.player.object,
            i.player.position,
        ])
    )

    return (
        <fieldset
            className="debug"
            onClick={e => {
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
            }}
        >
            <div>State: <strong>{state}</strong></div>

            <RealtimePosition position={object?.position} />
            <Sliders />

            <label className="debug__label">
                <input
                    checked={debug.showColliders}
                    type="checkbox"
                    onChange={e => setShowColliders(e.target.checked)}
                />
                Show colliders
            </label>

            <label className="debug__label">
                <input
                    checked={health === Infinity}
                    type="checkbox"
                    onChange={e => setPlayerHealth(e.target.checked ? Infinity : 100)}
                />
                God mode
            </label>

            <Actors />

            <fieldset>
                <legend className="visually-hidden">World</legend>

                <div className="debug__world-controller">
                    <select
                        ref={selectRef}
                        className="debug__type-select"
                    >
                        <option value="">[SELECT MAP]</option>
                        {Object.values(WorldPartType).map(i => {
                            return <option key={i} value={i}>{i}</option>
                        })}
                    </select>

                    <div className="debug__world-actions">
                        <button
                            onClick={() => {
                                if (!selectRef.current?.selectedIndex) {
                                    return
                                }

                                let type = selectRef.current?.options[selectRef.current.selectedIndex].value as WorldPartType

                                addForcedWorldPart(type)
                            }}
                        >
                            Force
                        </button>
                        <button
                            onClick={() => {
                                if (!selectRef.current?.selectedIndex) {
                                    return
                                }

                                window.localStorage.setItem("initPartType", selectRef.current?.options[selectRef.current.selectedIndex].value)
                                window.location.reload()
                            }}
                        >
                            Restart
                        </button>
                    </div>
                </div>

                <label className="debug__label">
                    <input
                        type="checkbox"
                        checked={debug.pauseWorldGeneration}
                        onChange={(e) => setPauseWorldGeneration(e.currentTarget.checked)}
                    />
                    Pause
                </label>

                <ol className="debug__world-list">
                    {parts.map(part => {
                        let current = part.position.z < position.z && part.position.z + part.size[1] > position.z
                        let previous = part.position.z + part.size[1] < position.z

                        return (
                            <li
                                key={part.id}
                                className="debug__world-item"
                                style={{
                                    textDecoration: previous ? "line-through" : undefined,
                                    color: current ? "black" : undefined,
                                    background: current ? "white" : undefined,
                                }}
                            >
                                <button
                                    disabled={parts.length === 1}
                                    onClick={() => removeWorldPart(part.id)}
                                >
                                    {part.type}
                                </button>
                            </li>
                        )
                    })}
                    {debug.forcedWorldParts.map((i, index) => {
                        return (
                            <li
                                className="debug__world-item"
                                key={index}
                            >
                                <button onClick={() => removeForcedWorldPart(index)}>
                                    {i}
                                </button>
                            </li>
                        )
                    })}
                    <li className="debug__world-item">
                        &lt;{(1 - worlPartTypes.randomPickChance) * 100}% {worlPartTypes.peak()}&gt;
                    </li>
                </ol>
            </fieldset>
        </fieldset>
    )
}