
export class RenderPass
{
    constructor() {}

    Init() {}
    Render() {}
    Resize(w : number, h : number) {}
};


export class PostProcessor
{
    constructor() 
    {

    }
    
    Init() : void 
    {
        for(const pass of this.passess) 
        {
            pass.Init();
        }
    }

    Render() : void 
    {
        for(const pass of this.passess) 
        {
            pass.Render();
        }
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
};