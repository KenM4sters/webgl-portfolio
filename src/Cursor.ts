import * as glm from "gl-matrix"
import { SquareGeometry } from "./Geometry";
import { PhysicalMaterial } from "./Material";
import { Mesh } from "./Mesh";


import vertSrc from "./Shaders/KenMasters.vert?raw";
import fragSrc from "./Shaders/KenMasters.frag?raw";
import { Shader } from "./Shader";
import { RenderCommand } from "./RenderCommand";
import { Animator } from "./Frontend";
import { Ref } from "./Types";

export default class Cursor 
{
    constructor() 
    {
        const geo = new SquareGeometry();
        const mat = new PhysicalMaterial(new Shader(vertSrc, fragSrc));
        this.mesh = new Mesh(geo, mat);
        this.mesh.transforms.Scale = glm.vec3.fromValues(0.03, 0.06, 1.0);
        this.transformObj = 
        {
            val: this.mesh.transforms.Translation
        }
    }

    Render() 
    {
        const mat = this.mesh.GetMaterial();
        this.mesh.transforms.ModelMatrix = glm.mat4.create();
        this.mesh.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), this.mesh.transforms.ModelMatrix, this.mesh.transforms.Scale);
        this.mesh.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), this.mesh.transforms.ModelMatrix, this.mesh.transforms.Translation);
        RenderCommand.UseShader(mat.GetShader().GetId());
        RenderCommand.SetMat4f(mat.GetShader().GetId(), "model", this.mesh.transforms.ModelMatrix);
        RenderCommand.DrawMesh(this.mesh);
        RenderCommand.ReleaseShader();
    }

    OnMouseMove(posX : number, posY : number) 
    {
        // Animator.LerpVec3(this.transformObj, glm.vec3.fromValues(posX, posY, 0.0), 3000)
        // console.log(posX, posY);
        
    } 

    private mesh : Mesh;
    private transformObj !: Ref<glm.vec3>;
};