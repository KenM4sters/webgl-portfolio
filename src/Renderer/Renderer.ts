import GUI from "lil-gui";
import { RenderCommand } from "../RenderCommand";
import Scene from "../Scene";
import { TextureType } from "../Types";
import { PostProcessor } from "./PostProcessor";

export default class Renderer
{
    constructor() 
    {
        this.postProcessor = new PostProcessor();

    }

    Init(gui : GUI) : void 
    {
        this.postProcessor.Init(gui);
    }

    Render(scene : Scene, ts : number) : void 
    {
        // Set Framebuffer.
        if(scene.output.target) 
        {   
            RenderCommand.BindFramebuffer(scene.output.target.GetFBO());
            RenderCommand.BindRenderbuffer(scene.output.target.GetRBO());              
            RenderCommand.BindTexture(scene.output.target.GetColorTexture().GetId(), TextureType.Tex2D);
        } else {
            RenderCommand.UnbindFramebuffer();
            RenderCommand.UnbindRenderbuffer();
            RenderCommand.UnBindTexture(TextureType.Tex2D);
        }

        // Set Render configurations.
        RenderCommand.EnableDepthTest(scene.output.config.DepthTest);
        RenderCommand.ClearColorBufferBit(scene.output.config.ClearColorBit);
        RenderCommand.ClearDepthBufferBit(scene.output.config.ClearDepthBit);
        RenderCommand.SetClearColor([0.01, 0.01, 0.01, 1.0]);

        scene.Render(ts);
        
        // Cleanup.
        if(scene.output.target?.GetFBO()) RenderCommand.UnbindFramebuffer();
        if(scene.output.target?.GetRBO()) RenderCommand.UnbindRenderbuffer();
        if(scene.output.target?.GetColorTexture()) RenderCommand.UnBindTexture(TextureType.Tex2D);
        
        this.postProcessor.Render(scene.output);
    }

    Resize(w : number, h : number) : void 
    {
        RenderCommand.SetViewportDimensions(w, h);
        this.postProcessor.Resize(w, h);
    }

    private postProcessor !: PostProcessor;

}