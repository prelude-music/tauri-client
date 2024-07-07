import Track from "../api/Track.ts";
import EnhancedSwitch from "enhanced-switch";
import { invoke } from "@tauri-apps/api/tauri";

class Player {
    public readonly container = document.createElement("div");

    private readonly imageContainer = document.createElement("div");
    private readonly titleContainer = document.createElement("div");
    private readonly title = document.createElement("p");
    private readonly details = document.createElement("p");

    private readonly mainControlsContainer = document.createElement("div");
    private readonly previousButton = document.createElement("button");
    private readonly playButton = document.createElement("button");
    private readonly nextButton = document.createElement("button");

    private readonly trackContainer = document.createElement("div");
    private readonly currentTime = document.createElement("p");
    private readonly trackOuterContainer = document.createElement("div");
    private readonly trackInnerContainer = document.createElement("div");
    private readonly trackTrack = document.createElement("div");
    private readonly trackThumb = document.createElement("div");
    private readonly durationTime = document.createElement("p");

    private readonly secondaryControlsContainer = document.createElement("div");
    private readonly repeatButton = document.createElement("button");
    private readonly volumeButton = document.createElement("button");
    private readonly optionsButton = document.createElement("button");

    #shown: boolean = false;

    #currentAudio: HTMLAudioElement = new Audio();
    #nextAudio: HTMLAudioElement = new Audio();

    static #instance: Player | null = null;

    public static getInstance() {
        return this.#instance ??= new this();
    }

