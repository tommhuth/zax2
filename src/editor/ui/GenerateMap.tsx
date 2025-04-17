import generateMap from "../data/generateMap"
import { useEditorStore } from "../data/store"

export default function GenerateMap() {
    return (
        <button
            className="generate-map"
            onClick={() => {
                let store = useEditorStore.getState()
                let file = generateMap(store, store.name)
                let downloadLink = document.createElement("a")
                let type = "text/plain"
                let blob = new Blob([file], { type })

                downloadLink.href = URL.createObjectURL(blob)
                downloadLink.download = store.name + ".tsx"
                downloadLink.click()
                navigator.clipboard.write([new ClipboardItem({ [type]: blob })])
            }}
        >
            &uarr; Generate
        </button>
    )
}