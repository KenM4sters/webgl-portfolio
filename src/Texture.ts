import { ImageConfig, Ref, TextureType } from "./Types.ts";
import { RenderCommand } from "./RenderCommand";
import { TextureImageData } from "three/src/textures/types.js";

// Abstract Texture class to serve as a base for other classes such as the Texture2D and CubeTexture
// classes.
abstract class Texture 
{
    constructor(config : ImageConfig | HTMLImageElement | TextureImageData) 
    {
        this.Id = {val: RenderCommand.CreateTexture()};
        if('TargetType' in config) 
        {
            this.config = config;
            this.data = {val: new Float32Array(config.Width*config.Height*4)}
            this.Init();
        } else 
        {
            this.SetImage(config);
        } 
    }

    abstract Init() : void;
    abstract SetImage(filepath : HTMLImageElement | TextureImageData) : void;
    abstract Resize(w : number, h : number) : void;
    
    // Getters
    public GetId() : Ref<WebGLTexture> { return this.Id; }
    public GetConfig() : ImageConfig { return this.config; }
    public GetData() : Ref<Float32Array | HTMLImageElement> { return this.data; }
    
    // Setters
    SetData(texData : Ref<Float32Array | HTMLImageElement>) : void { this.data = texData; this.Init();}
    
    protected Id : Ref<WebGLTexture>;
    protected config !: ImageConfig;
    protected data !: Ref<Float32Array | HTMLImageElement>;
};



// Main texture class that stores data generated either by the user manually or from an Image
// that can be loaded via the LoadImage() method.
export class Texture2D extends Texture 
{
    constructor(config : ImageConfig | HTMLImageElement | TextureImageData) 
    {
        super(config);
    }

    override Init() : void 
    {
        RenderCommand.BindTexture(this.Id, TextureType.Tex2D, 0);
        RenderCommand.SetTexture2DArray(this.config, this.data as Ref<Float32Array>);
    }

    // Loads an Image object from a given filepath and sets the member data variable to the image object.
    override SetImage(img : HTMLImageElement | TextureImageData) : void 
    {
        RenderCommand.BindTexture(this.Id, TextureType.Tex2D, 0);
        if(img instanceof HTMLImageElement) RenderCommand.SetTexture2DImage(img);
        else RenderCommand.SetTexture2DImageHDR(img);
        RenderCommand.UnBindTexture(TextureType.Tex2D, 0);
    }

    override Resize(w : number, h : number): void {
        RenderCommand.DeleteTexture2D(this.Id);
        this.config.Width = w;
        this.config.Height = h;
        this.Init();
    }
};


export class CubeTexture extends Texture 
{
    constructor(config : ImageConfig | HTMLImageElement) 
    {
        super(config);  
    }

    override Init() : void 
    {
        RenderCommand.BindTexture(this.Id, TextureType.CubeTex, 0);
        RenderCommand.SetTextureCubeMapArray(this.config, this.data as Ref<Float32Array>);
    }

    // Loads an Image object from a given filepath and sets the member data variable to the image object.
    override SetImage(img : HTMLImageElement) : void 
    {
        RenderCommand.BindTexture(this.Id, TextureType.Tex2D, 0);
        RenderCommand.SetTextureCubeMapImage(this.config, img);
        RenderCommand.GenerateMipMap(TextureType.Tex2D);
        RenderCommand.UnBindTexture(TextureType.Tex2D, 0);

        this.data.val = img;
        this.config.Width = img.width;
        this.config.Height = img.height;
    }

    override Resize(w : number, h : number): void {
        RenderCommand.DeleteTexture2D(this.Id);
        this.config.Width = w;
        this.config.Height = h;
        this.Init();
    }
};
