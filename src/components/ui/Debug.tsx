import "./Debug.scss"

import { useStore } from "@data/store"
import { setPlayerHealth, setPlayerSpeed } from "@data/store/player"
import { addForcedWorldPart, setPauseWorldGeneration, setShowColliders } from "@data/store/debug"
import { WorldPartType } from "@data/types"
import { worlPartTypes } from "@data/world/getNextWorldPart"
import { useRef } from "react"
import { setTimeScale } from "@data/store/effects"

export default function Debug() {
    const [
        state,
        boss,
        world,
        debug,
        player,
        effects,
    ] = useStore(i => [i.state, i.boss, i.world, i.debug, i.player, i.effects])
    const selectRef = useRef<HTMLSelectElement>(null)

    return (
        <fieldset
            className="debug"
        >
            <div>{state}</div>
            <label>
                Speed: {player.speed}
                <input
                    type="range"
                    min={0}
                    max={15}
                    value={player.speed}
                    step={.1}
                    onChange={(e) => {
                        setPlayerSpeed(e.target.valueAsNumber)
                    }}
                />
            </label>
            <label>
                Timescale: {effects.timeScale.toFixed(4)}
                <input
                    type="range"
                    min={0}
                    max={2}
                    value={effects.timeScale}
                    step={.001}
                    onChange={(e) => {
                        setTimeScale(e.target.valueAsNumber)
                    }}
                />
            </label>
            <label>
                <input
                    checked={debug.showColliders}
                    type="checkbox"
                    onChange={e => setShowColliders(e.target.checked)}
                />
                Show colliders
            </label>
            <label>
                <input
                    checked={player.health === Infinity}
                    type="checkbox"
                    onChange={e => setPlayerHealth(e.target.checked ? Infinity : 100)}
                />
                God mode
            </label>
            <div>
                Boss: {boss.state}
                <div>
                    {((Date.now() - boss.lastActiveAt.getTime()) / 1000).toFixed(1)} / {(boss.interval / 1000).toLocaleString("en")}
                </div>
            </div>
            <ul>
                <li>Turrets: {world.turrets.length}</li>
                <li>Planes: {world.planes.length}</li>
                <li>Barells: {world.barrels.length}</li>
                <li>Rockets: {world.rockets.length}</li>
                <li>Bullets: {world.bullets.length}</li>
                <li>Heat seakers: {boss.heatSeakers.length}</li>
            </ul>
            <fieldset>
                <legend className="visually-hidden">World</legend>

                <label
                    style={{
                        margin: "5px 0 5px 0",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={debug.pauseWorldGeneration}
                        onChange={(e) => setPauseWorldGeneration(e.currentTarget.checked)}
                    />
                    Pause worldgen
                </label>
                <div
                    style={{
                        margin: "5px 0 5px 0",
                        display: "flex",
                        flexDirection: "column",
                        color: "black",
                        background: "white",
                        borderRadius: 5,
                        padding: 5
                    }}
                >
                    <select ref={selectRef}>
                        <option value="">-</option>
                        {Object.values(WorldPartType).map(i => {
                            return <option key={i} value={i}>{i}</option>
                        })}
                    </select>
                    <div style={{ width: "100%", display: "flex", textAlign: "center" }}>
                        <button
                            style={{ flex: "1 1" }}
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
                            style={{ flex: "1 1" }}
                            onClick={() => {
                                if (!selectRef.current?.selectedIndex) {
                                    return
                                }

                                window.localStorage.setItem("initPartType", selectRef.current?.options[selectRef.current.selectedIndex].value)
                                window.location.reload()
                            }}
                        >
                            Reload
                        </button>
                    </div>
                </div>

                <ol>
                    {world.parts.map(i => {
                        return (
                            <li
                                key={i.id}
                                style={{ 
                                    opacity: i.position.z + i.size[1] < player.position.z ? .5 : 1,
                                    color: i.position.z < player.position.z && i.position.z + i.size[1] > player.position.z ? "orange" : undefined
                                }}
                            >
                                {i.type}
                            </li>
                        )
                    })}
                    {debug.forcedWorldParts.map((i, index) => {
                        return (
                            <li 
                                key={index}
                            >
                                [{i}]
                            </li>
                        )
                    })}
                    <li>
                        [{(1 - worlPartTypes.randomPickChance) * 100}% {worlPartTypes.peak()}]
                    </li>
                </ol>
            </fieldset>
        </fieldset>
    )
}