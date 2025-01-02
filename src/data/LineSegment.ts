import { Box3, Vector3 } from "three"

let _direction = new Vector3()
let _halfLengthDirection = new Vector3()
let _start = new Vector3()
let _end = new Vector3()

export default class LineSegment {
    constructor(
        public readonly position: Vector3, // Center of the line segment
        public readonly direction: Vector3,
        public readonly length: number
    ) { }

    // Get the start point of the line segment
    getStartPoint(target: Vector3): Vector3 {
        return target.subVectors(
            this.position,
            _halfLengthDirection.copy(this.direction).multiplyScalar(this.length / 2)
        )
    }

    // Get the endpoint of the line segment
    getEndPoint(target: Vector3): Vector3 {
        return target.addVectors(
            this.position,
            _halfLengthDirection.copy(this.direction).multiplyScalar(this.length / 2)
        )
    }

    // Check if the line segment intersects a Box3, using the Slab Method
    intersectsBox(box: Box3): boolean {
        let start = this.getStartPoint(_start)
        let end = this.getEndPoint(_end)
        let direction = _direction.subVectors(end, start)
        let tMin = 0
        let tMax = 1

        for (const axis of ["x", "y", "z"] as const) {
            let boxMin = box.min[axis]
            let boxMax = box.max[axis]

            if (direction[axis] === 0) {
                if (start[axis] < boxMin || start[axis] > boxMax) {
                    // Line is parallel and outside the box
                    return false
                }
            } else {
                let t1 = (boxMin - start[axis]) / direction[axis]
                let t2 = (boxMax - start[axis]) / direction[axis]
                let tNear = Math.min(t1, t2)
                let tFar = Math.max(t1, t2)

                tMin = Math.max(tMin, tNear)
                tMax = Math.min(tMax, tFar)

                if (tMin > tMax) {
                    return false
                }
            }
        }

        return true
    }
}