import Screen from "./Screen.ts";
import ApiClient from "../../api/ApiClient.ts";
import Player from "../Player.ts";

export default class MainScreen extends Screen {
    protected override screen = Screen.get("main")!;
    protected readonly body = this.screen.querySelector<HTMLDivElement>("#main-body")!;

    public constructor(protected readonly api: ApiClient) {
        super();
    }

    protected readonly elements: {
        sidebar: HTMLDivElement,
        sidebarLink: HTMLAnchorElement
    } = {
        sidebar: this.screen.querySelector<HTMLDivElement>("#sidebar")!,
        sidebarLink: this.screen.querySelector<HTMLAnchorElement>(`#sidebar > div > div > a[href="/"]`)!
    };

    public override render() {
        this.screen.classList.remove("hidden");
        this.screen.classList.add("flex");
        while (this.body.firstElementChild)
            this.body.firstElementChild!.remove();

        this.toggleSidebarLink();

        this.body.innerHTML = `
<section id="albums">
  <h2 class="text-2xl text-zinc-50 font-semibold tracking-tight select-none">Albums</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 mt-6 sm:gap-4 xl:gap-6 [&>div]:hidden [&>:nth-child(1)]:block sm:[&>:nth-child(2)]:block md:[&>:nth-child(3)]:block lg:[&>:nth-child(4)]:block xl:[&>:nth-child(5)]:block xl:[&>:nth-child(6)]:block xl:[&>:nth-child(7)]:block xl:[&>:nth-child(8)]:block">
    <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-24 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-32 mt-1"></div></div>
    <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-12 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-1/2 mt-1"></div></div>
    <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-16 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-2/3 mt-1"></div></div>
  </div>
</section>
<section id="artists">
  <h2 class="text-2xl text-zinc-50 font-semibold tracking-tight select-none">Artists</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 mt-6 sm:gap-4 xl:gap-6 [&>div]:hidden [&>:nth-child(1)]:block sm:[&>:nth-child(2)]:block md:[&>:nth-child(3)]:block lg:[&>:nth-child(4)]:block xl:[&>:nth-child(5)]:block xl:[&>:nth-child(6)]:block xl:[&>:nth-child(7)]:block xl:[&>:nth-child(8)]:block">
    <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-24 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-32 mt-1"></div></div>
    <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-12 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-1/2 mt-1"></div></div>
    <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-16 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-2/3 mt-1"></div></div>
  </div>
</section>`;

        const albumsSection = this.body.querySelector<HTMLDivElement>("#albums")!;
        setTimeout(() => albumsSection.querySelectorAll<HTMLDivElement>(".grid > .animate-pulse").forEach(el => el.classList.remove("invisible")), 500);

        this.api.getAlbums(1, 8, {by: "tracks", direction: "desc"}).then(albums => {
            albumsSection.querySelector(".grid")!.innerHTML = "";
            for (const album of albums.resources) {
                const albumElement = document.createElement("div");
                albumElement.classList.add("relative", "group", "opacity-0", "transition-opacity", "duration-300");
                albumElement.innerHTML = `<div class="rounded-xl overflow-hidden relative aspect-square">
  <img data-fallback="album" class="w-full h-full object-cover select-none" draggable="false" src="${album.cover()}" alt="">
  <button class="absolute bottom-1 right-1 rounded-full bg-zinc-950 text-zinc-50 p-2.5 opacity-0 z-10 shadow transition-all group-hover:opacity-100 hover:bg-zinc-50 hover:text-zinc-900">
    <span class="sr-only select-none">Play ${album.artist ?? "Unknown Artist"} ${album.title}</span>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5" aria-hidden="true">
      <polygon points="6 3 20 12 6 21 6 3"/>
    </svg>
  </button>
</div>
<div class="space-y-1 mt-3">
  <h3 class="font-medium text-zinc-50 text-sm leading-none"><a href="/album/${album.id}" draggable="false" class="select-none"><span aria-hidden="true" class="absolute inset-0"></span><span class="relative hover:underline select-text">${album.title}</span></a></h3>
  <p class="text-xs text-zinc-400 select-none"><a href="/artist/${album.artist}" draggable="false" class="relative hover:underline select-text">${album.artist ?? "Unknown Artist"}</a> · ${album.tracks} track${album.tracks === 1 ? "" : "s"}</p>
</div>
`;

                albumElement.querySelector("button")!.addEventListener("click", async () => {
                    Player.getInstance().playQueue(new Player.Queue((await album.getTracks()).resources));
                });
                albumsSection.querySelector(".grid")!.append(albumElement);
                setTimeout(() => albumElement.classList.remove("opacity-0"), 50);
            }
        });

        const artistsSection = this.body.querySelector<HTMLDivElement>("#artists")!;
        setTimeout(() => artistsSection.querySelectorAll<HTMLDivElement>(".grid > .animate-pulse").forEach(el => el.classList.remove("invisible")), 500);

        this.api.getArtists(1, 8, {by: "tracks", direction: "desc"}).then(artists => {
            artistsSection.querySelector(".grid")!.innerHTML = "";
            for (const artist of artists.resources) {
                const artistElement = document.createElement("div");
                artistElement.classList.add("relative", "opacity-0", "transition-opacity", "duration-300");
                artistElement.innerHTML = `<div class="rounded-full overflow-hidden relative aspect-square">
  <img data-fallback="artist" class="w-full h-full object-cover select-none" draggable="false" src="${artist.image}" alt="">
  <button class="absolute flex items-center justify-center inset-0 bg-zinc-950/80 opacity-0 z-10 shadow transition-opacity duration-300 hover:opacity-100">
    <span class="sr-only select-none">Play ${artist.name}</span>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-1/4 h-1/4" aria-hidden="true">
      <polygon points="6 3 20 12 6 21 6 3"/>
    </svg>
  </button>
</div>
<div class="space-y-1 mt-3">
  <h3 class="font-medium text-zinc-50 text-sm leading-none text-center"><a href="/artist/${artist.name}" draggable="false" class="select-none"><span aria-hidden="true" class="absolute inset-0"></span><span class="relative hover:underline select-text">${artist.name}</span></a></h3>
  <p class="text-xs text-zinc-400 select-none text-center">${artist.albums} album${artist.albums === 1 ? "" : "s"} · ${artist.tracks} track${artist.tracks === 1 ? "" : "s"}</p>
</div>
`;
                artistElement.querySelector("button")!.addEventListener("click", async () => {
                    Player.getInstance().playQueue(new Player.Queue((await artist.getTracks()).resources));
                });
                artistsSection.querySelector(".grid")!.append(artistElement);
                setTimeout(() => artistElement.classList.remove("opacity-0"), 50);
            }
        });
    }

    public override unload() {
        this.toggleSidebarLink();
    }

    protected toggleSidebarLink() {
        this.elements.sidebarLink.classList.toggle("hover:bg-zinc-800");
        this.elements.sidebarLink.classList.toggle("bg-zinc-800");
    }
}
