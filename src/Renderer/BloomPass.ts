import * as glm from "gl-matrix";
import Framebuffer from "../Framebuffer";
import { SquareGeometry } from "../Geometry";
import { BufferType, RenderCommand } from "../RenderCommand";
import { Shader } from "../Shader";
import { Texture2D } from "../Texture";
import { FunctionEquationTypes, BlendFunctionTypes, ColorAttachments, DataSizes, ImageChannels, ImageConfig, Ref, RenderTarget, TextureType } from "../Types";
import { RenderPass } from "./ScreenPass";
import { PostProcessor } from "./PostProcessor";

// Shaders.
import upSamplingFrag from "../Shaders/UpSampling.frag?raw";
import downSamplingFrag from "../Shaders/DownSampling.frag?raw";
import rawVert from "../Shaders/Raw.vert?raw"; 
import rawFrag from "../Shaders/Raw.frag?raw"; 
import { IndexBuffer } from "../Buffer";
import GUI from "lil-gui";

export default class BloomPass extends RenderPass 
{
    constructor(geo : SquareGeometry) 
    {
        super(geo);
    }

    Init(gui : GUI): void {

        this.shader = new Shader(rawVert, rawFrag);
        RenderCommand.UseShader(this.shader.GetId());
        RenderCommand.SetInt(this.shader.GetId(), "srcTexture", 0);
        RenderCommand.ReleaseShader();
        
        var mipSize : glm.vec2 = glm.vec2.fromValues(this.windowWidth, this.windowHeight);
        var iMipSize : glm.vec2 = glm.vec2.fromValues(Math.floor(this.windowWidth), Math.floor(this.windowHeight));
        
        for(let i = 0; i < this.bloomParams.nMipMaps; i++) 
        {   
            mipSize = glm.vec2.scale(glm.vec2.create(), mipSize, 0.5);
            iMipSize = glm.vec2.scale(glm.vec2.create(), iMipSize, 0.5);

            var mipConfig : ImageConfig = 
            {
                TargetType: TextureType.Tex2D,
                MipMapLevel: 0,
                NChannels: ImageChannels.RGBA32F,
                Width: mipSize[0],
                Height: mipSize[1],
                Format: ImageChannels.RGBA,
                DataType: DataSizes.FLOAT   
            }
            this.mipChain.push(new Texture2D(mipConfig));
        }

        this.blurFBO = new Framebuffer(this.mipChain[0], false);

        RenderCommand.BindFramebuffer(this.blurFBO.GetFBO());

        var attachments : number[] = [ ColorAttachments.COLOR_0 ];
        RenderCommand.DrawFramebuffer(attachments);

        RenderCommand.UnbindFramebuffer();
        
        // Prepping uniform locations for the source HDR texture from the Scene output.
        RenderCommand.UseShader(this.upsampleShader.GetId());
        RenderCommand.SetInt(this.upsampleShader.GetId(), "srcTexture", 0);
        RenderCommand.ReleaseShader();
        RenderCommand.UseShader(this.downsampleShader.GetId());
        RenderCommand.SetInt(this.downsampleShader.GetId(), "srcTexture", 0);
        RenderCommand.ReleaseShader();

        var bloomImageConfig : ImageConfig = 
        {
            TargetType: TextureType.Tex2D,
            MipMapLevel: 0,
            NChannels: ImageChannels.RGBA32F,
            Width: this.windowWidth,
            Height: this.windowHeight,
            Format: ImageChannels.RGBA,
            DataType: DataSizes.FLOAT
        }

        this.output = {
            target: new Framebuffer(bloomImageConfig),
            config: 
            {
                DepthTest: false,
                ClearColorBit: true,
                ClearDepthBit: false
            }
        }; 

        RenderCommand.UnbindFramebuffer();
    }

