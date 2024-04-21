import { RenderCommand } from "./RenderCommand";

let singleton : boolean = false;

export default abstract class App 
{
    constructor(canvas : HTMLCanvasElement) 
    {
        if(singleton) return this;
        singleton = true;

        this.canvas = canvas;
        this.context = canvas.getContext("webgl2") as WebGL2RenderingContext;
        if (!this.context) throw new Error("webgl context is not available!");

        var ext = this.context.getExtension('EXT_color_buffer_float');
        if (!ext) throw new Error('EXT_color_buffer_float is not supported');
    
        // *IMOPRTANT* this method must be called before any other rendering commands are made.
        RenderCommand.SubmitContext(this.context); 

        // Important properties for setting the correct viewport dimensions.
        this.windowWidth = canvas.width * Math.max(devicePixelRatio, 2);
        this.windowHeight = canvas.height * Math.max(devicePixelRatio, 2);
        this.devicePixelRatio = window.devicePixelRatio || 1;

        // Resize Listener
        window.addEventListener("resize", () => this.Resize());
    }

    public abstract Run() : void;
    public abstract Resize() : void;

    protected canvas !: HTMLCanvasElement;
    protected context !: WebGL2RenderingContext;
    protected windowWidth !: number;
    protected windowHeight !: number;
    protected devicePixelRatio !: number;
}