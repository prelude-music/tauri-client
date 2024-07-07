import ApiResponse from "./ApiResponse";
import ApiClient from "./ApiClient";
import Album from "./Album.ts";

class Track extends ApiResponse {
    public constructor(
        api: ApiClient,
        public readonly id: number,
        public readonly title: string,
        public readonly artists: string[],
        public readonly artist: string | null,
        public readonly album: { id: string, title: string, artist: string } | null,
        public readonly year: number | null,
        public readonly genres: string[],
        public readonly track: { no: number, of: number | null } | null,
        public readonly disk: { no: number, of: number | null } | null,
        public readonly meta: Track.Meta
    ) {
        super(api);
    }

    /**
     * Get track cover art URL
     */
    public cover(): URL {
        return new URL(this.api.baseUrl + "/tracks/" + this.id + "/image");
    }

    /**
     * Get track audio URL
     */
    public audio(): URL {
        return new URL(this.api.baseUrl + "/tracks/" + this.id + "/audio");
    }

    /**
     * Format track duration
     */
    public formattedDuration() {
        return Track.formatDuration(this.meta.duration);
    }
    
    public static formatDuration(duration: number) {
        return Math.floor(duration / 3600) > 0
            ? `${Math.floor(duration / 3600)}:${String(Math.floor((duration % 3600) / 60)).padStart(2, '0')}:${String(Math.floor(duration % 60)).padStart(2, '0')}`
            : `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`;
    }

    /**
     * Get full album
     */
    public async fullAlbum(): Promise<Album | null> {
        if (this.album === null) return null;
        return this.api.getAlbum(this.album.id);
    }

    public static from(api: ApiClient, data: { res?: Response, json: any }) {
        if (data.res?.ok === false)
            return null;
        return new Track(
            api,
            data.json.id,
            data.json.title,
            data.json.artists,
            data.json.artist,
            data.json.album,
            data.json.year,
            data.json.genres,
            data.json.track,
            data.json.disk,
            data.json.meta
        );
    }
}

namespace Track {
    export interface Meta {
        /**
         * Audio duration in seconds
         */
        readonly duration: number;

        /**
         * The number of audio channels
         */
        readonly channels: number;

        /**
         * Sample rate in Hz
         */
        readonly sampleRate: number;

        /**
         * Bitrate in bits per second
         */
        readonly bitrate: number;

        /**
         * Whether the audio format is lossless.
         */
        readonly lossless: boolean;
    }
}

export default Track;
