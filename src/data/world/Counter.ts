export default class Counter {
    public current = 0
    private max = 0

    constructor(max: number) {
        this.max = max
    }

    reset() {
        this.current = 0
    }

    next() {
        this.current = (this.current + 1) % this.max

        return this.current
    }
}