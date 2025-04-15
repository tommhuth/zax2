import { MeshBasicMaterial, SphereGeometry } from "three"
import InstancedMesh from "../InstancedMesh"

const materal = new MeshBasicMaterial({ color: "yellow", name: "sphere" })
const geometry = new SphereGeometry(1, 16, 16)

export default function Sphere() {
    return (
        <InstancedMesh
            name="sphere"
            count={10}
            castShadow
            receiveShadow
            material={materal}
            geometry={geometry}
        />
    )
}