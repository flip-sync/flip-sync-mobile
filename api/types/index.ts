export interface IApiResponse<T> {
    code: string;
    message: string;
    data: T;
}
