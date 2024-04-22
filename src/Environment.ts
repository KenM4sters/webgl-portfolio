import Framebuffer, { FramebufferCubeMap } from "./Framebuffer";
import { Shader } from "./Shader";
import { CubeTexture, Texture2D } from "./Texture";
import { DataSizes, ImageChannels, ImageConfig, TextureType } from "./Types";
import * as glm from "gl-matrix"
import { RenderCommand } from "./RenderCommand";
import { CubeGeometry } from "./Geometry";

// Shaders
import EqToCubeMapVertSrc from "./Shaders/EqToCubeMap.vert?raw";
import EqToCubeMapFragSrc from "./Shaders/EqToCubeMap.frag?raw";
import envVertSrc from "./Shaders/Environment.vert?raw";
import envFragSrc from "./Shaders/Environment.frag?raw";

export default class Environment 
{
    constructor(imagePath : string, cube : CubeGeometry) 
    {

        // Cube
        this.cube = cube;
        this.shader = new Shader(envVertSrc, envFragSrc);

        // Conversion from HDR texture to cube map.
        const hdrTex = new Texture2D(imagePath);
        const imageConfig : ImageConfig = 
        {
            TargetType: TextureType.CubeTex,
            MipMapLevel: 0,
            NChannels: ImageChannels.RGBA32F,
            Width: 512,
            Height: 512,
            Format: ImageChannels.RGBA,
            DataType: DataSizes.FLOAT
        }
        this.rawCubeMap = new CubeTexture(imageConfig);
        this.captureFBO = new FramebufferCubeMap(this.rawCubeMap);

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
        RenderCommand.SetInt(EqShader.GetId(), "equirectangularMap", 0);
        RenderCommand.SetMat4f(EqShader.GetId(), "projection", captureProjection);
        RenderCommand.BindTexture(hdrTex.GetId(), TextureType.Tex2D);

        RenderCommand.SetViewportDimensions(512, 512); // don't forget to configure the viewport to the capture dimensions.
        RenderCommand.BindFramebuffer(this.captureFBO.GetFBO());
        for (let i = 0; i < 6; i++)
        {
            RenderCommand.SetMat4f(EqShader.GetId(), "view", captureViews[i]);
            this.captureFBO.SetColorTexture(i);
            RenderCommand.ClearColorBufferBit(true);
            RenderCommand.ClearDepthBufferBit(true);

            RenderCommand.DrawGeometry(this.cube, this.shader); // renders a 1x1 cube
        }
        RenderCommand.UnbindFramebuffer();
        RenderCommand.UnBindTexture(TextureType.Tex2D);
    }

    private GenerateConvolutedMap() : void 
    {

    }

    private rawCubeMap : CubeTexture;
    private convolutedMap !: CubeTexture;
    private cube : CubeGeometry;
    private captureFBO : FramebufferCubeMap;
    private shader : Shader;
}