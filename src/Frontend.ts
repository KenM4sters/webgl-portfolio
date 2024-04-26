import frontendSrc from "../frontend.html?raw";
import AppStateListener, { ApplicationStates, State } from "./AppStateListener";



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

export default class Frontend extends AppStateListener 
{
    constructor(canvas : HTMLCanvasElement) 
    {
        super();
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
        this.intro = {
            Heading: document.querySelector(".intro_header") as HTMLElement,
            SubHeading: document.querySelector(".intro_subheader") as HTMLElement
        };


        if(!this.intro.Heading) throw new Error("Failed to get navbar icon from DOM!");
        if(!this.intro.SubHeading) throw new Error("Failed to get navbar icon from DOM!");

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

        this.projectsWindow = document.querySelector(".projects_container") as HTMLElement;
        if(!this.projectsWindow) throw new Error("Failed to get projects panel from DOM!");

        navIcon?.addEventListener("click", (e) => 
        {
            this.ToggleNavIcon(icon);
        })

    }

    private ToggleNavIcon(icon : NavIcon) : void 
    {
        if (this.GetCurrentAppState() == ApplicationStates.VIEWING_PROJECTS) {
            icon.Bar1.style.transform = `rotate(0deg) translate(0px, 0px)`;
            icon.Bar2.style.display = ``;
            icon.Bar3.style.transform = `rotate(0deg) translate(0px, 0px)`;
            this.ModifyState(ApplicationStates.HIDING_PROJECTS)
        } else {
            icon.Bar1.style.transform = `rotate(45deg) translate(3px, 3.5px)`;
            icon.Bar2.style.display = `none`;
            icon.Bar3.style.transform = `rotate(-45deg) translate(3px, -3.5px)`;
            this.ModifyState(ApplicationStates.VIEWING_PROJECTS);
        }
    }

    protected HandleChangeInState(newState : ApplicationStates): void 
    {
        if(newState == ApplicationStates.VIEWING_PROJECTS) 
        {
            // Projects Window
            this.projectsWindow.classList.remove("FadeOut");
            this.projectsWindow.classList.add("FadeIn");
            // Intro
            // this.intro.Heading.classList.remove("FadeIn");
            // this.intro.Heading.classList.add("FadeOut");
            // this.intro.SubHeading.classList.remove("FadeIn");
            // this.intro.SubHeading.classList.add("FadeOut");
            Animator.LerpDOMElement(this.intro.Heading, {x: 0, y: 0}, 2000, performance.now());
        }
        else
        {
            // Projects Window
            this.projectsWindow.classList.remove("FadeIn");
            this.projectsWindow.classList.add("FadeOut");
            // Intro
            // this.intro.Heading.classList.remove("FadeOut");
            // this.intro.Heading.classList.add("FadeIn");
            // this.intro.SubHeading.classList.remove("FadeOut");
            // this.intro.SubHeading.classList.add("FadeIn");
        }

    }

    canvas: HTMLCanvasElement;
    projectsWindow !: HTMLElement;
    intro !: {Heading: HTMLElement, SubHeading: HTMLElement};
}



export abstract class Animator 
{
    constructor() {}

    public static LerpDOMElement(element: HTMLElement, to: { x: number, y: number }, duration: number, startTime: number): void {
        const startPos = Animator.GetElementPosition(element);
        console.log(startPos);
        
        const currentTime = performance.now() - startTime;
    
        if (currentTime <= duration) {
            const newPosLeft = Animator.Lerp(startPos.left, to.x, duration, currentTime);
            const newPosTop = Animator.Lerp(startPos.top, to.y, duration, currentTime);
    
            element.style.transform = `translate(${newPosLeft}px, ${newPosTop}px)`;
            requestAnimationFrame(() => Animator.LerpDOMElement(element, to, duration, startTime));
        }
    }

    public static Lerp(start: number, target: number, duration: number, currentTime: number): number {
        const t = currentTime / duration;
        const easeInEaseOutT = t < 0.5 ? 0.5 * Math.pow(2 * t, 2) : -0.5 * ((2 * t - 2) * (2 * t - 2) - 2);
        return start + (target - start) * easeInEaseOutT;
    }

    public static GetElementPosition(element: HTMLElement): { top: number, left: number } {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left
        };
    }
};

export enum AnimateFunctions 
{
    EASE_IN_OUT = 0
};


