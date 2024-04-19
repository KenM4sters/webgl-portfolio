import Component from "./Components";

export enum ComponentTypes 
{
    Transform = "Transform",
    Geometry = "Geometry",
    Material = "Material",
    Light = "Light",
    Camera = "Camera",
};


export class AssetsWizard 
{
    constructor() 
    {
        
    }

    GetCompByIndex(compType : ComponentTypes, index : number) : Component 
    {
        const arr = this.compRegistry.get(compType)
        if(!arr) throw new Error("Attempting to find a component in an array that hasn't been defined!");
        return arr[index];
    }

    compRegistry : Map<string, Array<Component>> = new Map<string, Array<Component>>();
};