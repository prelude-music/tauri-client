import ApiClient from "./ApiClient";
import ApiResponse from "./ApiResponse";

export default class Album extends ApiResponse {
    public constructor(
        api: ApiClient,
        public readonly id: string,
        public readonly title: string,
        public readonly artist: string | null,
        public readonly tracks: number,
        public readonly duration: number
    ) {
        super(api);
    }

    /**
     * Get album cover art URL
     */
    public cover(): URL {
        return new URL(this.api.baseUrl + "/albums/" + this.id + "/image");
    }

    /**
     * Formatted album duration
     */
    public formattedDuration(): string {
        return this.duration < 60 ? `${this.duration} second${this.duration === 1 ? '' : 's'}` : this.duration < 3600 ? `${Math.floor(this.duration/60)} minute${Math.floor(this.duration/60) === 1 ? '' : 's'}` : this.duration < 86400 ? `${Math.floor(this.duration/3600)} hour${Math.floor(this.duration/3600) === 1 ? '' : 's'}${this.duration % 3600 >= 60 ? ', ' + Math.floor((this.duration % 3600) / 60) + ' minute' + (Math.floor((this.duration % 3600) / 60) === 1 ? '' : 's') : ''}` : `${Math.floor(this.duration/86400)} day${Math.floor(this.duration/86400) === 1 ? '' : 's'}${this.duration % 86400 >= 3600 ? ', ' + Math.floor((this.duration % 86400) / 3600) + ' hour' + (Math.floor((this.duration % 86400) / 3600) === 1 ? '' : 's') : ''}`;
    }

    public async getTracks() {
        return this.api.getAlbumTracks(this.id);
    }

    public static from(api: ApiClient, data: {res?: Response, json: any}) {
        if (data.res?.ok === false)
            return null;
        return new Album(
            api,
            data.json.id,
            data.json.title,
            data.json.artist,
            data.json.tracks,
            data.json.duration
        );
    }
}
