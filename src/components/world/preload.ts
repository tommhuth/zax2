import barrel1 from "@assets/models/barrel1.glb"
import barrel2 from "@assets/models/barrel2.glb"
import barrel3 from "@assets/models/barrel3.glb"
import barrel4 from "@assets/models/barrel4.glb"
import cargoship1 from "@assets/models/cargoship1.glb"
import cargoship1_destroyed from "@assets/models/cargoship1_destroyed.glb"
import cargoship2 from "@assets/models/cargoship2.glb"
import cargoship2_destroyed from "@assets/models/cargoship2_destroyed.glb"
import cargoship3 from "@assets/models/cargoship3.glb"
import floor5 from "@assets/models/floor5.glb"
import hangar from "@assets/models/hangar.glb"
import plane from "@assets/models/plane.glb"
import platform from "@assets/models/platform.glb"
import rocket from "@assets/models/rocket.glb"
import rockface from "@assets/models/rockface.glb"
import tower1 from "@assets/models/tower1.glb"
import tower2 from "@assets/models/tower2.glb"
import turret2 from "@assets/models/turret2.glb"
import wall1 from "@assets/models/wall1.glb"
import wall2 from "@assets/models/wall2.glb"
import wall3 from "@assets/models/wall3.glb"
import logo from "@assets/models/logo.glb"
import tanks from "@assets/models/tanks.glb"
import boss from "@assets/models/boss.glb"
import bossdestroyed from "@assets/models/bossdestroyed.glb"
import cable from "@assets/models/cable.glb"
import device from "@assets/models/device.glb"
import dirt from "@assets/models/dirt.glb"
import floor1 from "@assets/models/floor1.glb"
import floor2 from "@assets/models/floor2.glb"
import floor3 from "@assets/models/floor3.glb"
import floor4 from "@assets/models/floor4.glb"
import grass from "@assets/models/grass.glb"
import leaf from "@assets/models/leaf.glb"
import plant from "@assets/models/plant.glb"
import player from "@assets/models/player.glb"
import scrap from "@assets/models/scrap.glb"
import { useGLTF } from "@react-three/drei"

const models = [
    barrel1, barrel2, barrel3, barrel4, cargoship1, cargoship1_destroyed,
    cargoship2, cargoship2_destroyed, cargoship3, floor5, hangar, plane,
    platform, rocket, rockface, tower1, tower2, turret2, wall1, wall2, wall3,
    logo, tanks, boss, bossdestroyed, cable, device, dirt,
    floor1, floor2, floor3, floor4, grass, leaf, plant, player, scrap
]

for (let model of models) {
    useGLTF.preload(model)
}