/**
 * This is the entry point for our webgl application and must be constructed
 * if any webgl call is to be made.  
 * 
 * Upon construction, all that's left to do is call Init() which will begin the game loop
 * amongst other important processes, such as initializing the scene, camera and so fourth.
*/


export default class App 
{
    constructor(canvas : HTMLCanvasElement) 
    {
        this.canvas = canvas;
        this.context = canvas.getContext("webgl2") as WebGL2RenderingContext;
        if (!this.context) throw new Error("webgl context is not available!");

        // Important properties for setting the correct viewport dimensions.
        this.windowWidth = canvas.width * Math.max(devicePixelRatio, 2);
        this.windowHeight = canvas.height * Math.max(devicePixelRatio, 2);
        this.devicePixelRatio = window.devicePixelRatio || 1;

        // Resize Listener
        window.addEventListener("resize", () => this.Resize());
    }

    public Init() : void 
    {   

    }

    private Run() : void
    {

    }

    private Resize() : void 
    {
        if(!this.canvas) return; // If the canvas is null, then don't bother resizing it.

        var canvasWidth = this.canvas.width;
        var canvasHeight = this.canvas.height;

        if(canvasWidth != window.innerWidth || canvasHeight != window.innerHeight) 
        {
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
        }

        this.windowWidth = canvasWidth * Math.max(devicePixelRatio, 2);
        this.windowHeight = canvasHeight * Math.max(devicePixelRatio, 2);

        // RenderCommand.SetViewportDimensions(this.windowWidth, this.windowHeight);

        this.canvas.width = Math.round(this.windowWidth);
        this.canvas.height = Math.round(this.windowHeight);
    }

    public GetContext() : WebGL2RenderingContext {return this.context;}
    public GetWindowWidth() : number {return this.windowWidth;}
    public GetWindowHeight() : number {return this.windowHeight;}
    public GetDevicePixelRatio() : number {return this.devicePixelRatio;}

    private windowWidth : number;
    private windowHeight : number;
    private devicePixelRatio : number;

    private canvas : HTMLCanvasElement;
    private context : WebGL2RenderingContext;
}