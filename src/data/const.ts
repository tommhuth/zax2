import { BoxGeometry, Vector3 } from "three"
import { EditorStore } from "src/editor/data/types"

export const WORLD_START_Z = 100
export const WORLD_PLAYER_START_Z = WORLD_START_Z - 20

export const WORLD_CENTER_X = 0
export const WORLD_LEFT_EDGE = 5
export const WORLD_RIGHT_EDGE = -4
export const WORLD_TOP_EDGE = 5
export const WORLD_BOTTOM_EDGE = 1

export const OFFSCREEN = new Vector3(0, 0, -100)
export const EDGE_MIN = new Vector3(WORLD_RIGHT_EDGE, WORLD_BOTTOM_EDGE, -Infinity)
export const EDGE_MAX = new Vector3(WORLD_LEFT_EDGE, WORLD_TOP_EDGE, Infinity)

export const CAMERA_Y = 50
export const CAMERA_OFFSET = new Vector3(4, 0, 8)

// https://discourse.threejs.org/t/dimetric-orthographic-camera-angle-for-retro-pixel-look/24455/2
export const CAMERA_DIRECTION = new Vector3().setFromSphericalCoords(
    CAMERA_Y,
    -Math.PI / 3, // 60 degrees from positive Y-axis and 30 degrees to XZ-plane
    Math.PI / 4  // 45 degrees, between positive X and Z axes, thus on XZ-plane
)

export const BULLET_SIZE = 1.25
export const BULLET_LIGHT_COUNT = 14
export const LIGHT_SOURCES_COUNT = 4

export const FLOOR_SIZE: Record<EditorStore["floorType"], number> = {
    floor1: 20,
    floor2: 20,
    floor3: 20,
    floor4: 48,
    floor5: 50.6,
    floor6: 56.8,
}

export const box = new BoxGeometry(1, 1, 1, 1, 1, 1)