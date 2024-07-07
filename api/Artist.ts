import ApiClient from "./ApiClient";
import ApiResponse from "./ApiResponse";

export default class Artist extends ApiResponse {
    public constructor(
        api: ApiClient,
        public readonly id: string,
        public readonly name: string,
        public readonly tracks: number,
        public readonly albums: number,
        public readonly image: string | null
    ) {
        super(api);
    }

    public async getTracks(limit?: number, page?: number) {
        return this.api.getArtistTracks(this.id, limit, page);
    }

    public async getAlbums(limit?: number, page?: number) {
        return this.api.getArtistAlbums(this.id, limit, page);
    }

    public static from(api: ApiClient, data: {res?: Response, json: any}) {
        if (data.res?.ok === false)
            return null;
        return new Artist(
            api,
            data.json.id,
            data.json.name,
            data.json.tracks,
            data.json.albums,
            data.json.image
        );
    }

    public static async id(name: string) {
        return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(name.length + name))))).replace(/=+$/, "").replace(/\/+/g, "-");
    }
}
