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
        const navIcon = document.querySelector(".nav_icon") as HTMLElement;
        if(!navIcon) throw new Error("Failed to get navbar icon from DOM!")
        const projectsPanel = document.querySelector(".projects_wrapper") as HTMLElement;
        if(!projectsPanel) throw new Error("Failed to get projects panel from DOM!")
        projectsPanel.style.transform = `translate(500px, 0px)`;


        var show : {val: boolean} = {val: false};
        navIcon?.addEventListener("click", (e) => 
        {
            this.ToggleNavIcon(navIcon, show);
            this.ToggleNavBar(projectsPanel, show.val);
        })

    }

    private ToggleNavIcon(navIcon : HTMLElement ,show : {val : boolean}) : void 
    {
        var navIconContainer = document.querySelector(".nav_icon_container");
        if(!navIconContainer) throw new Error("Failed to get navIconContainer!");

        if(show.val) 
        {
            navIcon.classList.replace("fa-xmark", "fa-bars");
            show.val = false; 
        } 
        else 
        {
            navIcon.classList.replace("fa-bars", "fa-xmark");            
            show.val = true;
        } 
    }

    private ToggleNavBar(projectsPanel : HTMLElement, show : boolean) : void 
    {
        const translateX = 500;

        if(show)
            projectsPanel.style.transform = `translate(0px, 0px)`;
        else
            projectsPanel.style.transform = `translate(${translateX}px, 0px)`;

    }
    canvas: HTMLCanvasElement;
}




export class Animator 
{
    constructor() 
    {

    }

    private LerpDOMElement(from : number, to : number) : void {}
};

export enum AnimateFunctions 
{
    EASE_IN_OUT = 0
};