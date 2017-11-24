// @flow
export type NaviType = {
    path: string,
    label: string,
}

export type NaviTab = {
    path: string,
    label: string,
    disabled?: boolean,
}

export type UpdateNaviType = (Array<NaviType>, ?string, ?string) => void;

