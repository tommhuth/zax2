import random from "@huth/random"

export default function makeCycler<T>(options: T[], randomPickChance = .1) {
    let i = 0
    let lastWasRandom = false

    return {
        next() {  
            if (!lastWasRandom) {
                let doRandom = random.boolean(randomPickChance)

                lastWasRandom = doRandom

                return doRandom ? random.pick(...options) : options[i++ % options.length]
            } else {
                lastWasRandom = false

                return options[i++ % options.length]
            }
        },
        reset() {
            i = 0
        }
    }
}