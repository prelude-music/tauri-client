import MainScreen from "./MainScreen.ts";
import Artist from "../../api/Artist.ts";
import Player from "../Player.ts";

export default class ArtistScreen extends MainScreen {
    public override render() {
        this.screen.classList.remove("hidden");
        this.screen.classList.add("flex");
        while (this.body.firstElementChild)
            this.body.firstElementChild!.remove();

        this.toggleSidebarLink();

        this.body.innerHTML = `<section id="artist"></section>`;
        const section = this.body.querySelector<HTMLElement>("#artist")!;

        const name = decodeURI(location.pathname.split("/")[2]!);

        Artist.id(name).then(id =>
            this.api.getArtist(id).then(async artist => {
                if (artist !== null) {
                    section.innerHTML = `
<div>
    <div class="md:flex md:items-center md:justify-between md:space-x-5 max-w-6xl">
      <div class="flex items-start space-x-5">
        <div class="flex-shrink-0">
          <div class="relative">
            <img class="h-16 w-16 rounded-full select-none object-cover" src="${artist.image}" alt="" data-fallback="artist">
            <span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true"></span>
          </div>
        </div>
        <div class="pt-1.5">
          <h1 class="text-2xl font-bold text-gray-50">${artist.name}</h1>
          <p class="text-sm font-medium text-gray-400 select-none">${artist.albums} album${artist.albums === 1 ? "" : "s"} · ${artist.tracks} track${artist.tracks === 1 ? "" : "s"}</p> 
        </div>
      </div>
      <div class="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
        <button id="shuffle" class="inline-flex gap-x-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition text-zinc-50 ring-1 ring-inset ring-zinc-800 shadow hover:bg-zinc-900 hover:ring-2 px-4 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"></path><path d="m18 2 4 4-4 4"></path><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"></path><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"></path><path d="m18 14 4 4-4 4"></path></svg>
                    Shuffle play
                  </button>
        <button id="play" class="inline-flex gap-x-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition bg-zinc-50 text-zinc-900 shadow hover:bg-zinc-200 px-4 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
          Play
        </button>
      </div>
    </div>
    <section id="albums" class="mt-12">
      <h2 class="text-2xl text-zinc-50 font-semibold tracking-tight select-none">Albums</h2>
      <div class="flex [&>div]:w-32 mt-6 sm:gap-4 xl:gap-6">
        <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-24 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-32 mt-1"></div></div>
        <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-12 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-1/2 mt-1"></div></div>
        <div class="invisible animate-pulse"><div class="w-full aspect-square bg-zinc-800 rounded-xl"></div><div class="h-[17px] bg-zinc-800 rounded-full w-16 mt-3"></div><div class="h-2.5 bg-zinc-800 rounded-full w-2/3 mt-1"></div></div>
      </div>
    </section>
    <section class="mt-12">
      <h2 class="text-2xl text-zinc-50 font-semibold tracking-tight select-none">Tracks</h2>
      <div id="tracks" class="space-y-6 mt-6"></div>
    </section>
</div>
`;
                    const albumsSection = this.body.querySelector<HTMLDivElement>("#albums")!;
                    setTimeout(() => albumsSection.querySelectorAll<HTMLDivElement>(".flex > .animate-pulse").forEach(el => el.classList.remove("invisible")), 500);
                    const albums = await artist.getAlbums();
                    albumsSection.querySelector(".flex")!.innerHTML = "";
                    if (albums.resources.length === 0)
                        albumsSection.remove();
                    else for (const album of albums.resources) {
                        const albumElement = document.createElement("div");
                        albumElement.classList.add("relative", "group", "opacity-0", "transition-opacity", "duration-300");
                        albumElement.innerHTML = `<div class="rounded-xl overflow-hidden relative">
  <img data-fallback="album" class="w-full h-full object-cover select-none aspect-square" draggable="false" src="${album.cover()}" alt="">
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
                        albumsSection.querySelector(".flex")!.append(albumElement);
                        setTimeout(() => albumElement.classList.remove("opacity-0"), 50);
                    }

                    const tracks = await artist.getTracks(Infinity);
                    const tracksSection = this.body.querySelector<HTMLDivElement>("#tracks")!;
                    section.querySelector("#play")!.addEventListener("click", () => Player.getInstance().playQueue(new Player.Queue(tracks.resources, 0)));
                    section.querySelector("#shuffle")!.addEventListener("click", () => Player.getInstance().playQueue(new Player.Queue([...tracks.resources].sort(() => crypto.getRandomValues(new Uint32Array(1))[0]! / 0xFFFFFFFF - 0.5), 0)));
                    for (const track of tracks.resources) {
                        const container = document.createElement("div");
                        container.classList.add("flex", "items-center", "gap-x-4", "group", "relative");
                        container.innerHTML = `
<div class="w-12 h-12 relative select-none aspect-square">
  <img src="${track.cover()}" alt="" draggable="false" data-fallback="track" class="w-full h-full object-cover select-none">
  <div class="absolute inset-0 bg-zinc-900/90 text-zinc-50 items-center justify-center hidden group-hover:flex">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/>
  </div>
</div>
<div class="space-y-1">
  <button class="select-none text-base font-medium leading-none text-zinc-50"><span aria-hidden="true" class="absolute inset-0"></span><span class="relative select-text">${track.title}</span></button>
  <p class="select-none text-sm text-zinc-400"><a href="/artist/${track.artist ?? "Unknown Artist"}" draggable="false" class="relative select-text hover:underline">${track.artist ?? "Unknown Artist"}</a>${track.album === null ? "" : ` · <a href="/album/${track.album.id}" draggable="false" class="relative select-text hover:underline">${track.album.title}</a>`} · ${track.formattedDuration()}</p>
</div>`;
                        container.querySelector("button")!.addEventListener("click", () => Player.getInstance().playQueue(new Player.Queue(tracks.resources, tracks.resources.findIndex(t => t.id === track.id))));
                        tracksSection.appendChild(container);
                    }
                }
            })
        );
    }

    protected override toggleSidebarLink() {
        return;
    }
}
