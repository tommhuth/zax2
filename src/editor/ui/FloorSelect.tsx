import { list } from "@data/utils"
import { setFloorType } from "../data/actions"
import { useEditorStore } from "../data/store"
import { EditorStore } from "../data/types"

export default function FloorSelect() {
    let floorType = useEditorStore(i => i.floorType)

    return (
        <select
            onChange={e => setFloorType(e.currentTarget.value as EditorStore["floorType"])}
            value={floorType}
            style={{
                marginRight: "2em",
                marginLeft: "auto",
                width: "min-content",
                cursor: "pointer"
            }}
        >
            {list(6).map((index) => {
                let value = "floor" + (index + 1)

                return (
                    <option key={value} value={value}>
                        Floor {index + 1}
                    </option>
                )
            })}
        </select>
    )
}