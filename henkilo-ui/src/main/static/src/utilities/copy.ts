export function copy<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
}
