// Page-type for spring data Paging
export type Page<T> = {
    first: boolean
    last: boolean
    number: number
    numberOfElements: number
    results: Array<T>
    size: number
    totalElements: 0
    totalPages: number
}