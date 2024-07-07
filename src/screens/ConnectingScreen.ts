import Screen from "./Screen.ts";

export default class ConnectingScreen extends Screen {
    public override readonly screen = Screen.get("connecting")!;

    public constructor(protected readonly packageJson: {version: string}) {
        super();
    }

    public override render() {
        this.screen.classList.remove("hidden");
        this.screen.classList.add("flex");
    }

    public override unload() {
        this.screen.classList.add("hidden");
        this.screen.classList.remove("flex");
    }

    public async connect(server: string): Promise<boolean> {
        this.screen.innerHTML = `<div class="min-w-96 bg-zinc-900 rounded-2xl p-6 ring-1 ring-inset ring-zinc-800">
  <h2 class="text-2xl text-zinc-50 font-semibold tracking-tight select-none">Connecting…</h2>
  <p class="text-sm mt-4 text-zinc-400 select-none"></p>
</div>`;
        this.screen.querySelector("& > div > p")!.textContent = `Establishing connection to ${server}…`;
        try {
            const res = await fetch(server);
            if (!res.ok) {
                this.error(`Failed to connect to ${server}. status=${res.status}`);
                return false;
            }
            const json = await res.json();
            const localMajor = this.packageJson.version.split(".")[0];
            if (localMajor !== json.version.split(".")[0]) {
                this.screen.querySelector("& > div > p")!.textContent = `Server ${server} is running an incompatible version (${json.version}). Supported versions are ${localMajor}.x.x`;
                return false;
            }
            return true;
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error) {
                if (e.message === "NetworkError when attempting to fetch resource.")
                    this.error(`Failed to connect to server ${server}.`);
                else this.error(e.message);
            }
            else
                this.error(`An unknown error occurred while attempting to connect to ${server}. Please check the console.`);
            return false;
        }
    }

    public error(error: string): void {
        this.screen.innerHTML = `<div class="min-w-96 bg-zinc-900 rounded-2xl p-6 ring-1 ring-inset ring-zinc-800">
  <h2 class="text-2xl text-red-400 font-semibold tracking-tight select-none">Error</h2>
  <p class="text-sm mt-4 text-zinc-400 select-none"></p>
</div>`;
        this.screen.querySelector("& > div > p")!.textContent = error;
    }
}
