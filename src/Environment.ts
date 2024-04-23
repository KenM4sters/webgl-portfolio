import Framebuffer, { FramebufferCubeMap } from "./Framebuffer";
import { Shader } from "./Shader";
import { CubeTexture, Texture2D } from "./Texture";
import { DataSizes, EnvironmentParams, EnvironmentTypes, GeometryDrawFunctionTypes, ImageChannels, ImageConfig, TextureType } from "./Types";
import * as glm from "gl-matrix"
import { RenderCommand } from "./RenderCommand";

// Shaders
import EqToCubeMapVertSrc from "./Shaders/EqToCubeMap.vert?raw";
import EqToCubeMapFragSrc from "./Shaders/EqToCubeMap.frag?raw";
import { Mesh } from "./Mesh";

export default class Environment 
{
    constructor(params : EnvironmentParams, mesh : Mesh, w: number, h: number, type : EnvironmentTypes) 
    {

        // Cube
        this.mesh = mesh;
        switch(type) 
        {
            case EnvironmentTypes.SKYBOX : this.GenerateCubeSkybox(params, mesh, w, h); break;
            case EnvironmentTypes.CUSTOM_SPHERE : this.GenerateCustomSphere(params, mesh, w, h); break;
        }
    }
    
    private GenerateCustomSphere(params : EnvironmentParams, mesh : Mesh, w: number, h: number) : void 
    {
        
    }


    private GenerateCubeSkybox(params : EnvironmentParams, mesh : Mesh, w: number, h: number) : void 
    {
        // Conversion from HDR texture to cube map.
        if(!params.img) throw new Error("Environment | CubeSkybox needs a valid image!");
        const hdrTex = new Texture2D(params.img);

        const imageConfig : ImageConfig = 
        {
            TargetType: TextureType.CubeTex,
            MipMapLevel: 0,
            NChannels: ImageChannels.RGBA32F,
            Width: 1024,
            Height: 1024,
            Format: ImageChannels.RGBA,
            DataType: DataSizes.FLOAT
        }
        this.rawCubeMap = new CubeTexture(imageConfig);
        this.captureFBO = new FramebufferCubeMap(this.rawCubeMap, true);

        let captureProjection : glm.mat4 = glm.mat4.perspective(glm.mat4.create(), glm.glMatrix.toRadian(90.0), 1.0, 0.1, 10.0);
        let captureViews: glm.mat4[] = 
        [
            glm.mat4.lookAt(glm.mat4.create(), glm.vec3.fromValues(0.0, 0.0, 0.0), glm.vec3.fromValues( 1.0,  0.0,  0.0), glm.vec3.fromValues(0.0, -1.0,  0.0)),
            glm.mat4.lookAt(glm.mat4.create(), glm.vec3.fromValues(0.0, 0.0, 0.0), glm.vec3.fromValues(-1.0,  0.0,  0.0), glm.vec3.fromValues(0.0, -1.0,  0.0)),
            glm.mat4.lookAt(glm.mat4.create(), glm.vec3.fromValues(0.0, 0.0, 0.0), glm.vec3.fromValues( 0.0,  1.0,  0.0), glm.vec3.fromValues(0.0,  0.0,  1.0)),
            glm.mat4.lookAt(glm.mat4.create(), glm.vec3.fromValues(0.0, 0.0, 0.0), glm.vec3.fromValues( 0.0, -1.0,  0.0), glm.vec3.fromValues(0.0,  0.0, -1.0)),
            glm.mat4.lookAt(glm.mat4.create(), glm.vec3.fromValues(0.0, 0.0, 0.0), glm.vec3.fromValues( 0.0,  0.0,  1.0), glm.vec3.fromValues(0.0, -1.0,  0.0)),
            glm.mat4.lookAt(glm.mat4.create(), glm.vec3.fromValues(0.0, 0.0, 0.0), glm.vec3.fromValues( 0.0,  0.0, -1.0), glm.vec3.fromValues(0.0, -1.0,  0.0))
        ];

        // convert HDR equirectangular environment map to cubemap equivalent
        const EqShader = new Shader(EqToCubeMapVertSrc, EqToCubeMapFragSrc);
        
        RenderCommand.UseShader(EqShader.GetId());
        RenderCommand.SetInt(EqShader.GetId(), "hdrTex", 0);
        RenderCommand.SetMat4f(EqShader.GetId(), "projection", captureProjection);
        RenderCommand.UnBindTexture(TextureType.CubeTex);
        RenderCommand.UnBindTexture(TextureType.Tex2D, 0);
        RenderCommand.BindTexture(hdrTex.GetId(), TextureType.Tex2D, 0);

        RenderCommand.SetViewportDimensions(1024, 1024); // don't forget to configure the viewport to the capture dimensions.
        RenderCommand.BindFramebuffer(this.captureFBO.GetFBO());

        for (let i = 0; i < 6; i++)
        {
            RenderCommand.UseShader(EqShader.GetId());
            RenderCommand.SetMat4f(EqShader.GetId(), "view", captureViews[i]);
            this.captureFBO.SetColorTexture(i);
            RenderCommand.ClearColorBufferBit(true);
            RenderCommand.ClearDepthBufferBit(true);

            const VAO = this.mesh.GetGeometry().vertexArray;
            const EBO = this.mesh.GetGeometry().vertexArray.GetIndexBuffer();
            
            RenderCommand.BindVertexArray(VAO.GetId());
            switch(this.mesh.GetGeometry().drawFunction.type) 
            {
                case GeometryDrawFunctionTypes.DRAW_ARRAYS: RenderCommand.Draw(this.mesh.GetGeometry().drawFunction.shape, VAO.GetVertexBuffer().GetVerticesCount()); break;
                case GeometryDrawFunctionTypes.DRAW_ARRAYS_INDEXED: if(EBO) RenderCommand.DrawIndexed(this.mesh.GetGeometry().drawFunction.shape, EBO.GetUniqueSize() / EBO.GetUniqueIndices().BYTES_PER_ELEMENT , EBO.GetUniqueOffset()); break; 
            };
            RenderCommand.UnbindVertexArray();
            
        }
        RenderCommand.UnbindFramebuffer();
        RenderCommand.UnBindTexture(TextureType.Tex2D);
        RenderCommand.SetViewportDimensions(w, h);
    }



    public GetRawCubeMap() : CubeTexture { return this.rawCubeMap; }
    public GetConvolutedMap() : CubeTexture { return this.convolutedMap; }
    public GetCube() : Mesh { return this.mesh; }
    public GetCaptureFramebufffer() : FramebufferCubeMap { return this.captureFBO; }

    private rawCubeMap !: CubeTexture;
    private convolutedMap !: CubeTexture;
    private mesh : Mesh;
    private captureFBO !: FramebufferCubeMap;
}