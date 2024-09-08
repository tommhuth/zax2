import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { setActiveObject, addObject } from "./editor/data/actions"; 
import { from2dTo3d, roundToNearest, precision } from "./editor/data/utils";
import { EditorObjectInit } from "./Editor";

export default function Dropzone() {
    let { camera, gl } = useThree()

    useEffect(() => {
        let onDragOver = (e: DragEvent) => {
            e.preventDefault();
        }
        let onDrop = (e: DragEvent) => {
            e.preventDefault();
            let point = from2dTo3d(e.clientX, e.clientY, camera)
            let data = e.dataTransfer ? JSON.parse(e.dataTransfer?.getData("application/json")) as EditorObjectInit : null

            if (!point) {
                return
            }

            setActiveObject(null)
            addObject({
                position: [
                    roundToNearest(point.x, precision),
                    roundToNearest(data?.offset?.[1] ? (data.offset[1] / 2) : 0, precision),
                    roundToNearest(point.z, precision),
                ],
                ...data
            })
        }

        gl.domElement.addEventListener("dragover", onDragOver)
        gl.domElement.addEventListener("drop", onDrop)

        return () => {
            gl.domElement.removeEventListener("dragover", onDragOver)
            gl.domElement.removeEventListener("drop", onDrop)
        }
    }, [camera, gl])

    return null
}