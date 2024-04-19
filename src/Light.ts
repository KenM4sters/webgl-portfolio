import * as glm from "gl-matrix";
import { Transforms, SetInitialTransforms } from "./Mesh";

export abstract class Light 
{
    constructor(color : glm.vec3, intensity: number)  
    {
        this.color = color;
        this.intensity = intensity;
    }

    public color : glm.vec3;
    public intensity : number;
    public transforms : Transforms = SetInitialTransforms();
}

// Point Light is the simpliest light and is identical to the base class, "Light", but I've abstracted
// it anyway in case it changes in the future.
export class PointLight extends Light 
{
    constructor(color : glm.vec3, intensity: number) 
    {
        super(color, intensity);
    }
}
