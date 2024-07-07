import ApiResponse from "./ApiResponse";
import ApiClient from "./ApiClient";

export default class Page<T extends ApiResponse> extends ApiResponse {
    public constructor(
        api: ApiClient,
        public readonly resources: T[],
        public readonly page: number,
        public readonly limit: number,
        public readonly total: number
    ) {
        super(api);
    }
}
