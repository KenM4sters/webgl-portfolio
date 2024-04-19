/**
 * This is the entry point for our webgl application and must be constructed
 * if any webgl call is to be made.  
 * 
 * Upon construction, all that's left to do is call Init() and Run() which will begin the game loop
 * amongst other important processes, such as initializing the scene, camera and so fourth.
*/

import App from "./App";
import Renderer from "./Renderer/Renderer";
import Scene from "./Scene";

export default class Animus extends App
{
    constructor(canvas : HTMLCanvasElement) 
    {
        super(canvas);
        this.Resize();
    }

    public override Init() : void 
    {   
        this.scene.Init();
        this.renderer.Init();
    }

    public override Run() : void
    {                   
        this.renderer.Render(this.scene);
        window.requestAnimationFrame(() => this.Run());
    }

    public override Resize() : void 
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

        this.canvas.width = Math.round(this.windowWidth);
        this.canvas.height = Math.round(this.windowHeight);

        this.renderer.Resize(this.windowWidth, this.windowHeight);
        this.scene.Resize();
    }

    public GetContext() : WebGL2RenderingContext {return this.context;}
    public GetWindowWidth() : number {return this.windowWidth;}
    public GetWindowHeight() : number {return this.windowHeight;}
    public GetDevicePixelRatio() : number {return this.devicePixelRatio;}

    private renderer : Renderer = new Renderer();
    private scene : Scene = new Scene();

}