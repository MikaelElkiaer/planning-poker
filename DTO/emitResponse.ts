export interface IEmitResponse<T> {
    (data: T, error?: string): void
}