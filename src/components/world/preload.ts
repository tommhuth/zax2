import barrels from "@assets/models/barrels.glb"
import hangar from "@assets/models/hangar.glb"
import plane from "@assets/models/plane.glb"
import rocket from "@assets/models/rocket.glb"
import rockface from "@assets/models/rockface.glb"
import tower1 from "@assets/models/tower1.glb"
import tower2 from "@assets/models/tower2.glb"
import turret2 from "@assets/models/turret2.glb"
import wall1 from "@assets/models/wall1.glb"
import wall2 from "@assets/models/wall2.glb"
import wall3 from "@assets/models/wall3.glb"
import tanks from "@assets/models/tanks.glb"
import boss from "@assets/models/boss.glb"
import bossDestroyed from "@assets/models/boss-destroyed.glb"
import cable from "@assets/models/cable.glb"
import device from "@assets/models/device.glb"
import dirt from "@assets/models/dirt.glb"
import floor1 from "@assets/models/floor1.glb"
import floor2 from "@assets/models/floor2.glb"
import floor3 from "@assets/models/floor3.glb"
import floor4 from "@assets/models/floor4.glb"
import floor5 from "@assets/models/floor5.glb"
import grass from "@assets/models/grass.glb"
import leaf from "@assets/models/leaf.glb"
import plant from "@assets/models/plant.glb"
import player from "@assets/models/player.glb"
import scrap from "@assets/models/scrap.glb"

import { useGLTF } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

for (let model of [
    barrels, floor5, hangar, plane,
    rocket, rockface, tower1, tower2, turret2, wall1, wall2, wall3,
    tanks, boss, bossDestroyed, device,
    floor1, floor2, floor3, floor4, floor5, grass, plant, player,
]) {
    useGLTF.preload(model)
}

for (let model of [scrap, cable, dirt, leaf]) {
    useLoader.preload(GLTFLoader, model)
}