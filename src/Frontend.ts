import frontendSrc from "../frontend.html?raw"

interface Elements 
{
    Intro : {Header : HTMLElement, SubHeader : HTMLElement},
    NavIcon : NavIcon
};

interface NavIcon 
{
    Container : HTMLElement;
    Bar1 : HTMLElement;
    Bar2 : HTMLElement;
    Bar3 : HTMLElement;
};

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
        const introHeader = document.querySelector(".intro_header") as HTMLElement;
        if(!introHeader) throw new Error("Failed to get navbar icon from DOM!");

        const introSubHeader = document.querySelector(".intro_subheader") as HTMLElement;
        if(!introSubHeader) throw new Error("Failed to get navbar icon from DOM!");

        const navIcon = document.querySelector(".nav_icon") as HTMLElement;
        if(!navIcon) throw new Error("Failed to get navbar icon from DOM!");
        

        const navBar1 = document.querySelector(".nav_icon_bar_1") as HTMLElement;
        if(!navBar1) throw new Error("Failed to get navbar icon from DOM!");
        
        const navBar2 = document.querySelector(".nav_icon_bar_2") as HTMLElement;
        if(!navBar2) throw new Error("Failed to get navbar icon from DOM!");
        
        const navBar3 = document.querySelector(".nav_icon_bar_3") as HTMLElement;
        if(!navBar3) throw new Error("Failed to get navbar icon from DOM!");

        const icon : NavIcon = 
        {
            Container: navIcon,
            Bar1: navBar1,
            Bar2: navBar2,
            Bar3: navBar3,
        }

        const projectsPanel = document.querySelector(".projects_wrapper") as HTMLElement;
        if(!projectsPanel) throw new Error("Failed to get projects panel from DOM!");
        projectsPanel.style.transform = `translate(500px, 0px)`;


        var show : {val: boolean} = {val: true};
        navIcon?.addEventListener("click", (e) => 
        {
            this.ToggleNavIcon(icon, show);
            this.ToggleNavBar(projectsPanel, show.val);
        })

    }

    private ToggleNavIcon(icon : NavIcon, show : {val : boolean}) : void 
    {
        if (show.val) {
            icon.Bar1.style.transform = `rotate(45deg) translate(3px, 3.5px)`;
            icon.Bar2.style.display = `none`;
            icon.Bar3.style.transform = `rotate(-45deg) translate(3px, -3.5px)`;
            show.val = false;
        } else {
            icon.Bar1.style.transform = `rotate(0deg) translate(0px, 0px)`;
            icon.Bar2.style.display = ``;
            icon.Bar3.style.transform = `rotate(0deg) translate(0px, 0px)`;
            show.val = true;
        }
    }

    private ToggleNavBar(projectsPanel : HTMLElement, show : boolean) : void 
    {
        const translateX = 500;

        if(show)
            projectsPanel.style.transform = `translate(${translateX}px, 0px)`;
        else
            projectsPanel.style.transform = `translate(0px, 0px)`;

    }
    canvas: HTMLCanvasElement;
}




export class Animator 
{
    constructor() 
    {

    }

    private LerpDOMElement(from : number, to : number) : void 
    {
        
    }
};

export enum AnimateFunctions 
{
    EASE_IN_OUT = 0
};