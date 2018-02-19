// @flow
import type {Text} from "./text.types";

export type TextGroup = {
    texts: Array<Text>,
    fi?: string,
    sv?: string,
    en?: string,
}

export type TextGroupMap = {
    id: number,
    texts: {[string]: string}
}