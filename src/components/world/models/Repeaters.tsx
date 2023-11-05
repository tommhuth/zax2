import RepeaterMesh from "../../RepeaterMesh"
import Building1 from "./repeaters/Building1"
import Building2 from "./repeaters/Building2"
import Building3 from "./repeaters/Building3"
import Floor1 from "./repeaters/Floor1"
import Floor2 from "./repeaters/Floor2"
import Floor3 from "./repeaters/Floor3"
import Floor4 from "./repeaters/Floor4"
import Hangar from "./repeaters/Hangar"

export default function Repeaters() {
    return (
        <>
            <RepeaterMesh
                name="building1"
                count={5}
            >
                <Building1 />
            </RepeaterMesh>

            <RepeaterMesh
                name="building2"
                count={5}
            >
                <Building2 />
            </RepeaterMesh>
            <RepeaterMesh
                name="building3"
                count={5}
            >
                <Building3 />
            </RepeaterMesh>
            <RepeaterMesh
                name="hangar"
                count={5}
            >
                <Hangar />
            </RepeaterMesh>
            <RepeaterMesh
                name="floor1"
                count={5}
            >
                <Floor1 />
            </RepeaterMesh>
            <RepeaterMesh
                name="floor2"
                count={5}
            >
                <Floor2 />
            </RepeaterMesh>
            <RepeaterMesh
                name="floor3"
                count={5}
            >
                <Floor3 />
            </RepeaterMesh>
            <RepeaterMesh
                name="floor4"
                count={5}
            >
                <Floor4 />
            </RepeaterMesh>
        </>
    )
}