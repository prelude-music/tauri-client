import "./style.css";
import packageJson from "../package.json";
import Screen from "./screens/Screen.ts";
import MainScreen from "./screens/MainScreen.ts";
import ApiClient from "../api/ApiClient.ts";
import EnhancedSwitch from "enhanced-switch";
import AlbumsScreen from "./screens/AlbumsScreen.ts";
import AlbumScreen from "./screens/AlbumScreen.ts";
import Player from "./Player.ts";
import ArtistsScreen from "./screens/ArtistsScreen.ts";
import ArtistScreen from "./screens/ArtistScreen.ts";
import ConnectingScreen from "./screens/ConnectingScreen.ts";
import ServerScreen from "./screens/ServerScreen.ts";

const rootScreens = {
    connecting: new ConnectingScreen(packageJson),
    server: new ServerScreen(),
} as const;

const main = (server: string) => {
    localStorage.setItem("prelude.server", server);
    const api = new ApiClient(server);

    new MutationObserver(mutations => {
        for (const mutation of mutations)
            mutation.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;
                const images = node.querySelectorAll<HTMLImageElement>("img[data-fallback]");
                for (const image of images)
                    image.addEventListener("error", () => {
                        image.outerHTML = new EnhancedSwitch<string, string>(image.dataset.fallback!)
                            .case("track", `<svg class="${image.getAttribute("class")}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 96 96"><path fill="#27272a" d="M0 0h96v96H0z"/><path fill="none" stroke="#a1a1aa" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M49.59 61.44v-33.8l14.78 8.45M49.6 61.44a8.45 8.45 0 0 1-8.45 8.45 8.45 8.45 0 0 1-8.45-8.45 8.45 8.45 0 0 1 8.45-8.45 8.45 8.45 0 0 1 8.45 8.45z"/></svg>`)
                            .case("album", `<svg class="${image.getAttribute("class")}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 96 96"><path fill="#27272a" d="M0 0h96v96H0z"/><path stroke="#a1a1aa" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M59.927 29.949 71.824 71.59M48.03 29.95v41.64m-11.9-35.692V71.59M24.233 24v47.591"/></svg>`)
                            .case("artist", `<svg class="${image.getAttribute("class")}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 96 96"><path fill="#27272a" d="M0 0h96v96H0z"/><path fill="none" stroke="#a1a1aa" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M71.71 66.284c0-7.702-4.571-14.856-9.142-18.284a11.427 11.427 0 0 0-1.029-18.97m-5.828 9.828a11.427 11.427 0 0 1-11.427 11.428 11.427 11.427 0 0 1-11.428-11.428 11.427 11.427 0 0 1 11.428-11.427A11.427 11.427 0 0 1 55.71 38.858Zm6.857 29.711a18.284 18.284 0 0 0-36.568 0"/></svg>`)
                            .default("")
                            .value;
                    });
            })
    }).observe(document.body, {childList: true, subtree: true});

    const screens = {
        main: new MainScreen(api),
        albums: new AlbumsScreen(api),
        album: new AlbumScreen(api),
        artists: new ArtistsScreen(api),
        artist: new ArtistScreen(api),
    } as const;

    let currentScreen: Screen | undefined;

    const render = (url: URL) => {
        if (currentScreen !== undefined)
            currentScreen.unload();
        if (url.pathname === "/") currentScreen = screens.main;
        else if (url.pathname === "/albums") currentScreen = screens.albums;
        else if (url.pathname.startsWith("/album/")) currentScreen = screens.album;
        else if (url.pathname.startsWith("/artists")) currentScreen = screens.artists;
        else if (url.pathname.startsWith("/artist/")) currentScreen = screens.artist;
        if (currentScreen !== undefined)
            currentScreen.render();
    }

    render(new URL(document.URL));

    const player = Player.getInstance();

    document.addEventListener("click", event => {
        if (event.target instanceof HTMLElement) {
            const element = event.target;
            const a = element.closest("a");
            if (a !== null) {
                event.preventDefault();
                history.pushState({}, "", a.href);
                render(new URL(a.href));
                return;
            }
        }
    });

    // on "space"
    document.addEventListener("keydown", event => {
        if (event.code === "Space") {
            event.preventDefault();
            player.toggle();
            return;
        }
    });

    document.body.append(player.container);
}

const connect = async (server: string) => {
    rootScreens.server.unload();
    rootScreens.connecting.render();
    if (await rootScreens.connecting.connect(server)) {
        main(server);
        rootScreens.connecting.unload();
    }
    else {
        const f = await federation(server);
        if (f === null) rootScreens.connecting.error(`Failed to connect to ${server}.`);
        else {
            main(f);
            rootScreens.connecting.unload();
        }
    }
}

const federation = async (server: string): Promise<string | null> => {
    try {
        const res = await fetch(new URL("/.well-known/prelude", server));
        if (!res.ok) return null;
        const json = await res.json();
        if ("prelude" in json && typeof json.prelude === "string") return json.prelude;
        return null;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}

const discover = async (): Promise<URL[]> => {
    const check = async (address: string): Promise<URL[]> => {
        const r: URL[] = [];
        try {
            const res = await fetch(`https://${address}/.well-known/prelude`, {signal: AbortSignal.timeout(250)});
            if (res.ok) r.push(new URL(`https://${address}`));
        } catch (e) {}
        try {
            const res = await fetch(`http://${address}:9847`, {signal: AbortSignal.timeout(250)});
            if (res.ok) r.push(new URL(`http://${address}:9847`));
        } catch (e) {}
        try {
            const res = await fetch(`http://${address}/.well-known/prelude`, {signal: AbortSignal.timeout(250)});
            if (res.ok) r.push(new URL(`http://${address}`));
        } catch (e) {}
        return r;
    }

    const scan = ["prelude.local", "127.0.0.1"];
    const r: URL[] = [];

    for (const address of scan) {
        const addresses = await check(address);
        r.push(...addresses);
    }
    return r;
}

const lsServer = localStorage.getItem("prelude.server");
if (lsServer !== null) connect(lsServer).then();
else {
    rootScreens.server.render();
    discover().then(servers => rootScreens.server.discoverResults(servers, server => connect(server.href)));
}
