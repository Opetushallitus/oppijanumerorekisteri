// @flow
const SALLITUT_VALIMERKIT = [' ', '-']

export function isValidKutsumanimi(etunimet: ?string, kutsumanimi: ?string): boolean {
    if (!etunimet || !kutsumanimi) {
        return true
    }
    return isValidKutsumanimiCaseSensitive(etunimet.toLowerCase(), kutsumanimi.toLowerCase())
}

const isValidKutsumanimiCaseSensitive = (etunimet: string, kutsumanimi: string) => {
    let beginIndex = 0
    while (beginIndex !== -1) {
        beginIndex = etunimet.indexOf(kutsumanimi, beginIndex)
        if (beginIndex !== -1) {
            const endIndex = beginIndex + kutsumanimi.length
            if (isValidBeginIndex(beginIndex, etunimet) && isValidEndIndex(endIndex, etunimet)) {
                return true
            }
            beginIndex += 1
        }
    }
    return false
}

const isValidBeginIndex = (index: number, etunimet: string): boolean => {
    return index === 0 || SALLITUT_VALIMERKIT.includes(etunimet.charAt(index - 1))
}

const isValidEndIndex = (index: number, etunimet: string): boolean => {
    return index === etunimet.length || SALLITUT_VALIMERKIT.includes(etunimet.charAt(index))
}
