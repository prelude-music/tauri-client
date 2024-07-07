export default abstract class Screen {
    protected abstract screen: HTMLDivElement;
    public abstract render(): void;
    public abstract unload(): void;

    public static get(id: string) {
        return document.querySelector<HTMLDivElement>(`div[data-screen="${id}"]`);
    }
}
