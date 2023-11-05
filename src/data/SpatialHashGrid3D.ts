import { Tuple3 } from "../types"

export interface Client<T = any> {
    position: Tuple3
    size: Tuple3
    data: T
    min: Tuple3
    max: Tuple3
}

export class SpatialHashGrid3D<T = any> {
    private grid = new Map<string, Client<T>[]>()
    private cellSize: Tuple3

    constructor(cellSize: Tuple3) {
        this.cellSize = cellSize
    }

    private getCellIndex(x: number, y: number, z: number): Tuple3 {
        return [
            Math.floor(x / this.cellSize[0]),
            Math.floor(y / this.cellSize[1]),
            Math.floor(z / this.cellSize[2])
        ]
    }

    private getCellBounds(position: Tuple3, size: Tuple3): [min: Tuple3, max: Tuple3] {
        return [
            this.getCellIndex(position[0] - size[0] / 2, position[1] - size[1] / 2, position[2] - size[2] / 2),
            this.getCellIndex(position[0] + size[0] / 2, position[1] + size[1] / 2, position[2] + size[2] / 2),
        ]
    }

    private getHashKey(ix: number, iy: number, iz: number): string {
        return `${ix},${iy},${iz}`
    }

    private insert(client: Client<T>) {
        const [min, max] = this.getCellBounds(client.position, client.size)

        client.min = min
        client.max = max

        for (let x = min[0]; x <= max[0]; x++) {
            for (let y = min[1]; y <= max[1]; y++) {
                for (let z = min[2]; z <= max[2]; z++) {
                    let key = this.getHashKey(x, y, z)
                    let cell = this.grid.get(key)

                    if (cell) {
                        cell.push(client)
                    } else {
                        this.grid.set(key, [client])
                    }
                }
            }
        }
    }

    public findNear(position: Tuple3, size: Tuple3) {
        let [min, max] = this.getCellBounds(position, size)
        let result: Client<T>[] = []

        for (let x = min[0]; x <= max[0]; x++) {
            for (let y = min[1]; y <= max[1]; y++) {
                for (let z = min[2]; z <= max[2]; z++) {
                    let key = this.getHashKey(x, y, z)
                    let cell = this.grid.get(key)

                    if (cell) {
                        result.push(...cell)
                    }
                }
            }
        }

        return result
    }

    public newClient(position: Tuple3, size: Tuple3, data: T) {
        let client = {
            position,
            size,
            data,
            min: [0, 0, 0] as Tuple3,
            max: [0, 0, 0] as Tuple3,
        }

        this.insert(client)

        return client
    }

    public remove(client: Client<T>) {
        for (let x = client.min[0]; x <= client.max[0]; x++) {
            for (let y = client.min[1]; y <= client.max[1]; y++) {
                for (let z = client.min[2]; z <= client.max[2]; z++) {
                    let key = this.getHashKey(x, y, z)
                    let cell = this.grid.get(key)

                    if (cell) {
                        let cellUpdated = cell.filter(i => i !== client)

                        cellUpdated.length === 0 ? this.grid.delete(key) : this.grid.set(key, cellUpdated)
                    }
                }
            }
        }
    }

    public updateClient(client: Client<T>) {
        const [min, max] = this.getCellBounds(client.position, client.size)

        if (
            client.max[0] !== max[0]
            || client.max[1] !== max[1]
            || client.max[2] !== max[2]
            || client.min[0] !== min[0]
            || client.min[1] !== min[1]
            || client.min[2] !== min[2]
        ) {
            this.remove(client)
            this.insert(client)
        }
    }
}