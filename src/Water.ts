import * as glm from "gl-matrix";
import { DataSizes, GeometryDrawFunctionTypes, ImageChannels, ImageConfig, TextureType, WaterParams } from "./Types";
import { Shader } from "./Shader";
import { PhysicalMaterial } from "./Material";
import { Mesh } from "./Mesh";
import { PlaneGeometry } from "./Geometry";
import { Texture2D } from "./Texture";
import Framebuffer from "./Framebuffer";

// Water shaders
import vertSrc from "./Shaders/Water.vert?raw";
import fragSrc from "./Shaders/Water.frag?raw";
import { BufferType, RenderCommand } from "./RenderCommand";
import PerspectiveCamera from "./Camera/PerspectiveCamera";
import { Texture } from "three";

export default class Water 
{
    constructor(plane : PlaneGeometry, camera : PerspectiveCamera, params : WaterParams, viewportWidth : number, viewportHeight : number) 
    {
        const shader = new Shader(vertSrc, fragSrc);
        const mat = new PhysicalMaterial(shader);
        this.mesh = new Mesh(plane, mat);
        this.camera = camera;

        const imageConfig : ImageConfig = 
        {
            TargetType: TextureType.Tex2D,
            MipMapLevel: 0,
            NChannels: ImageChannels.RGBA32F,
            Width: viewportWidth,
            Height: viewportHeight,
            Format: ImageChannels.RGBA,
            DataType: DataSizes.FLOAT
        };
        this.reflectionTex = new Texture2D(imageConfig);
        this.framebuffer = new Framebuffer(this.reflectionTex, true);
        this.clippingPlanes.push(glm.vec4.fromValues(0, 1, 0, this.mesh.transforms.Translation[1]));
    }

    public OnRender() : void 
    {

        // Capture the scene from the perspective of the camera at it's current position, and once
        // again from its position reflected around the water gemetry.
        


        this.camera.position = glm.vec3.subtract(this.camera.position, this.camera.position, this.mesh.transforms.Translation);
        this.camera.position = glm.vec3.subtract(this.camera.position, this.mesh.transforms.Translation, this.camera.position);


        // Draw Mesh
        // ----------------------------------------------------------------
        var VAO = this.mesh.GetGeometry().vertexArray;
        var EBO = VAO.GetIndexBuffer();
        var shader = this.mesh.GetMaterial().GetShader();
        // Bind the vertex array object and shader program.
        RenderCommand.BindVertexArray(VAO.GetId());
        RenderCommand.UseShader(shader.GetId());
        // Make the correct draw call.
        switch(this.mesh.GetGeometry().drawFunction.type) 
        {
            case GeometryDrawFunctionTypes.DRAW_ARRAYS: RenderCommand.Draw(this.mesh.GetGeometry().drawFunction.shape, VAO.GetVertexBuffer().GetVerticesCount()); break;
            case GeometryDrawFunctionTypes.DRAW_ARRAYS_INDEXED: if(EBO) RenderCommand.DrawIndexed(this.mesh.GetGeometry().drawFunction.shape, EBO.GetUniqueSize() / EBO.GetUniqueIndices().BYTES_PER_ELEMENT , EBO.GetUniqueOffset()); break; 
        };
        // Cleanup.
        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Index);
        RenderCommand.ReleaseShader();
        // ----------------------------------------------------------------
    }

    public GetMesh() : Mesh { return this.mesh; }
    public GetReflectionTex() : Texture2D { return this.reflectionTex; }
    public GetRefractionTex() : Texture2D { return this.refractionTex; }
    public GetFramebuffer() : Framebuffer { return this.framebuffer; }

    private mesh : Mesh;
    private reflectionTex !: Texture2D;
    private refractionTex !: Texture2D;
    private camera : PerspectiveCamera;
    private framebuffer !: Framebuffer;
    private clippingPlanes : glm.vec4[] = [];
};