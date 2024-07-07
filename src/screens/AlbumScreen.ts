import MainScreen from "./MainScreen.ts";
import Player from "../Player.ts";

export default class AlbumScreen extends MainScreen {
    public override render() {
        this.screen.classList.remove("hidden");
        this.screen.classList.add("flex");
        while (this.body.firstElementChild)
            this.body.firstElementChild!.remove();

        this.toggleSidebarLink();

        this.body.innerHTML = `<section id="album"></section>`;
        const section = this.body.querySelector<HTMLElement>("#album")!;

        const id = location.pathname.split("/")[2]!;

        this.api.getAlbum(id).then(async album => {
            if (album !== null) {
                section.innerHTML = `
<div class="grid grid-cols-2 max-w-6xl p-12 gap-x-6">
    <div class="flex">
        <div class="mx-auto">
            <img src="${album.cover()}" draggable="false" data-fallback="album" alt="" class="w-64 h-64 rounded-xl select-none block mx-auto object-cover">
            <h2 class="text-2xl text-zinc-50 font-semibold tracking-tight select-text mt-4 text-center">${album.title}</h2>
            <a href="/artist/${album.artist}" class="block text-zinc-400 text-center hover:underline select-text mt-1">${album.artist}</a>
            <p class="text-sm text-zinc-400 select-none text-center mt-1">${album.tracks} track${album.tracks === 1 ? "" : "s"} · ${album.formattedDuration()}</p>
            <div class="flex mt-6 gap-2 justify-center">
              <button id="play" class="inline-flex gap-x-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition bg-zinc-50 text-zinc-900 shadow hover:bg-zinc-200 px-4 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                Play
              </button>
              <button id="shuffle" class="inline-flex gap-x-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition text-zinc-50 ring-1 ring-inset ring-zinc-800 shadow hover:bg-zinc-900 hover:ring-2 px-4 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
                Shuffle play
              </button>
              <button class="inline-flex gap-x-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition text-zinc-50 ring-1 ring-inset ring-zinc-800 shadow hover:bg-zinc-900 hover:ring-2 px-2.5 py-2">
                <span class="sr-only">Options</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
        </div>
    </div>
    <div id="tracks" class="space-y-6"></div>
</div>`;
                const tracks = await album.getTracks();
                section.querySelector("#play")!.addEventListener("click", () => Player.getInstance().playQueue(new Player.Queue(tracks.resources, 0)));
                section.querySelector("#shuffle")!.addEventListener("click", () => Player.getInstance().playQueue(new Player.Queue([...tracks.resources].sort(() => crypto.getRandomValues(new Uint32Array(1))[0]! / 0xFFFFFFFF - 0.5), 0)));
                for (const track of tracks.resources) {
                    const container = document.createElement("div");
                    container.classList.add("flex", "items-center", "gap-x-4", "group", "relative");
                    container.innerHTML = `
<div class="w-12 h-12 relative select-none aspect-square">
  <img src="${track.cover()}" alt="" draggable="false" data-fallback="track" class="w-full h-full rounded object-cover select-none">
  <div class="absolute inset-0 bg-zinc-900/90 text-zinc-50 items-center justify-center hidden group-hover:flex">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/>
  </div>
</div>
<div class="space-y-1">
  <button class="select-none text-base font-medium leading-none text-zinc-50"><span aria-hidden="true" class="absolute inset-0"></span><span class="relative select-text">${track.title}</span></button>
  <p class="select-none text-sm text-zinc-400"><a href="/artist/${track.artist ?? "Unknown Artist"}" draggable="false" class="relative select-text hover:underline">${track.artist ?? "Unknown Artist"}</a> · ${track.formattedDuration()}</p>
</div>`;
                    container.querySelector("button")!.addEventListener("click", () => Player.getInstance().playQueue(new Player.Queue(tracks.resources, tracks.resources.findIndex(t => t.id === track.id))));
                    section.querySelector("#tracks")!.appendChild(container);
                }
            }
        });
    }

    protected override toggleSidebarLink() {
        return;
    }
}
