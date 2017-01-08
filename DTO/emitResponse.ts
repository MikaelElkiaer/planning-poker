export interface IEmitResponse<T> {
    (statusCode: number, data: T, error?: string): void
}