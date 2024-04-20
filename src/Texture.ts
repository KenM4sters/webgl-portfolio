import { ImageConfig, Ref, TextureType } from "./Types.ts";
import { RenderCommand } from "./RenderCommand";


// Abstract Texture class to serve as a base for other classes such as the Texture2D and CubeTexture
// classes.
abstract class Texture 
{
    constructor(config : ImageConfig) 
    {
        this.config = config;
        this.Id = {val: RenderCommand.CreateTexture()};
        this.data = {val: new Float32Array(config.Width*config.Height*4)}
        this.Init();
    }

    abstract Init() : void;
    abstract LoadImage(filepath : string) : void;
    abstract Resize(w : number, h : number) : void;
    
    // Getters
    public GetId() : Ref<WebGLTexture> { return this.Id; }
    public GetConfig() : ImageConfig { return this.config; }
    public GetData() : Ref<Float32Array | HTMLImageElement> { return this.data; }
    
    // Setters
    SetData(texData : Ref<Float32Array | HTMLImageElement>) : void { this.data = texData; this.Init();}
    
    protected Id : Ref<WebGLTexture>;
    protected config : ImageConfig;
    protected data : Ref<Float32Array | HTMLImageElement>;
};



// Main texture class that stores data generated either by the user manually or from an Image
// that can be loaded via the LoadImage() method.
export class Texture2D extends Texture 
{
    constructor(config : ImageConfig) 
    {
        super(config);
    }

    override Init() : void 
    {
        RenderCommand.BindTexture(this.Id, TextureType.Tex2D, 0);
        RenderCommand.SetTexture2DArray(this.config, this.data as Ref<Float32Array>);
    }

    // Loads an Image object from a given filepath and sets the member data variable to the image object.
    override LoadImage(filepath : string) : void 
    {
        var image = new Image();
        image.src = filepath;
        image.addEventListener("load", () => {
            RenderCommand.BindTexture(this.Id, TextureType.Tex2D, 0);
            RenderCommand.SetTexture2DImage(this.config, image);
            RenderCommand.GenerateMipMap(TextureType.Tex2D);
            RenderCommand.UnBindTexture(TextureType.Tex2D, 0);

            this.data.val = image;
            this.config.Width = image.width;
            this.config.Height = image.height;
        })
    }

    override Resize(w : number, h : number): void {
        RenderCommand.DeleteTexture2D(this.Id);
        this.config.Width = w;
        this.config.Height = h;
        this.Init();
    }
};