    private constructor() {
        this.container.classList.add("fixed", "bottom-0", "inset-x-0", "bg-zinc-950", "flex", "items-center", "px-6", "border-t", "border-zinc-900", "py-2", "translate-y-20", "transition-transform");

        this.container.append(this.imageContainer);
        this.imageContainer.classList.add("w-12", "h-12", "select-none");

        this.container.append(this.titleContainer);
        this.titleContainer.classList.add("space-y-1", "ml-4");

        this.titleContainer.append(this.title);
        this.title.classList.add("font-medium", "text-zinc-50", "text-sm", "leading-none", "select-text");

        this.titleContainer.append(this.details);
        this.details.classList.add("text-xs", "text-zinc-400", "select-none");

        this.container.append(this.mainControlsContainer);
        this.mainControlsContainer.classList.add("ml-6", "flex", "items-center", "gap-x-1");

        this.mainControlsContainer.append(this.previousButton);
        this.previousButton.classList.add("text-zinc-50", "rounded-full", "text-sm", "font-medium", "transition-colors", "hover:bg-zinc-800", "p-2.5", "disabled:text-zinc-600", "disabled:hover:bg-transparent", "disabled:cursor-not-allowed");
        this.previousButton.disabled = true;
        this.previousButton.innerHTML = `<span class="sr-only select-none">Previous</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/></svg>`;
        this.previousButton.addEventListener("click", () => this.previousTrack());

        this.mainControlsContainer.append(this.playButton);
        this.playButton.classList.add("text-zinc-50", "rounded-full", "text-sm", "font-medium", "transition-colors", "hover:bg-zinc-800", "p-2.5");
        this.playButton.addEventListener("click", () => {
            const audio = this.audio();
            if (audio === null) return;
            if (audio.paused) audio.play().then();
            else audio.pause();
        });

        this.mainControlsContainer.append(this.nextButton);
        this.nextButton.classList.add("text-zinc-50", "rounded-full", "text-sm", "font-medium", "transition-colors", "hover:bg-zinc-800", "p-2.5", "disabled:text-zinc-600", "disabled:hover:bg-transparent", "disabled:cursor-not-allowed");
        this.nextButton.disabled = true;
        this.nextButton.innerHTML = `<span class="sr-only select-none">Next</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>`;
        this.nextButton.addEventListener("click", () => this.nextTrack());

        this.container.append(this.trackContainer);
        this.trackContainer.classList.add("flex", "items-center", "ml-6", "gap-x-4", "flex-1");

        this.trackContainer.append(this.currentTime);
        this.currentTime.classList.add("text-zinc-400", "text-xs", "select-none", "tabular-nums");

        this.trackContainer.append(this.trackOuterContainer);
        this.trackOuterContainer.classList.add("grow", "w-full", "relative", "h-8", "flex", "items-center");

        this.trackOuterContainer.append(this.trackInnerContainer);
        this.trackInnerContainer.classList.add("w-full", "h-1.5", "bg-zinc-800", "rounded-full", "flex", "items-center", "group");

        this.trackInnerContainer.append(this.trackTrack);
        this.trackTrack.classList.add("w-0", "h-full", "bg-zinc-50", "rounded-l-full");

        this.trackInnerContainer.append(this.trackThumb);
        this.trackThumb.classList.add("absolute", "ml-0.5", "h-[1.125rem]", "w-1", "rounded-full", "bg-zinc-50", "group-hover:bg-green-500");

        this.trackContainer.append(this.durationTime);
        this.durationTime.classList.add("text-zinc-400", "text-xs", "select-none", "tabular-nums");

        this.container.append(this.secondaryControlsContainer);
        this.secondaryControlsContainer.classList.add("ml-6", "flex", "items-center", "gap-x-1");

        this.secondaryControlsContainer.append(this.repeatButton);
        this.repeatButton.classList.add("rounded-full", "text-sm", "font-medium", "transition-colors", "hover:bg-zinc-800", "p-2.5");
        this.repeatButton.addEventListener("click", () => {
            if (this.queue === null) return;
            if (this.queue.repeat === Player.Repeat.OFF) {
                this.queue.repeat = Player.Repeat.QUEUE;
                this.renderTrack();
            }
            else if (this.queue.repeat === Player.Repeat.QUEUE) {
                this.queue.repeat = Player.Repeat.TRACK;
                this.renderTrack();
            }
            else if (this.queue.repeat === Player.Repeat.TRACK) {
                this.queue.repeat = Player.Repeat.OFF;
                this.renderTrack();
            }
        });

        this.secondaryControlsContainer.append(this.volumeButton);
        this.volumeButton.classList.add("text-zinc-50", "rounded-full", "text-sm", "font-medium", "transition-colors", "hover:bg-zinc-800", "p-2.5");
        this.volumeButton.addEventListener("click", () => {
            if (this.#currentAudio.volume === 0) this.setVolume(1);
            else this.setVolume(0);
        });

        this.secondaryControlsContainer.append(this.optionsButton);
        this.optionsButton.classList.add("text-zinc-50", "rounded-full", "text-sm", "font-medium", "transition-colors", "hover:bg-zinc-800", "p-2.5");
        this.optionsButton.innerHTML = `<span class="sr-only select-none">Options</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;

        [this.#currentAudio, this.#nextAudio].forEach(audio => {
            audio.addEventListener("play", () => this.renderPlayButton(true));
            audio.addEventListener("pause", () => this.renderPlayButton(false));
            audio.addEventListener("timeupdate", () => {
                this.currentTime.textContent = Track.formatDuration(audio.currentTime);
                this.durationTime.textContent = Track.formatDuration(audio.duration);
                this.trackTrack.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                this.trackThumb.style.left = `${(audio.currentTime / audio.duration) * 100}%`;
                if (audio.currentTime + 10 >= audio.duration) {
                    const next = this.queue?.next() ?? null;
                    if (this.#nextAudio.src === '' && next !== null) this.#nextAudio.src = next.audio().href;
                }
            });
            audio.addEventListener("volumechange", () => this.renderVolume());
            audio.addEventListener("ended", () => this.nextTrack());
        });

        if ("mediaSession" in navigator) {
            navigator.mediaSession.setActionHandler("nexttrack", () => this.nextTrack(true));
            navigator.mediaSession.setActionHandler("previoustrack", () => this.previousTrack(true));
        }
    }

    #queue: Player.Queue | null = null;
    public get queue(): Player.Queue | null {
        return this.#queue;
    }

    private audio() {
        return this.#currentAudio;
    }

    public play() {
        
        this.#currentAudio.play().then();
    }

    public pause() {
        this.#currentAudio.pause();
    }

    public toggle() {
        if (this.#currentAudio.paused)
            this.play();
        else
            this.pause();
    }

    public playQueue(queue: Player.Queue) {
        this.#queue = queue;
        if (!this.shown) this.show();
        const track = queue.current;
        if (track === null) return;
        this.#nextAudio.src = track.audio().href;
        this.playTrack(track);
    }

    private playTrack(track: Track) {
        if (this.#currentAudio.src === track.audio().href) {
            this.play();
            return;
        }
        this.#currentAudio.pause();
        const temp = this.#currentAudio;
        this.#currentAudio = this.#nextAudio;
        this.#nextAudio = temp;
        if (this.#currentAudio.src !== track.audio().href) this.#currentAudio.src = track.audio().href;
        this.#nextAudio.src = '';
        this.renderTrack();
        this.updateDiscordIPC(track);
        this.#currentAudio.play().then();
        this.renderVolume();
        this.renderMediaSession();
    }

    /**
     * Update the discord rich presence via IPC
     * @param track the current track
     */
    private async updateDiscordIPC(track: Track): Promise<void> {
        // return if we're not running in a Tauri Webview
        if (!window.__TAURI__) return;

        await invoke('rpc_update', {
            state: track.album?.title || 'unknown',
            details: track.title
        } satisfies RpcUpdate);
    }

    private renderMediaSession() {
        const track = this.queue?.current ?? null;
        if (track === null) return;
        if (!("mediaSession" in navigator)) return;
        const options: MediaMetadataInit = {
            title: track.title,
            artwork: [{src: track.cover().href}],
        };
        if (track.artist) options.artist = track.artist;
        if (track.album) options.album = track.album.title;
        navigator.mediaSession.metadata = new MediaMetadata(options);
    }

    public nextTrack(force = false) {
        const track = this.queue?.playNext() ?? null;
        if (track === null) {
            if (force) {
                this.#currentAudio.currentTime = 0;
                this.play();
            }
            return;
        }
        this.playTrack(track);
    }

    public previousTrack(force = false) {
        const track = this.queue?.playPrevious() ?? null;
        if (track === null) {
            if (force) {
                this.#currentAudio.currentTime = 0;
                this.play();
            }
            return;
        }
        this.playTrack(track);
    }

    private renderTrack() {
        const track = this.queue?.current ?? null;
        if (track === null) return;
        this.imageContainer.innerHTML = `<img src="${track.cover()}" class="w-full h-full rounded-lg" alt="" draggable="false"><svg class="hidden w-full h-full rounded-lg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 96 96"><path fill="#27272a" d="M0 0h96v96H0z"/><path fill="none" stroke="#a1a1aa" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M49.59 61.44v-33.8l14.78 8.45M49.6 61.44a8.45 8.45 0 0 1-8.45 8.45 8.45 8.45 0 0 1-8.45-8.45 8.45 8.45 0 0 1 8.45-8.45 8.45 8.45 0 0 1 8.45 8.45z"/></svg>`;
        this.imageContainer.querySelector("img")!.addEventListener("error", event => {
            (event.target as HTMLImageElement).classList.add("hidden");
            (event.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
        });
        this.title.textContent = track.title;
        this.details.innerHTML = `<a href="/artist/${track.artist ?? "Unknown Artist"}" class="hover:underline select-text">${track.artist ?? "Unknown Artist"}</a>${track.album === null ? "" : ` · <a href="/album/${track.album.id}" class="hover:underline select-text">${track.album.title}</a>`}`;
        this.previousButton.disabled = this.queue?.previous() === null;
        this.nextButton.disabled = this.queue?.next() === null;
        const repeatIcons = {
            queue: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`,
            single: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/></svg>`
        } as const;
        if (this.queue === null || this.queue.repeat === Player.Repeat.OFF) {
            this.repeatButton.classList.remove("text-zinc-50");
            this.repeatButton.classList.add("text-zinc-500");
            this.repeatButton.disabled = this.queue === null;
            this.repeatButton.innerHTML = `<span class="sr-only select-none">Repeat queue</span>${repeatIcons.queue}`;
        }
        else if (this.queue.repeat === Player.Repeat.QUEUE) {
            this.repeatButton.classList.remove("text-zinc-500");
            this.repeatButton.classList.add("text-zinc-50");
            this.repeatButton.disabled = this.queue === null;
            this.repeatButton.innerHTML = `<span class="sr-only select-none">Repeat track</span>${repeatIcons.queue}`;
        }
        else {
            this.repeatButton.classList.remove("text-zinc-500");
            this.repeatButton.classList.add("text-zinc-50");
            this.repeatButton.disabled = this.queue === null;
            this.repeatButton.innerHTML = `<span class="sr-only select-none">Disable repeat</span>${repeatIcons.single}`;
        }
    }

    public setVolume(volume: number) {
        this.#currentAudio.volume = volume;
        this.#nextAudio.volume = volume;
    }

    private renderPlayButton(playing: boolean) {
        if (!playing)
            this.playButton.innerHTML = `<span class="sr-only select-none">Play</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>`;
        else
            this.playButton.innerHTML = `<span class="sr-only select-none">Pause</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6" aria-hidden="true"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>`;
    }

    private renderVolume() {
        const volumeIcons = {
            max: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
            mid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
            low: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>`,
            muted: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`,
        } as const;
        const volume = this.#currentAudio.volume * 100;
        if (volume > 66) this.volumeButton.innerHTML = `<span class="sr-only select-none">Mute</span>${volumeIcons.max}`;
        else if (volume > 33) this.volumeButton.innerHTML = `<span class="sr-only select-none">Mute</span>${volumeIcons.mid}`;
        else if (volume > 1) this.volumeButton.innerHTML = `<span class="sr-only select-none">Mute</span>${volumeIcons.low}`;
        else this.volumeButton.innerHTML = `<span class="sr-only select-none">Unmute</span>${volumeIcons.muted}`;
    }

    public get shown(): boolean {
        return this.#shown;
    }

    public show(): void {
        this.container.classList.remove("translate-y-20");
        this.#shown = true;
    }

    public hide(): void {
        this.container.classList.add("translate-y-20");
        this.#shown = false;
    }
}

namespace Player {
    export class Queue {
        public readonly tracks: Track[] = [];
        #currentIndex: number;

        public get current(): Track | null {
            return this.tracks[this.#currentIndex] ?? null;
        }

        public constructor(tracks: Track[], start = 0, public repeat = Repeat.OFF) {
            this.tracks = tracks;
            this.#currentIndex = start;
            this.repeat = repeat;
        }

        private nextIndex(): number {
            return new EnhancedSwitch<Player.Repeat, number>(this.repeat)
                .case(Repeat.TRACK, this.#currentIndex)
                .case(Repeat.QUEUE, (this.#currentIndex + 1) % this.tracks.length)
                .case(Repeat.OFF, (this.#currentIndex + 1))
                .value;
        }

        public previousIndex(): number {
            return new EnhancedSwitch<Player.Repeat, number>(this.repeat)
                .case(Repeat.TRACK, this.#currentIndex)
                .case(Repeat.QUEUE, (this.#currentIndex - 1 + this.tracks.length) % this.tracks.length)
                .case(Repeat.OFF, (this.#currentIndex - 1))
                .value;
        }

        public next(): Track | null {
            return this.tracks[this.nextIndex()] ?? null;
        }

        public previous(): Track | null {
            return this.tracks[this.previousIndex()] ?? null;
        }

        public setPlaying(index: number) {
            if (index < 0 || index >= this.tracks.length) return null
            this.#currentIndex = index;
            return this.current;
        }

        public playNext() {
            return this.setPlaying(this.nextIndex());
        }

        public playPrevious() {
            return this.setPlaying(this.previousIndex());
        }
    }

    export enum Repeat {
        OFF = 0,
        TRACK = 1,
        QUEUE = 2,
    }
}

export default Player;
