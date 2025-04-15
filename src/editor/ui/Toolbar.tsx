import SaveFileButtons from "../ui/SaveFileButtons"
import GenerateMap from "../ui/GenerateMap"
import LayerSelect from "../ui/LayerSelect"
import MapPicker from "../ui/MapPicker"
import ObjectDropper from "../ui/ObjectDropper"
import Visualizers from "../ui/Visualizers"
import Panner from "../ui/Panner"
import FloorSelect from "../ui/FloorSelect"

export default function Toolbar() {
    return (
        <>
            <div
                style={{
                    zIndex: 10000,
                    position: "fixed",
                    top: "1em",
                    display: "flex",
                    gap: "1em",
                    right: "2em",
                    placeItems: "center"
                }}
            >
                <SaveFileButtons />
                <LayerSelect />
                <MapPicker />
            </div>

            <ObjectDropper />

            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    borderBottom: "2.5em transparent solid",
                    right: "2em",
                    left: "2em",
                    zIndex: 10000,
                    display: "flex",
                    borderRadius: 4,
                    placeContent: "center",
                }}
            >
                <GenerateMap />
                <FloorSelect />
                <Visualizers />
                <Panner />
            </div>
        </>
    )
}