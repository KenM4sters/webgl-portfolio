import frontendSrc from "../frontend.html?raw"

export default class Frontend 
{
    constructor(canvas : HTMLCanvasElement) 
    {
        this.canvas = canvas;
    }

    public Init() : void 
    {
        this.canvas.style.backgroundColor = "rgba(5, 100, 100, 255)";

        const landing = document.querySelector(".landing");
        if(!landing) throw new Error("Failed to get landing from DOM | body");

        landing.innerHTML = frontendSrc;
        this.RenderNavIcon();

    }

    private RenderNavIcon() : void 
    {
        const navIcon = document.querySelector(".nav_icon");
        var showBars : boolean = true;
        navIcon?.addEventListener("click", (e) => 
        {
            this.ToggleNavIcon(showBars);
            if(showBars) showBars = false; else showBars = true;
        })

    }

    private ToggleNavIcon(showBars : boolean) : void 
    {
        var navIconContainer = document.querySelector(".nav_icon_container");
        if(!navIconContainer) throw new Error("Failed to get navIconContainer!");

        this.ToggleNavBar(showBars);
        // if(showBars) navIconContainer.innerHTML = `<i class="nav_icon fa-solid fa-bars fa-2xl" style="color: #0091ff;"></i>`;
        // else navIconContainer.innerHTML = `<i class="nav_icon fa-solid fa-xmark fa-2xl" style="color: #74C0FC;"></>`;   
    }
    private ToggleNavBar(show : boolean) : void 
    {
        
    }

    canvas: HTMLCanvasElement;
}