    Render(prevTarget: RenderTarget): RenderTarget {

        // Get the source HDR scene texture from renderer and make sure it's valid.
        const EBO = this.quad.vertexArray.GetIndexBuffer();
        const VAO = this.quad.vertexArray.GetId();

        RenderCommand.BindVertexArray(VAO);
        RenderCommand.BindBuffer(IndexBuffer.Id, BufferType.Index);
        RenderCommand.BindFramebuffer(this.blurFBO.GetFBO()); // Make sure you've bound the bloomFBO.

        // Firstly, we downsample the source texture 'BloomControls.nMipMap' times.
        this.RenderDownSamples();
        // Secondly, we upsample and blur the texture until it's back to the original dimensions.
        this.RenderUpSamples();

        RenderCommand.UnbindFramebuffer();
        RenderCommand.SetViewportDimensions(this.windowWidth, this.windowHeight); // !!Remember to set the viewport dimensions back to the screen width and height.

        if(this.output.target) RenderCommand.BindFramebuffer(this.output.target.GetFBO());

        // Finally, draw our mesh (fullscreen 2d quad) to the screen with the upsampled, blurred texture.
        RenderCommand.UseShader(this.shader.GetId()); 
        RenderCommand.BindTexture(this.mipChain[0].GetId(), TextureType.Tex2D, 0);
  
        switch(EBO) 
        {
            default: RenderCommand.DrawIndexed(this.quad.drawFunction.shape, EBO.GetUniqueSize() / EBO.GetUniqueIndices().BYTES_PER_ELEMENT, EBO.GetUniqueOffset()); break;
            case null: RenderCommand.Draw(this.quad.drawFunction.shape, this.quad.vertexArray.GetVertexBuffer().GetVerticesCount());
        }

        RenderCommand.ReleaseShader();
        RenderCommand.UnBindTexture(TextureType.Tex2D);

        return this.output;
    }

    Resize(w: number, h: number): void {
        this.windowWidth = w;
        this.windowHeight = h;;
        
        if(!this.output) return;
        
        if(this.output?.target?.GetFBO()) RenderCommand.DeleteFramebuffer(this.output.target?.GetFBO());
        if(this.output?.target?.GetRBO()) RenderCommand.DeleteRenderBuffer(this.output.target?.GetRBO());
        if(this.output?.target?.GetColorTexture()) RenderCommand.DeleteTexture2D(this.output.target?.GetColorTexture().GetId());
        if(this.blurFBO?.GetFBO()) RenderCommand.DeleteFramebuffer(this.blurFBO.GetFBO());

        var bloomImageConfig : ImageConfig = 
        {
            TargetType: TextureType.Tex2D,
            MipMapLevel: 0,
            NChannels: ImageChannels.RGBA32F,
            Width: this.windowWidth,
            Height: this.windowHeight,
            Format: ImageChannels.RGBA,
            DataType: DataSizes.FLOAT
        }

        this.output = {
            target: new Framebuffer(bloomImageConfig),
            config: 
            {
                DepthTest: false,
                ClearColorBit: true,
                ClearDepthBit: false
            }
        };  
        
        var mipSize : glm.vec2 = glm.vec2.fromValues(this.windowWidth, this.windowHeight);
        var iMipSize : glm.vec2 = glm.vec2.fromValues(Math.floor(this.windowWidth), Math.floor(this.windowHeight));
        
        for(let i = 0; i < this.bloomParams.nMipMaps; i++) 
        {   
            mipSize = glm.vec2.scale(glm.vec2.create(), mipSize, 0.5);
            iMipSize = glm.vec2.scale(glm.vec2.create(), iMipSize, 0.5);

            var mipConfig : ImageConfig = 
            {
                TargetType: TextureType.Tex2D,
                MipMapLevel: 0,
                NChannels: ImageChannels.RGBA32F,
                Width: mipSize[0],
                Height: mipSize[1],
                Format: ImageChannels.RGBA,
                DataType: DataSizes.FLOAT
            }
            this.mipChain.push(new Texture2D(mipConfig));
        }
 
        this.blurFBO = new Framebuffer(this.mipChain[0], false);

        RenderCommand.BindFramebuffer(this.blurFBO.GetFBO());

        var attachments : number[] = [ ColorAttachments.COLOR_0 ];
        RenderCommand.DrawFramebuffer(attachments);

        RenderCommand.UnbindFramebuffer();
    }


