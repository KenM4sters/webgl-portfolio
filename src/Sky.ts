import { Mesh } from "./Mesh";
import { SkyParams } from "./Types";

export default class Sky 
{
    constructor(sphere : Mesh, params : SkyParams) 
    {
        this.sphere = sphere;
        this.params = params;
    }

    GetSphere() : Mesh { return this.sphere; }
    GetParams() : SkyParams { return this.params; }

    private sphere : Mesh;
    private params : SkyParams;
};