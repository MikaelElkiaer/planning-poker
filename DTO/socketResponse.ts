export interface ISocketResponse<T> {
    (statusCode: number, data: T, error?: string): void
}