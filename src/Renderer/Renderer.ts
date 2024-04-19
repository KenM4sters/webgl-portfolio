import { RenderCommand } from "../RenderCommand";
import Scene from "../Scene";
import { PostProcessor } from "./PostProcessor";

export default class Renderer
{
    constructor() 
    {
        this.postProcessor = new PostProcessor();
    }

    Init() : void 
    {
        
    }

    Render(scene : Scene) : void 
    {
        RenderCommand.SetClearColor([1.0, 0.5, 0.0, 1.0]);
        RenderCommand.ClearColorBufferBit(true);

        scene.Render();
        this.postProcessor.Render();

    }

    Resize(w : number, h : number) : void 
    {
        RenderCommand.SetViewportDimensions(w, h);
    }

    private postProcessor : PostProcessor;

}