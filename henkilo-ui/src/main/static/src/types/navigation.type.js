// @flow

export type NaviOptions = {
    backButton?: ?boolean,
    isUnauthenticatedPage?: boolean,
    bgColor?: ?string,
}

export type NaviTab = {
    path: string,
    label: string,
    disabled?: boolean,
    sallitutRoolit?: Array<string>,
}
