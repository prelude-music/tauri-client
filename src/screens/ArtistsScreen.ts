import MainScreen from "./MainScreen.ts";
import ApiClient from "../../api/ApiClient.ts";
import Player from "../Player.ts";

export default class ArtistsScreen extends MainScreen {
    public constructor(api: ApiClient) {
        super(api);
        this.elements.sidebarLink = this.screen.querySelector<HTMLAnchorElement>(`#sidebar > div > div > a[href="/artists"]`)!;
    }

    public override render() {
        this.screen.classList.remove("hidden");
        this.screen.classList.add("flex");
        while (this.body.firstElementChild)
            this.body.firstElementChild!.remove();

        this.toggleSidebarLink();

        this.body.innerHTML = `
<section id="artists">
  <h2 class="text-2xl text-zinc-50 font-semibold tracking-tight select-none">Artists</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 mt-6 gap-4">
    <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-24 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-32 mt-1"></div></div>
    <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-12 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-1/2 mt-1"></div></div>
    <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-16 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-2/3 mt-1"></div></div>
</div>
  </div>
</section>`;

        const artistsSection = this.body.querySelector<HTMLDivElement>("#artists")!;
        setTimeout(() => artistsSection.querySelectorAll<HTMLDivElement>(".grid > .animate-pulse").forEach(el => el.classList.remove("invisible")), 500);

        this.api.getArtists(1, 24, {by: "name", direction: "asc"}).then(artists => {
            artistsSection.querySelector(".grid")!.innerHTML = "";
            for (const artist of artists.resources) {
                const artistElement = document.createElement("div");
                artistElement.classList.add("relative", "group", "opacity-0", "transition-opacity", "duration-300");
                artistElement.innerHTML = `<div class="rounded-xl overflow-hidden relative">
  <img data-fallback="artist" class="w-full h-full object-cover select-none aspect-square rounded-full" draggable="false" src="${artist.image}" alt="">
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
}
