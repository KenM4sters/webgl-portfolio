import { Light } from "./Light";
import { Mesh } from "./Mesh";
import { SkyParams } from "./Types";

export default class Sky 
{
    constructor(sphere : Mesh, sun : Light, params : SkyParams) 
    {
        this.sphere = sphere;
        this.sun = sun;
        this.params = params;
    }

    GetSphere() : Mesh { return this.sphere; }
    GetSun() : Light { return this.sun; }
    GetParams() : SkyParams { return this.params; }

    private sphere : Mesh;
    private sun : Light;
    private params : SkyParams;
};