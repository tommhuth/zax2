import { toggleAxes, toggleGrid, toggleWorldCenter } from "../data/actions"
import { useEditorStore } from "../data/store"

export default function Visualizers() {
    let gridVisible = useEditorStore(i => i.gridVisible)
    let axesVisible = useEditorStore(i => i.axesVisible)
    let worldCenterVisible = useEditorStore(i => i.worldCenterVisible)

    return (
        <>
            <label className="grid">
                <input
                    type="checkbox"
                    checked={gridVisible}
                    onChange={(e) => toggleGrid(e.currentTarget.checked)}
                />
                Grid
            </label>

            <label className="axis">
                <input
                    type="checkbox"
                    checked={axesVisible}
                    onChange={(e) => toggleAxes(e.currentTarget.checked)}
                />
                Axes
            </label>

            <label className="center">
                <input
                    type="checkbox"
                    checked={worldCenterVisible}
                    onChange={(e) => toggleWorldCenter(e.currentTarget.checked)}
                />
                Center
            </label>
        </>
    )
}