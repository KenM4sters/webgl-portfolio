export default class Resources 
{
    constructor() 
    {
    }

    public LoadAllResources(callback: () => void) : void 
    {
        for(const r of sources) 
        {
            const IMG = new Image();
            IMG.src = r.path;  
                     
            IMG.addEventListener("load", () => {
                Resources.textures.set(r.name, IMG);
                this.UpdateStatus(callback);
            })
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

    public static GetTexture(name : string) : HTMLImageElement | undefined { return this.textures.get(name); }

    private static textures : Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();
    private static status : number = 0;
}

export const sources : {name: string, path: string}[] = 
[
    {
        name: "brotherhood",
        path: "/Textures/brotherhood.jpg"
    },
]