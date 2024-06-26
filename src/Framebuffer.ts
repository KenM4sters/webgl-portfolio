import { RenderCommand } from "./RenderCommand";
import { CubeTexture, Texture2D} from "./Texture";
import { ImageConfig, Ref } from "./Types";


/**
 * The Framebuffer class handles the generation of a new framebuffers and renderbuffers and stores
 * there Id's to be accessed by the render layers. It also handles the creation of a texture and binds
 * it as the color attachment for the Framebuffer object. This can also be retrieved.
 *  
 */
export default class Framebuffer 
{
    constructor(config : ImageConfig | Texture2D, genRenderBuffer : boolean = false) {
        if(config instanceof Texture2D) this.colorTexture = config;
        else this.colorTexture = new Texture2D(config);
        
        this.Init(genRenderBuffer);
    }

    private FBO !: Ref<WebGLFramebuffer>;
    private RBO !: Ref<WebGLRenderbuffer | null>;
    private colorTexture : Texture2D;

    // Getters
    public GetFBO() : Ref<WebGLFramebuffer> { return this.FBO; }
    public GetRBO() : Ref<WebGLRenderbuffer | null> { return this.RBO; }
    public GetColorTexture() : Texture2D { return this.colorTexture; }
    public SetColorTexture(tex : Texture2D) : void { 
        RenderCommand.BindFramebuffer(this.FBO);
        RenderCommand.SetFramebufferColorAttachment(tex.GetId()); 
        RenderCommand.UnbindFramebuffer(); 
    }

    Init(genRenderBuffer : boolean) 
    {
        // Create a new framebuffer with an empty texture to insert data into.
        this.FBO = {val: RenderCommand.CreateFramebuffer()};
        RenderCommand.BindFramebuffer(this.FBO);
        RenderCommand.SetFramebufferColorAttachment(this.colorTexture.GetId());

        // We may also need a render buffer to store depth information that tells WebGL
        // which pixels to clip when one is infront of the other, otherwise nothing will look 3D.
        if(genRenderBuffer) 
        {
            this.RBO = {val: RenderCommand.CreateRenderbuffer()};
            RenderCommand.BindRenderbuffer(this.RBO);
            RenderCommand.SetRenderbufferDepthAttachment(this.RBO, this.FBO, this.colorTexture.GetConfig());
        }

        // Cleanup.
        RenderCommand.UnbindFramebuffer();
        if(genRenderBuffer) RenderCommand.UnbindRenderbuffer();
    }

    Resize(w : number, h : number) : void 
    {
        this.colorTexture.Resize(w, h);
        RenderCommand.BindFramebuffer(this.FBO);
        RenderCommand.SetFramebufferColorAttachment(this.colorTexture.GetId());

        if(this.RBO.val != null) 
        {
            RenderCommand.BindRenderbuffer(this.RBO);
            RenderCommand.SetRenderbufferDepthAttachment(this.RBO, this.FBO, this.colorTexture.GetConfig());
        }
    }
};

export class FramebufferCubeMap 
{
    constructor(config : ImageConfig | CubeTexture, genRenderBuffer : boolean = false) {
        if(config instanceof CubeTexture) this.colorTexture = config;
        else this.colorTexture = new CubeTexture(config);
        
        this.Init(genRenderBuffer);
    }

    private FBO !: Ref<WebGLFramebuffer>;
    private RBO !: Ref<WebGLRenderbuffer | null>;
    private colorTexture : CubeTexture;

    // Getters
    public GetFBO() : Ref<WebGLFramebuffer> { return this.FBO; }
    public GetRBO() : Ref<WebGLRenderbuffer | null> { return this.RBO; }
    public GetColorTexture() : CubeTexture { return this.colorTexture; }
    public SetColorTexture(cubeFace : number) : void { 
        RenderCommand.SetFramebufferCubeMapColorAttachment(this.colorTexture.GetId(), cubeFace, 0);
    }

    Init(genRenderBuffer : boolean) 
    {
        // Create a new framebuffer with an empty texture to insert data into.
        this.FBO = {val: RenderCommand.CreateFramebuffer()};
        RenderCommand.BindFramebuffer(this.FBO);

        // We may also need a render buffer to store depth information that tells WebGL
        // which pixels to clip when one is infront of the other, otherwise nothing will look 3D.
        if(genRenderBuffer) 
        {
            this.RBO = {val: RenderCommand.CreateRenderbuffer()};
            RenderCommand.BindRenderbuffer(this.RBO);
            RenderCommand.SetRenderbufferDepthAttachment(this.RBO, this.FBO, this.colorTexture.GetConfig());
        }

        // Cleanup.
        RenderCommand.UnbindFramebuffer();
        if(genRenderBuffer) RenderCommand.UnbindRenderbuffer();
    }

    Resize(w : number, h : number) : void 
    {
        this.colorTexture.Resize(w, h);
        RenderCommand.BindFramebuffer(this.FBO);
        RenderCommand.SetFramebufferColorAttachment(this.colorTexture.GetId());

        if(this.RBO.val != null) 
        {
            RenderCommand.BindRenderbuffer(this.RBO);
            RenderCommand.SetRenderbufferDepthAttachment(this.RBO, this.FBO, this.colorTexture.GetConfig());
        }
    }
};
