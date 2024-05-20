import random from "@huth/random"
 
export default class Cycler<T> {
    private i: number
    private lastWasRandom = false
    private randomPickChance: number
    private startAt: number
    private options: T[]

    constructor(options: T[], randomPickChance = .1, startAt = 0) {
        this.options = options
        this.randomPickChance = randomPickChance
        this.startAt = startAt
        this.i = startAt
    }
    next() {
        if (!this.lastWasRandom) {
            let doRandom = random.boolean(this.randomPickChance)

            this.lastWasRandom = doRandom

            return doRandom ? random.pick(...this.options) : this.options[this.i++ % this.options.length]
        }  
    
        this.lastWasRandom = false

        return this.options[this.i++ % this.options.length] 
    }
    reset() {
        this.i = this.startAt
    }
} 