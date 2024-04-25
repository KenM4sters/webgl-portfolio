import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { TextureImageData } from 'three/src/textures/types.js';

export default class Resources 
{
    constructor() 
    {
    }

    public LoadAllResources(callback: () => void) : void 
    {
        const loader = new RGBELoader();
        for(const r of sources) 
        {
            if(r.type == "LDR") 
            {
                const IMG = new Image();
                IMG.src = r.path;  
                            
                IMG.addEventListener("load", () => {
                    Resources.textures.set(r.name, IMG);
                    this.UpdateStatus(callback);
                })
            } else if(r.type == "HDR") 
            {   
                loader.load(r.path, (tex) => 
                {
                    Resources.textures.set(r.name, tex.image);
                    this.UpdateStatus(callback);
                })
            }
        }
    }

    private UpdateStatus(callback: () => void) : void 
    {
        Resources.status += 1;
        if(Resources.status = sources.length) 
        {
            callback();
        }
    }

    public static GetTexture(name : string) : HTMLImageElement | TextureImageData | undefined { return this.textures.get(name); }

    private static textures : Map<string, HTMLImageElement | TextureImageData> = new Map<string, HTMLImageElement | TextureImageData>();
    private static status : number = 0;
}

export const sources : {name: string, type: string, path: string}[] = 
[
    {
        name: "waterNormal",
        type: "LDR",
        path: "/Textures/waterNormals.jpg"
    },
]