import * as glm from "gl-matrix";
import { Geometry } from "./Geometry";
import { Material } from "./Material";

export interface Transforms 
{
    Translation : glm.vec3;
    Scale : glm.vec3;
    Rotation : glm.quat;
    ModelMatrix : glm.mat4;
}

export function SetInitialTransforms() : Transforms
{
    return {        
        Translation: [0.0, 0.0, 0.0],
        Scale: [1.0, 1.0, 1.0],
        Rotation: [0.0, 0.0, 0.0, 0.0],
        ModelMatrix: glm.mat4.create()
    };
}

export class Mesh 
{
    constructor(geo : Geometry, mat : Material) 
    {
        this.geometry = geo;
        this.material = mat; 
    }

    // Getters
    GetGeometry() : Geometry { return this.geometry; }
    GetMaterial() : Material { return this.material; }

    private material : Material;
    private geometry : Geometry;
    public transforms : Transforms = SetInitialTransforms();
 
};