    RenderDownSamples() : void 
    {        
        RenderCommand.UseShader(this.downsampleShader?.GetId());
        if(PostProcessor.sceneOutput.target) 
            RenderCommand.BindTexture(PostProcessor.sceneOutput.target.GetColorTexture().GetId(), TextureType.Tex2D);

        const EBO = this.quad.vertexArray.GetIndexBuffer();
        RenderCommand.BindBuffer(IndexBuffer.Id, BufferType.Index);

        for(let i = 0; i < this.mipChain.length; i ++) 
        { 
            const bloomMip = this.mipChain[i];
            var mipConfig = bloomMip.GetConfig();   
            
            RenderCommand.SetViewportDimensions(mipConfig.Width, mipConfig.Height);
            RenderCommand.SetFramebufferColorAttachment(bloomMip.GetId(), 0);
            
            RenderCommand.UseShader(this.downsampleShader.GetId());
            RenderCommand.SetVec2f(this.downsampleShader.GetId(), "srcResolution", glm.vec2.fromValues(mipConfig.Width, mipConfig.Height));

            switch(EBO) 
            {
                default: RenderCommand.DrawIndexed(this.quad.drawFunction.shape, EBO.GetUniqueSize() / EBO.GetUniqueIndices().BYTES_PER_ELEMENT, EBO.GetUniqueOffset()); break;
                case null: RenderCommand.Draw(this.quad.drawFunction.shape, this.quad.vertexArray.GetVertexBuffer().GetVerticesCount());
            }

            
            RenderCommand.UnBindTexture(TextureType.Tex2D);
            RenderCommand.BindTexture(bloomMip.GetId(), TextureType.Tex2D);
        }

        RenderCommand.ReleaseShader();

    }
    RenderUpSamples() : void 
    {
        RenderCommand.UseShader(this.upsampleShader.GetId());
        RenderCommand.SetFloat(this.upsampleShader.GetId(), "filterRadius", this.bloomParams.FilterRadius);

        RenderCommand.EnableAdditiveBlending(true);
        RenderCommand.SetBlendFunc(BlendFunctionTypes.ONE, BlendFunctionTypes.ONE);
        RenderCommand.SetBlendEquation(FunctionEquationTypes.FUNC_ADD);
        
        const EBO = this.quad.vertexArray.GetIndexBuffer();
        RenderCommand.BindBuffer(IndexBuffer.Id, BufferType.Index);


        for(let i = this.mipChain.length - 1; i > 0; i--) 
        {
            const bloomMip = this.mipChain[i];
            const nextBloomMip = this.mipChain[i - 1]; // Remember we're going backwards.);
            
            RenderCommand.BindTexture(bloomMip.GetId(), TextureType.Tex2D);
            RenderCommand.SetViewportDimensions(nextBloomMip.GetConfig().Width, nextBloomMip.GetConfig().Height);

            RenderCommand.SetFramebufferColorAttachment(nextBloomMip.GetId(), 0);

            switch(EBO) 
            {
                default: RenderCommand.DrawIndexed(this.quad.drawFunction.shape, EBO.GetUniqueSize() / EBO.GetUniqueIndices().BYTES_PER_ELEMENT, EBO.GetUniqueOffset()); break;
                case null: RenderCommand.Draw(this.quad.drawFunction.shape, this.quad.vertexArray.GetVertexBuffer().GetVerticesCount());
            }
        }

        RenderCommand.EnableAdditiveBlending(false);
        RenderCommand.ReleaseShader();
        RenderCommand.UnBindTexture(TextureType.Tex2D);
    }

    private blurFBO !: Framebuffer;
    private mipChain : Array<Texture2D> = Array<Texture2D>();
    private upsampleShader : Shader = new Shader(rawVert, upSamplingFrag);
    private downsampleShader : Shader = new Shader(rawVert, downSamplingFrag);
    private bloomParams : {nMipMaps : number, FilterRadius : number} = 
        { 
            nMipMaps: 1,
            FilterRadius: 0.002
        };
    private windowWidth !: number;
    private windowHeight !: number;
}

