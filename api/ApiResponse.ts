import ApiClient from "./ApiClient";

export default abstract class ApiResponse {
    protected constructor(protected readonly api: ApiClient) {}
}
