import * as glm from "gl-matrix";
import frontendSrc from "../frontend.html?raw";
import AppStateListener, { ApplicationStates, State } from "./AppStateListener";
import { Ref } from "./Types";



interface Elements 
{
    Intro : {Header : HTMLElement, SubHeader : HTMLElement},
    NavIcon : NavIcon
    Links : HTMLElement
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
        this.elements = {
            Intro: 
            {
                Header: document.querySelector(".intro_header") as HTMLElement,
                SubHeader: document.querySelector(".intro_subheader") as HTMLElement
            },
            NavIcon: 
            {
                Container: document.querySelector(".nav_icon") as HTMLElement,
                Bar1: document.querySelector(".nav_icon_bar_1") as HTMLElement,
                Bar2: document.querySelector(".nav_icon_bar_2") as HTMLElement,
                Bar3: document.querySelector(".nav_icon_bar_3") as HTMLElement,

            },
            Links: document.querySelector(".links_container") as HTMLElement,
        };


        if(!this.elements.Intro.Header) throw new Error("Failed to get navbar icon from DOM!");
        if(!this.elements.Intro.SubHeader) throw new Error("Failed to get navbar icon from DOM!");
        if(!this.elements.NavIcon.Container) throw new Error("Failed to get navbar icon from DOM!");
        if(!this.elements.NavIcon.Bar1) throw new Error("Failed to get navbar icon from DOM!");
        if(!this.elements.NavIcon.Bar2) throw new Error("Failed to get navbar icon from DOM!");
        if(!this.elements.NavIcon.Bar3) throw new Error("Failed to get navbar icon from DOM!");


        this.projectsWindow = document.querySelector(".projects_container") as HTMLElement;
        if(!this.projectsWindow) throw new Error("Failed to get projects panel from DOM!");

        this.elements.NavIcon.Container.addEventListener("click", (e) => 
        {
            this.ToggleNavIcon();
        })

    }

    private ToggleNavIcon() : void 
    {
        if (this.GetCurrentAppState() == ApplicationStates.VIEWING_PROJECTS) {
            this.elements.NavIcon.Bar1.style.transform = `rotate(0deg) translate(0px, 0px)`;
            this.elements.NavIcon.Bar2.style.display = ``;
            this.elements.NavIcon.Bar3.style.transform = `rotate(0deg) translate(0px, 0px)`;
            this.ModifyState(ApplicationStates.HIDING_PROJECTS)
        } else {
            this.elements.NavIcon.Bar1.style.transform = `rotate(45deg) translate(3px, 3.5px)`;
            this.elements.NavIcon.Bar2.style.display = `none`;
            this.elements.NavIcon.Bar3.style.transform = `rotate(-45deg) translate(3px, -3.5px)`;
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
            let targetX = -window.innerWidth - 1500;
            let targetY = 0;
            Animator.LerpDOMElement(this.elements.Intro.Header, {x: targetX, y: targetY}, 2000);
            targetX = -window.innerWidth - 1500;
            targetY = 0;
            Animator.LerpDOMElement(this.elements.Intro.SubHeader, {x: targetX, y: targetY}, 2000);
            targetX = window.innerWidth;
            targetY = 0;
            Animator.LerpDOMElement(this.elements.Links, {x: targetX, y: targetY}, 2000);
        }
        else
        {
            // Projects Window
            this.projectsWindow.classList.remove("FadeIn");
            this.projectsWindow.classList.add("FadeOut");
            // Intro
            let targetX = -(window.innerWidth / 2) + 45;
            let targetY = 0;
            Animator.LerpDOMElement(this.elements.Intro.Header, {x: targetX, y: targetY}, 2000);
            targetX = -(window.innerWidth / 2) + 45;
            targetY = 0;
            Animator.LerpDOMElement(this.elements.Intro.SubHeader, {x: targetX, y: targetY}, 2000);
            targetX = (window.innerWidth / 2) - 400;
            targetY = 0;
            Animator.LerpDOMElement(this.elements.Links, {x: targetX, y: targetY}, 2000);
        }
    }

    canvas: HTMLCanvasElement;
    projectsWindow !: HTMLElement;
    elements !: Elements;
}



