import { SquareGeometry } from "../Geometry";

import vertSrc from "../Shaders/Raw.vert?raw";
import fragSrc from "../Shaders/HDR.frag?raw";

import { Shader } from "../Shader";
import { BufferType, RenderCommand } from "../RenderCommand";
import { IndexBuffer } from "../Buffer";
import { RenderTarget, TextureType } from "../Types";

export abstract class RenderPass
{
    constructor(geo : SquareGeometry) 
    {
        this.quad = geo;
    }
    abstract Init() : void;
    abstract Render(prevTarget : RenderTarget) : RenderTarget; 
    abstract Resize(w : number, h : number) : void;

    public output !: RenderTarget;
    public quad : SquareGeometry;
    public shader !: Shader;
};

export class ScreenPass extends RenderPass 
{
    constructor(geo : SquareGeometry) 
    {
        super(geo);
    } 
    
    override Init(): void {
        this.shader = new Shader(vertSrc, fragSrc);
        this.output = 
        {
            target: null,
            config: 
            {
                DepthTest: false,
                ClearColorBit: true,
                ClearDepthBit: false
            }
        };
    }

    override Render(prevTarget : RenderTarget): RenderTarget {
        const EBO = this.quad.vertexArray.GetIndexBuffer();

        RenderCommand.UseShader(this.shader.GetId());
        RenderCommand.BindVertexArray(this.quad.vertexArray.GetId());
        RenderCommand.BindBuffer(IndexBuffer.Id, BufferType.Index);

        // If a framebuffer exists then use it, otherwise use the default canvas one.
        if(this.output.target) 
        {
            RenderCommand.BindFramebuffer(this.output.target.GetFBO());
            RenderCommand.BindRenderbuffer(this.output.target.GetRBO());
        } else 
        {
            RenderCommand.UnbindFramebuffer();
            RenderCommand.UnbindRenderbuffer();
        }
        
        if(prevTarget.target)
        {
            RenderCommand.BindTexture(prevTarget.target.GetColorTexture().GetId(), TextureType.Tex2D);
            RenderCommand.SetInt(this.shader.GetId(), "sceneTex", 0);
        } 

        switch(EBO) 
        {
            default: RenderCommand.DrawIndexed(this.quad.drawFunction.shape, EBO.GetUniqueSize() / EBO.GetUniqueIndices().BYTES_PER_ELEMENT, EBO.GetUniqueOffset()); break;
            case null: RenderCommand.Draw(this.quad.drawFunction.shape, this.quad.vertexArray.GetVertexBuffer().GetVerticesCount());
        }

        RenderCommand.ReleaseShader();
        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Index);
        RenderCommand.UnbindFramebuffer();
        RenderCommand.UnbindRenderbuffer();
        RenderCommand.UnBindTexture(TextureType.Tex2D);

        return this.output;
    }

    override Resize(w: number, h: number): void {
        
    }
};