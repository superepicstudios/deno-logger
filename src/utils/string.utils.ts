
export function maxLength(strs: string[]): number {

    const lengths = strs
        .map(s => s.length)

    return Math
        .max(...lengths)

}

export function minLengthOrApplyTrailingPad(str: string, length: number): string {

    if (str.length >= length) {
        return str
    }

    const diff = (length - str.length)

    let result = str

    for (let i = 0; i < diff; i++) {
        result += " "
    }

    return result

}
