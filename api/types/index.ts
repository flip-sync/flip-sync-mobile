export interface IApiResponse<T> {
    code: string;
    message: string;
    data: T;
}
export interface ISorted {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}

export interface IPagination<T> {
    content: T;
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: { offset: number; pageNumber: number; pageSize: number; paged: boolean; sort: ISorted; unpaged: boolean };
    size: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    totalElements: number;
    totalPages: number;
}
