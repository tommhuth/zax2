import RepeaterMesh from "./RepeaterMesh"
import Hangar from "./repeaters/Hangar"
import Tanks from "./repeaters/Tanks"
import Wall1 from "./repeaters/Wall1"
import Floor1 from "./repeaters/Floor1"
import Floor2 from "./repeaters/Floor2"
import Floor3 from "./repeaters/Floor3"
import Floor4 from "./repeaters/Floor4"
import Tower2 from "./repeaters/Tower2"
import Wall2 from "./repeaters/Wall2"
import Tower1 from "./repeaters/Tower1"
import Wall3 from "./repeaters/Wall3"
import Floor6 from "./repeaters/Floor6"

export default function Repeaters() {
    return (
        <>
            <RepeaterMesh
                name="tower1"
                count={5}
            >
                <Tower1 />
            </RepeaterMesh>
            <RepeaterMesh
                name="floor6"
                count={5}
            >
                <Floor6 />
            </RepeaterMesh>
            <RepeaterMesh
                name="wall3"
                count={5}
            >
                <Wall3 />
            </RepeaterMesh>
            <RepeaterMesh
                name="tower2"
                count={5}
            >
                <Tower2 />
            </RepeaterMesh>

            <RepeaterMesh
                name="wall1"
                count={5}
            >
                <Wall1 />
            </RepeaterMesh>

            <RepeaterMesh
                name="wall2"
                count={5}
            >
                <Wall2 />
            </RepeaterMesh>

            <RepeaterMesh
                name="tanks"
                count={5}
            >
                <Tanks />
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