export function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4)
}

export function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function easeInOutQuart(x: number): number {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
}

export function easeInQuint(x: number): number {
    return x * x * x
}

export function easeOutSine(x: number): number {
    return Math.sin((x * Math.PI) / 2)
}

export function easeOutQuad(x: number): number {
    return 1 - (1 - x) * (1 - x)
}

export function easeInQuad(x: number): number {
    return x * x
}

export function easeOutExpo(x: number): number {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

export function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3)
}

export function easeOutElastic(x: number): number {
    const c4 = (2 * Math.PI) / 3

    return x === 0
        ? 0
        : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
}

export function easeInBack(x: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1

    return c3 * x * x * x - c1 * x * x
}

export function easeOutBack(x: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1

    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

export function blend(values = [75, 100, 0], t = 0, threshold = .5) {
    let left = t >= threshold ? 1 : 0
    let right = left + 1

    if (t <= threshold) {
        return (1 - t / (1 - threshold)) * values[left] + t / (1 - threshold) * values[right]
    }

    return (1 - (t - threshold) / (1 - threshold)) * values[left] + (t - threshold) / (1 - threshold) * values[right]
}  