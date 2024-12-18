import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { scrapColor } from "@data/theme"
import { FrontSide, Mesh } from "three"
import scrapModel from "@assets/models/scrap.glb"
import InstancedMesh from "../InstancedMesh"
import { MeshRetroMaterial } from "@components/world/materials/MeshRetroMaterial"
import { glsl } from "@data/utils"

export default function Scrap() {
    let scrap = useLoader(GLTFLoader, scrapModel)

    return (
        <InstancedMesh
            name="scrap"
            count={50}
            castShadow
            receiveShadow
            colors={true}
        >
            <primitive
                object={(scrap.nodes.scrap as Mesh).geometry}
                dispose={null}
                attach="geometry"
            />
            <MeshRetroMaterial
                side={FrontSide}
                name="scrap"
                color={scrapColor}
                shader={{
                    fragment: {
                        main: glsl`
                            gl_FragColor.rgb = mix(gl_FragColor.rgb, vColor, .6); 
                        `
                    }
                }}
            />
        </InstancedMesh>
    )
}