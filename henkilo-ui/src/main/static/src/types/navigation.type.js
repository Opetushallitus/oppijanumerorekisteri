// @flow
export type NaviType = {
    path: string,
    label: string,
}

export type NaviTab = {
    path: string,
    label: string,
}

export type UpdateNaviType = (Array<NaviType>, ?string, ?string) => void;

