import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { setActiveObject, addObject } from "./data/actions";
import { from2dTo3d, roundToNearest, precision } from "./data/utils"; 
import { setTime } from "@data/store/effects";
import { ndelta } from "@data/utils";
import { store } from "@data/store";
import { EditorObjectInit } from "./data/store";

export default function Dropzone() {
    let { camera, gl } = useThree()

    useFrame((state, delta) => {
        setTime(store.getState().effects.time + ndelta(delta))
    })

    useEffect(() => {
        let onDragOver = (e: DragEvent) => {
            e.preventDefault();
        }
        let onDrop = (e: DragEvent) => {
            e.preventDefault();
            let point = from2dTo3d(e.clientX, e.clientY, camera)
            let data = JSON.parse(e.dataTransfer!.getData("application/json")) as EditorObjectInit

            if (!point) {
                return
            }

            setActiveObject(null)
            addObject({
                position: [
                    roundToNearest(point.x, precision),
                    0,
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