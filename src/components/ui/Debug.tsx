import { useStore } from "@data/store"
import "./Debug.scss"
import { setPlayerSpeed } from "@data/store/player"
import { addForcedWorldPart, setPauseWorldGeneration, setShowColliders } from "@data/store/debug"
import { WorldPartType } from "@data/types"
import { worlPartTypes } from "@data/world/getNextWorldPart"
import { useRef } from "react"
import { setTimeScale } from "@data/store/world"

export default function Debug() {
    const state = useStore()
    const selectRef = useRef<HTMLSelectElement>(null)

    return (
        <fieldset
            className="debug"
        >
            <div>{state.state}</div>
            <label>
                Speed: {state.player.speed}
                <input
                    type="range"
                    min={0}
                    max={15}
                    value={state.player.speed}
                    step={.1}
                    onChange={(e) => {
                        setPlayerSpeed(e.target.valueAsNumber)
                    }}
                />
            </label>
            <label>
                Timescale: {state.world.timeScale}
                <input
                    type="range"
                    min={0}
                    max={1}
                    value={state.world.timeScale}
                    step={.001}
                    onChange={(e) => {
                        setTimeScale(e.target.valueAsNumber)
                    }}
                />
            </label>
            <label>
                <input
                    checked={state.debug.showColliders}
                    type="checkbox"
                    onChange={e => setShowColliders(e.target.checked)}
                />
                Show colliders
            </label>
            <div>
                Boss: {state.boss.state}
                <div>
                    {((Date.now() - state.boss.lastActiveAt.getTime()) / 1000).toFixed(1)} / {(state.boss.interval / 1000).toLocaleString("en")}
                </div>
            </div>
            <ul>
                <li>Turrets: {state.world.turrets.length}</li>
                <li>Planes: {state.world.planes.length}</li>
                <li>Barells: {state.world.barrels.length}</li>
                <li>Buildings: {state.world.buildings.length}</li>
                <li>Rockets: {state.world.rockets.length}</li>
                <li>Bullets: {state.world.bullets.length}</li>
                <li>Heat seakers: {state.boss.heatSeakers.length}</li>
            </ul>
            <fieldset>
                <legend>World</legend>

                <label
                    style={{
                        margin: "5px 0 5px 10px",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={state.debug.pauseWorldGeneration}
                        onChange={(e) => setPauseWorldGeneration(e.currentTarget.checked)}
                    />
                    No world gen
                </label>
                <div
                    style={{
                        margin: "5px 0 5px 10px",
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

                <ul>
                    {state.world.parts.map(i => {
                        return (
                            <li
                                key={i.id}
                                style={{
                                    marginLeft: 10,
                                    opacity: i.position.z + i.size[1] < state.player.position.z ? .5 : 1,
                                    color: i.position.z < state.player.position.z && i.position.z + i.size[1] > state.player.position.z ? "orange" : undefined
                                }}
                            >
                                {i.type}
                            </li>
                        )
                    })}
                    {state.debug.forcedWorldParts.map((i, index) => {
                        return (
                            <li
                                style={{ marginLeft: 10 }}
                                key={index}
                            >
                                [{i}]
                            </li>
                        )
                    })}
                    <li
                        style={{ marginLeft: 10 }}
                    >
                        [{(1 - worlPartTypes.randomPickChance) * 100}% {worlPartTypes.peak()}]
                    </li>
                </ul>
            </fieldset>
        </fieldset>
    )
}