export abstract class Animator 
{
    constructor() {}

    public static LerpDOMElement(element: HTMLElement, to: { x: number, y: number }, duration: number): void 
    {
        const startTime = performance.now();
        const target = this.ConvertPosToNative(to.x, to.y);
    
        const transformedPos = {...Animator.GetElementPosition(element)};
        const rawPos = Animator.GetRawElementPosition(element);
                        
        function Animate() 
        {  
            const progress = performance.now() - startTime;
            
            if (progress <= duration) {
                const newPosX = Animator.Lerp(transformedPos.left, target.x, duration, progress);
                const newPosY = Animator.Lerp(transformedPos.top, target.y, duration, progress);
                
                console.log(rawPos);
                console.log(newPosX, newPosY);
                
                
                element.style.transform = `translate(${newPosX - rawPos.left}px, ${newPosY - transformedPos.top}px)`;  
                
                requestAnimationFrame(() => Animate());
            }
        }
        Animate();
    }

    public static LerpVec3(pos : Ref<glm.vec3>, target : glm.vec3, duration : number) : void
    {   

        const startTime = performance.now();
        const distance : {x : number, y: number, z : number} = 
        {
            x: target[0] - pos.val[0],
            y: target[1] - pos.val[1],
            z: target[2] - pos.val[2],
        }
        let startPos = {...pos};

        function Animate() : void
        {
            const progress = performance.now() - startTime;
            
            if(progress <= duration) 
            {
                pos.val[0] = Animator.Lerp(startPos.val[0], target[0], duration, progress);
                pos.val[1] = Animator.Lerp(startPos.val[1], target[1], duration, progress);
                pos.val[2] = Animator.Lerp(startPos.val[2], target[2], duration, progress);
                // console.log(pos);
                requestAnimationFrame(() => Animate());
            }
        }
        Animate();
    }

    public static LerpFloat(pos : Ref<number>, target : number, duration : number) : void
    {   

        const startTime = performance.now();
        const distance : {val : number} = 
        {
            val: target - pos.val
        }
        let startPos = {...pos};

        function Animate() : void
        {
            const progress = performance.now() - startTime;
            
            if(progress <= duration) 
            {
                pos.val = Animator.Lerp(startPos.val, target, duration, progress);
                // console.log(pos);
                requestAnimationFrame(() => Animate());
            }
        }
        Animate();
    }




    public static Lerp(startPos : number, targetPos: number, duration: number, progress: number): number 
    {
        const t = progress / (duration + 0.00001);
        const easeInEaseOut = t < 0.5 ? 0.5 * Math.pow(2 * t, 2) : -0.5 * ((2 * t - 2) * (2 * t - 2) - 2); 
        const newPos = startPos + (targetPos - startPos) * easeInEaseOut;
        return newPos;
    }

    public static GetElementPosition(element: HTMLElement): { top: number, left: number } 
    {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left
        };
    }

    public static ConvertPosToNative(posX : number, posY : number) : {x: number, y: number} 
    {
        let newPos : {x: number, y: number} = 
        {
            x: posX + (window.innerWidth / 2),
            y: posY + (window.innerHeight / 2)
        }

        return newPos;
    }

    public static GetRawElementPosition(element : HTMLElement) : { top: number, left: number} 
    {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const transform = style.transform;
    
        // If there is no transform, return the original position
        if (transform === 'none') {
            return {
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX
            };
        }
    
        // Parse transform matrix
        const matrix = new DOMMatrixReadOnly(transform);
    
        // Calculate position without transforms
        const positionWithoutTransforms = {
            top: rect.top - matrix.m42 + window.scrollY,
            left: rect.left - matrix.m41 + window.scrollX
        };
    
        return positionWithoutTransforms;
    }
};

export enum AnimateFunctions 
{
    EASE_IN_OUT = 0
};


