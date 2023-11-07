import { setLoaded } from "../../../data/store/utils"
import Instances from "./Instances"
import Repeaters from "./Repeaters"
import { useEffect } from "react"

export default function Models() {
    useEffect(() => {
        setTimeout(() => {
            console.log("MODELS READY")
            setLoaded()
        }, 250)
    }, [])

    return (
        <>
            <Instances />
            <Repeaters />
        </>
    )
}