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
            <div className="toolbar-top">
                <SaveFileButtons />
                <LayerSelect />
                <MapPicker />
            </div>

            <ObjectDropper />

            <div className="toolbar-bottom">
                <GenerateMap />
                <FloorSelect />
                <Visualizers />
                <Panner />
            </div>
        </>
    )
}