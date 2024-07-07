import Track from "./Track";
import Album from "./Album.ts";
import Page from "./Page.ts";
import Artist from "./Artist.ts";

export default class ApiClient {
    public constructor(
        public readonly baseUrl: string
    ) {
    }

    /**
     * Fetch JSON from provided API endpoint
     * @param path Endpoint path
     * @param query Query parameters
     * @param method HTTP method
     * @param headers Request headers
     * @param body Request body
     */
    public async fetch(path: string, query: Record<string, string | undefined | null> = {}, method: string = "GET", headers: Record<string, string> = {}, body: Record<string, string> = {}) {
        if ("limit" in query && query.limit === "Infinity") {
            query.limit = "0";
            const data = await this.fetch(path, query, method, headers, body);
            const total = data.json.total;
            query.limit = total;
        }
        const url = new URL(path, this.baseUrl);
        url.search = new URLSearchParams(Object.fromEntries(Object.entries(query).filter(([, v]) => v !== null && v !== undefined)) as Record<string, string>).toString();
        const options: RequestInit = {
            method,
            headers
        };
        if (!["GET", "HEAD"].includes(method)) {
            options.body = JSON.stringify(body);
        }
        const res = await fetch(url, options);
        const json = await res.json();
        return {res, json};
    }

    /**
     * Get track by ID
     * @param id Track ID
     */
    public async getTrack(id: number) {
        return Track.from(this, await this.fetch(`/tracks/${id}`));
    }

    /**
     * Get album by ID
     * @param id Album ID
     */
    public async getAlbum(id: string) {
        return Album.from(this, await this.fetch(`/albums/${id}`));
    }

    /**
     * Get tracks in album
     * @param album Album ID
     * @param [limit] Number of items per page
     * @param [page] Page number (starting from 1)
     */
    public async getAlbumTracks(album: string, limit: number = 20, page: number = 1): Promise<Page<Track>> {
        const data = await this.fetch(`/albums/${album}/tracks`, {
            limit: limit.toString(),
            page: page.toString()
        });
        return new Page<Track>(this, data.json.resources.map((json: any) => Track.from(this, {json})), data.json.page, data.json.limit, data.json.total);
    }

    /**
     * Get albums
     * @param [page] Page number (starting from 1)
     * @param [limit] Number of items per page (default: 20)
     * @param [sort] Sort condition and direction
     */
    public async getAlbums(page: number = 1, limit: number = 20, sort?: {by: "title" | "tracks" | "duration", direction: "asc" | "desc"}) {
        const data = await this.fetch("/albums", {
            sort: sort ? `${sort.by}:${sort.direction}` : undefined,
            page: page.toString(),
            limit: limit.toString()
        });

        return new Page<Album>(this, data.json.resources.map((json: any) => Album.from(this, {json})), data.json.page, data.json.limit, data.json.total);
    }

    /**
     * Get artists
     * @param [page] Page number (starting from 1)
     * @param [limit] Number of items per page (default: 20)
     * @param [sort] Sort condition and direction
     */
    public async getArtists(page: number = 1, limit: number = 20, sort?: {by: "name" | "tracks" | "duration", direction: "asc" | "desc"}) {
        const data = await this.fetch("/artists", {
            sort: sort ? `${sort.by}:${sort.direction}` : undefined,
            page: page.toString(),
            limit: limit.toString()
        });
        return new Page<Artist>(this, data.json.resources.map((json: any) => Artist.from(this, {json})), data.json.page, data.json.limit, data.json.total);
    }

    /**
     * Get artist
     * @param id Artist ID
     */
    public async getArtist(id: string) {
        return Artist.from(this, await this.fetch(`/artists/${id}`));
    }

    /**
     * Get tracks by artist
     * @param artist Artist ID
     * @param [limit] Number of items per page
     * @param [page] Page number (starting from 1)
     */
    public async getArtistTracks(artist: string, limit: number = 20, page: number = 1): Promise<Page<Track>> {
        const data = await this.fetch(`/artists/${artist}/tracks`, {
            limit: limit.toString(),
            page: page.toString()
        });
        return new Page<Track>(this, data.json.resources.map((json: any) => Track.from(this, {json})), data.json.page, data.json.limit, data.json.total);
    }

    /** Get albums by artist
     * @param artist Artist ID
     * @param [limit] Number of items per page
     * @param [page] Page number (starting from 1)
     */
    public async getArtistAlbums(artist: string, limit: number = 20, page: number = 1): Promise<Page<Album>> {
        const data = await this.fetch(`/artists/${artist}/albums`, {
            limit: limit.toString(),
            page: page.toString()
        });
        return new Page<Album>(this, data.json.resources.map((json: any) => Album.from(this, {json})), data.json.page, data.json.limit, data.json.total);
    }
}
