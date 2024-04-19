import { ComponentTypes } from "./ECS";

export default class Entity 
{
    constructor() {}
    
    AddComponent(comp : ComponentTypes, Id : number) : void 
    {
        this.components.set(comp, Id);
    }

    Traverse() : void 
    {
        this.components.forEach((comp) => {console.log(comp);})
    }
    
    components : Map<ComponentTypes, number> = new Map<ComponentTypes, number>();
}