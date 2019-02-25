// @flow
import type {Text} from "./text.types";

export type TextGroup = {
    id: number,
    texts: Array<Text>,
    fi?: string,
    sv?: string,
    en?: string,
}

export type TextGroupModify = {
    texts: Array<Text>,
}

export type TextGroupMap = {
    id: number,
    texts: {[string]: string}
}

export type TextGroupArray = {
    id: number,
    texts: Array<Text>,
}