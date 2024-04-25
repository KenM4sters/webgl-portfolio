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
import Scene from "./Scene";
import Resources from "./Resources";


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
        this.refractionTex = new Texture2D(imageConfig);
        this.framebuffer = new Framebuffer(this.reflectionTex, true);

        const normalImage = Resources.GetTexture("waterNormal");
        if(!normalImage) throw new Error("Resource | Failed to get waterNormal texture!");
        this.normalMap = new Texture2D(normalImage);


        this.clippingPlanes.push(glm.vec4.fromValues(0, 1, 0, this.mesh.transforms.Translation[1]));
    }

    public OnRender(scene : Scene) : void 
    {
        RenderCommand.UnbindFramebuffer();
        RenderCommand.UnbindRenderbuffer()
        RenderCommand.BindFramebuffer(this.framebuffer.GetFBO());
        RenderCommand.BindRenderbuffer(this.framebuffer.GetRBO());
        scene.SceneRender();
        RenderCommand.UnbindFramebuffer();
        RenderCommand.UnbindRenderbuffer();

        // Capture the scene from the perspective of the camera at it's current position, and once
        // again from its position reflected around the water gemetry.
        const originalPos = {...this.camera.position};
        this.camera.position = glm.vec3.subtract(this.camera.position, this.camera.position, this.mesh.transforms.Translation);
        this.camera.position = glm.vec3.subtract(this.camera.position, this.mesh.transforms.Translation, this.camera.position);

        RenderCommand.UnbindFramebuffer();
        RenderCommand.UnbindRenderbuffer()
        RenderCommand.BindFramebuffer(this.framebuffer.GetFBO());
        RenderCommand.BindRenderbuffer(this.framebuffer.GetRBO());
        this.framebuffer.SetColorTexture(this.refractionTex);
        scene.SceneRender();
        RenderCommand.UnbindFramebuffer();
        RenderCommand.UnbindRenderbuffer();

        if(scene.output.target) 
        {
            RenderCommand.BindFramebuffer(scene.output.target.GetFBO());
            RenderCommand.BindRenderbuffer(scene.output.target.GetRBO());
        }

        this.camera.position = originalPos;
        scene.SceneRender();
        // Draw Mesh
        // ----------------------------------------------------------------
        var VAO = this.mesh.GetGeometry().vertexArray;
        var EBO = VAO.GetIndexBuffer();
        var shader = this.mesh.GetMaterial().GetShader();
        // Bind the vertex array object and shader program.
        RenderCommand.BindVertexArray(VAO.GetId());
        RenderCommand.UseShader(shader.GetId());
        // Bind the refraction and reflection textures.
        RenderCommand.BindTexture(this.reflectionTex.GetId(), TextureType.Tex2D, 0);
        RenderCommand.BindTexture(this.refractionTex.GetId(), TextureType.Tex2D, 1);
        RenderCommand.BindTexture(this.normalMap.GetId(), TextureType.Tex2D, 2);
        RenderCommand.SetInt(shader.GetId(), "reflectionTex", 0);
        RenderCommand.SetInt(shader.GetId(), "refractionTex", 1);
        RenderCommand.SetInt(shader.GetId(), "normalMap", 2);
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
        RenderCommand.UnBindTexture(TextureType.Tex2D, 0);
        RenderCommand.UnBindTexture(TextureType.Tex2D, 1);
        // ----------------------------------------------------------------
    }

    public GetMesh() : Mesh { return this.mesh; }
    public GetReflectionTex() : Texture2D { return this.reflectionTex; }
    public GetRefractionTex() : Texture2D { return this.refractionTex; }
    public GetFramebuffer() : Framebuffer { return this.framebuffer; }

    private mesh : Mesh;
    private reflectionTex !: Texture2D;
    private refractionTex !: Texture2D;
    private normalMap !: Texture2D;
    private camera : PerspectiveCamera;
    private framebuffer !: Framebuffer;
    private clippingPlanes : glm.vec4[] = [];
};