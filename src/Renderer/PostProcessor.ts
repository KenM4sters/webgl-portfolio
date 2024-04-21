import { SquareGeometry } from "../Geometry";
import { Shader } from "../Shader";
import { RenderTarget } from "../Types";
import BloomPass from "./BloomPass";
import {RenderPass, ScreenPass} from "./ScreenPass";

  
export class PostProcessor
{
    constructor() 
    {
        const quad = new SquareGeometry();
        const bloomPass = new BloomPass(quad);
        const screenPass = new ScreenPass(quad);
        this.passess.push(bloomPass);
        this.passess.push(screenPass);
    }
    
    Init() : void 
    {
        for(const pass of this.passess) 
        {
            pass.Init();
        } 
    }

    Render(sceneOutput : RenderTarget) : void 
    {
        var result : RenderTarget = sceneOutput;
        PostProcessor.sceneOutput = sceneOutput;
        
        // for(const pass of this.passess) 
        // {
        //     result = pass.Render(result);
        // }
    }

    Resize(w : number, h: number) : void 
    {
        for(const pass of this.passess) 
        {
            pass.Resize(w, h);
        }
    }

    SubmitPass(pass : RenderPass) : void { this.passess.push(pass); }

    private passess : Array<RenderPass> = new Array<RenderPass>();
    static sceneOutput : RenderTarget;
};