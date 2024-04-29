import * as glm from "gl-matrix"
import { CustomGeometry } from "./Geometry";
import { PhysicalMaterial } from "./Material";
import { Mesh } from "./Mesh";


import vertSrc from "./Shaders/KenMasters.vert?raw";
import fragSrc from "./Shaders/KenMasters.frag?raw";
import { Shader } from "./Shader";
import { RenderCommand } from "./RenderCommand";
import { Animator } from "./Frontend";
import { Ref, TextureType } from "./Types";
import { Texture2D } from "./Texture";
import Resources from "./Resources";
import { CURSOR_VERTICES } from "./Primitives";

export default class Cursor 
{
    constructor() 
    {
        const geo = new CustomGeometry(CURSOR_VERTICES);
        const mat = new PhysicalMaterial(new Shader(vertSrc, fragSrc));
        mat.isUsingTextures.val = true;
        const spriteSheetImage = Resources.GetTexture("kenSpriteSheet");
        if(spriteSheetImage) mat.Albedo.val = new Texture2D(spriteSheetImage);
        else console.warn('Failed to get sprite sheet texture form resources!');
        
        this.mesh = new Mesh(geo, mat);
        this.mesh.transforms.Scale = glm.vec3.fromValues(0.04, 0.12, 1.0);
        this.mesh.transforms.Rotation = glm.quat.fromEuler(this.mesh.transforms.Rotation, 180, 180, 0); // Rotate 45 degrees around the Y-axis
        // Apply the rotation quaternion to the model transformation matrix

        Cursor.transformObj = 
        {
            val: this.mesh.transforms.Translation
        }
    }

    Render() 
    {
        const mat = this.mesh.GetMaterial();
        this.mesh.transforms.ModelMatrix =  glm.mat4.create();
        this.mesh.transforms.ModelMatrix =  glm.mat4.fromQuat(this.mesh.transforms.ModelMatrix, this.mesh.transforms.Rotation);
        this.mesh.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), this.mesh.transforms.ModelMatrix, this.mesh.transforms.Translation);
        this.mesh.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), this.mesh.transforms.ModelMatrix, this.mesh.transforms.Scale);

        RenderCommand.UseShader(mat.GetShader().GetId());
        if(mat instanceof PhysicalMaterial && mat.Albedo.val instanceof Texture2D && mat.isUsingTextures.val) 
        {
            RenderCommand.BindTexture(mat.Albedo.val.GetId(), TextureType.Tex2D);
            RenderCommand.SetInt(mat.GetShader().GetId(), "spriteSheet", 0);
        }
        RenderCommand.SetMat4f(mat.GetShader().GetId(), "model", this.mesh.transforms.ModelMatrix);
        RenderCommand.DrawMesh(this.mesh);
        RenderCommand.ReleaseShader();
        RenderCommand.UnBindTexture(TextureType.Tex2D, 0);
    }

    OnMouseMove(pos : {x : number, y : number}) 
    {
        let modifiedPos = Animator.ConvertPosToWebGL(pos.x, pos.y);
        if(Cursor.transformObj) Animator.LerpVec3(Cursor.transformObj, glm.vec3.fromValues(-modifiedPos.x - 0.03, -modifiedPos.y - 0.02, 0.0), 1000)
    } 

    private mesh : Mesh;
    // private texCoordsBuffer !: {buffer : Ref<WebGLBuffer>, data : Float32Array};
    // private VAO !: Ref<WebGLVertexArrayObject>;
    public static transformObj : Ref<glm.vec3>;
};