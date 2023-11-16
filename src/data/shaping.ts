export function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4)
}

export function easeInQuint(x: number): number {
    return x * x * x
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

export function blend(values = [75, 100, 0], t = 0, threshold = .5) {
    let left = t >= threshold ? 1 : 0
    let right = left + 1

    if (t <= threshold) {
        return (1 - t / (1 - threshold)) * values[left] + t / (1 - threshold) * values[right]
    }

    return (1 - (t - threshold) / (1 - threshold)) * values[left] + (t - threshold) / (1 - threshold) * values[right]
} 