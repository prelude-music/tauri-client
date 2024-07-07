import Screen from "./Screen.ts";

export default class ServerScreen extends Screen {
    public override readonly screen = Screen.get("server")!;

    public override render() {
        this.screen.classList.remove("hidden");
        this.screen.classList.add("flex");
    }

    public override unload() {
        this.screen.classList.add("hidden");
        this.screen.classList.remove("flex");
    }

    public discoverResults(servers: URL[], connect: (server: URL) => any) {
        if (servers.length === 0) return;
        const discovered = this.screen.querySelector("#discovered")!;
        discovered.innerHTML = `
<h3 class="text-sm text-zinc-50 font-medium leading-none select-none mt-6">Discovered servers</h3>
<div class="flex flex-col mt-2 gap-2">
  <!--<button class="flex gap-2 items-center text-sm text-left px-3 py-1.5 text-zinc-50 rounded-lg ring-1 ring-inset ring-zinc-50/5 hover:ring-2 hover:bg-zinc-50/5">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-green-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    <span><span class="text-zinc-400">https://</span>prelude.local</span>
  </button>
  <button class="flex gap-2 items-center text-sm text-left px-3 py-1.5 text-zinc-50 rounded-lg ring-1 ring-inset ring-zinc-50/5 hover:ring-2 hover:bg-zinc-50/5">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-zinc-400" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
    <span><span class="text-zinc-400">http://</span>127.0.0.1<span class="text-zinc-400">:9847</span></span>
  </button>-->
</div>`;
        for (const server of servers) {
            const button = document.createElement("button");
            button.classList.add("flex", "gap-2", "items-center", "text-sm", "text-left", "px-3", "py-1.5", "text-zinc-50", "rounded-lg", "ring-1", "ring-inset", "ring-zinc-50/5", "hover:ring-2", "hover:bg-zinc-50/5");
            button.innerHTML = `
            ${server.protocol === "https:"
                ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-green-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-zinc-400" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`
            }
            <span><span class="text-zinc-400">${server.protocol}//</span>${server.hostname}${server.port ? `<span class="text-zinc-400">:${server.port}</span>` : ""}</span>
            `;
            button.addEventListener("click", () => connect(server));
            discovered.appendChild(button);
        }
    }
}
