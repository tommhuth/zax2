import { Vector3 } from "three" 
import { clamp } from "./utils"
import { Tuple3 } from "../types"

export const WORLD_START_Z = 100
export const WORLD_PLAYER_START_Z = WORLD_START_Z - 15

export const WORLD_CENTER_X = 0
export const WORLD_LEFT_EDGE = 5
export const WORLD_RIGHT_EDGE = -4
export const WORLD_TOP_EDGE = 5
export const WORLD_BOTTOM_EDGE = 1

export const EDGE_MIN = new Vector3(WORLD_RIGHT_EDGE, WORLD_BOTTOM_EDGE, -Infinity)
export const EDGE_MAX = new Vector3(WORLD_LEFT_EDGE, WORLD_TOP_EDGE, Infinity)

export const CAMERA_Y = 100
export const CAMERA_OFFSET = new Vector3(4, 0, 6)
export const CAMERA_POSITION = new Vector3().setFromSphericalCoords(
    CAMERA_Y,
    -Math.PI / 3, // 60 degrees from positive Y-axis and 30 degrees to XZ-plane
    Math.PI / 4  // 45 degrees, between positive X and Z axes, thus on XZ-plane
)  

export const ZOOM = 70 - clamp(1 - (Math.min(window.innerWidth, window.innerHeight) - 400) / 600, 0, 1) * 30
 
export const PIXEL_SIZE = Math.min(window.innerWidth, window.innerHeight) < 800 ? 4 : 4
export const DPR = 1 / PIXEL_SIZE
export const BULLET_SIZE: Tuple3 = [.15, .2, 1.5]