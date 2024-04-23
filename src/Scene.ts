import GUI from "lil-gui";
import * as glm from "gl-matrix"
import { Mesh } from "./Mesh";
import { CubeGeometry, SphereGeometry } from "./Geometry";
import { PhysicalMaterial } from "./Material";
import { Shader } from "./Shader";
import { Light, PointLight } from "./Light";
import { DataSizes, EnvironmentTypes, FunctionEquationTypes, ImageChannels, ImageConfig, RenderTarget, TextureType } from "./Types";
import { RenderCommand } from "./RenderCommand";
import Input from "./Input";
import PerspectiveCamera, { CameraDirections } from "./Camera/PerspectiveCamera";
import Framebuffer from "./Framebuffer";
import { Texture2D } from "./Texture";
import Environment from "./Environment";

// Shaders
import mvpVertSrc from "./Shaders/ModelViewProjection.vert?raw";
import pbrFragSrc from "./Shaders/PhysicalMaterial.frag?raw";
import skyVertSrc from "./Shaders/Sky.vert?raw";
import skyFragSrc from "./Shaders/Sky.frag?raw";
import envVertSrc from "./Shaders/Environment.vert?raw";
import envFragSrc from "./Shaders/Environment.frag?raw";
import Resources from "./Resources";
import { TextureImageData } from "three/src/textures/types.js";
import Sky from "./Sky";


export default class Scene
{
    constructor() {}

    public Init(Gui : GUI, w : number, h : number): void 
    {
        // Shaders
        const PBR_MVP_Shader = new Shader(mvpVertSrc, pbrFragSrc);

        // Camera
        this.camera = new PerspectiveCamera([0.0, 2.0, 10.0], w, h);

        // Small sphere
        var plainSphereGeo = new SphereGeometry(2, 100, 100);
        var plainSphereMat = new PhysicalMaterial(PBR_MVP_Shader);
        var plainSphere = new Mesh(plainSphereGeo, plainSphereMat);
        plainSphere.transforms.Scale = glm.vec3.fromValues(0.4, 0.4, 0.4);
        plainSphere.transforms.Translation = glm.vec3.fromValues(0.0, 5.0, 0.0);
        plainSphere.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), plainSphere.transforms.ModelMatrix, plainSphere.transforms.Translation);
        this.Push(plainSphere);
        
        // Floor 
        var floorGeo = new CubeGeometry();
        var floorMat = new PhysicalMaterial(PBR_MVP_Shader);
        var floor = new Mesh(floorGeo, floorMat); 
        floor.transforms.Scale = glm.vec3.fromValues(100.0, 0.1, 100.0);
        floor.transforms.Translation = glm.vec3.fromValues(0.0, -0.6, 0.0);
        floor.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), floor.transforms.ModelMatrix, floor.transforms.Translation);
        this.Push(floor);

        // Light 1
        var light1 = new PointLight(glm.vec3.fromValues(0.0, 0.4, 0.4), 20.0);
        light1.transforms.Translation = glm.vec3.fromValues(6.0, 4.0, 4.0);
        light1.transforms.ModelMatrix = glm.mat4.translate(glm.mat4.create(), light1.transforms.ModelMatrix, light1.transforms.Translation);
        this.Push(light1);

        // Since we'll be rendering our scene to an off-screen render buffer, and storing the results
        // in a texture to be used for the "SreenQuad" render layer, we need to define this.renderTarget
        // as our own custom framebuffer.
        var imageConfig : ImageConfig = {
            TargetType: TextureType.Tex2D,
            MipMapLevel: 0,
            NChannels: ImageChannels.RGBA32F,
            Width: w,
            Height: h,
            Format: ImageChannels.RGBA,
            DataType: DataSizes.FLOAT
        }

        this.output = 
        {
            target: new Framebuffer(imageConfig, true),
            config: {
                ClearDepthBit: true,
                ClearColorBit: true,
                DepthTest: true
            }
        };


        // Environment Map.
        // const envCube = new CubeGeometry();
        // const cubeMat = new PhysicalMaterial(new Shader(envVertSrc, envFragSrc));
        // const cubeMesh = new Mesh(envCube, cubeMat);
        // const envParams = 
        // {
        //     bottomColor: bottomColor,
        //     topColor: topColor,
        //     img: null
        // };
        // this.environment = new Environment(envParams, cubeMesh, w, h, EnvironmentTypes.CUSTOM_SPHERE);

        // Sky.
        const skyGeo = new SphereGeometry(100, 100, 100);
        const skyMat = new PhysicalMaterial(new Shader(skyVertSrc, skyFragSrc));
        const sky = new Mesh(skyGeo, skyMat);
        this.Push(sky);

        const sunLight = new PointLight([1.0, 1.0, 1.0], 10000);
        sunLight.transforms.Translation = glm.vec3.fromValues(0.0, 5.0, 0.0);
        sunLight.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), sunLight.transforms.ModelMatrix, sunLight.transforms.Translation);

        const skyParams = 
        {
            bottomColor: glm.vec3.fromValues(0.0, 0.1, 0.2),
            topColor: glm.vec3.fromValues(0.0, 0.0, 0.2),

        };

        this.sky = new Sky(sky, sunLight, skyParams);

 
        // GUI Parameters
        // Cube
        const CubeFolder = Gui.addFolder('Cube');
        CubeFolder.add(plainSphere.transforms.Translation, '0', -100.0, 100.0, 0.01).name("PosX").onChange(() => {
            plainSphere.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), plainSphere.transforms.ModelMatrix, plainSphere.transforms.Translation);
        })
        CubeFolder.add(plainSphere.transforms.Translation, '1', -100.0, 100.0, 0.01).name("PosY").onChange(() => {
            plainSphere.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), plainSphere.transforms.ModelMatrix, plainSphere.transforms.Translation);
        })
        CubeFolder.add(plainSphere.transforms.Translation, '2', -100.0, 100.0, 0.01).name("PosZ").onChange(() => {
            plainSphere.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), plainSphere.transforms.ModelMatrix, plainSphere.transforms.Translation);
        })
        CubeFolder.add(plainSphere.transforms.Scale, '0', -100.0, 100.0, 0.01).name("ScaleX").onChange(() => {
            plainSphere.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), plainSphere.transforms.ModelMatrix, plainSphere.transforms.Scale);
        })
        CubeFolder.add(plainSphere.transforms.Scale, '1', -100.0, 100.0, 0.01).name("ScaleY").onChange(() => {
            plainSphere.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), plainSphere.transforms.ModelMatrix, plainSphere.transforms.Scale);
        })
        CubeFolder.add(plainSphere.transforms.Scale, '2', -100.0, 100.0, 0.01).name("ScaleZ").onChange(() => {
            plainSphere.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), plainSphere.transforms.ModelMatrix, plainSphere.transforms.Scale);
        })
        if(plainSphereMat instanceof PhysicalMaterial) 
        {
            CubeFolder.add(plainSphereMat.Metallic, 'val',  0.0, 1.0, 0.01).name("Metallic");
            CubeFolder.add(plainSphereMat.Roughness, 'val',  0.0, 1.0, 0.01).name("Roughness");
        }
        CubeFolder.add(plainSphereMat.emission, 'val',  0.0, 1.0, 0.01).name("Emission");
        CubeFolder.add(plainSphereMat.isUsingTextures, 'val').name("isUsingTextures");


        // // Floor 
        const FloorFolder = Gui.addFolder('Floor');
        FloorFolder.add(floor.transforms.Translation, '0', -100.0, 100.0, 0.01).name("PosX").onChange(() => {
            floor.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), floor.transforms.ModelMatrix, floor.transforms.Translation);
        })
        FloorFolder.add(floor.transforms.Translation, '1', -100.0, 100.0, 0.01).name("PosY").onChange(() => {
            floor.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), floor.transforms.ModelMatrix, floor.transforms.Translation);
        })
        FloorFolder.add(floor.transforms.Translation, '2', -100.0, 100.0, 0.01).name("PosZ").onChange(() => {
            floor.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), floor.transforms.ModelMatrix, floor.transforms.Translation);
        })
        FloorFolder.add(floor.transforms.Scale, '0', -100.0, 100.0, 0.01).name("ScaleX").onChange(() => {
            floor.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), floor.transforms.ModelMatrix, floor.transforms.Scale);
        })
        FloorFolder.add(floor.transforms.Scale, '1', -100.0, 100.0, 0.01).name("ScaleY").onChange(() => {
            floor.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), floor.transforms.ModelMatrix, floor.transforms.Scale);
        })
        FloorFolder.add(floor.transforms.Scale, '2', -100.0, 100.0, 0.01).name("ScaleZ").onChange(() => {
            floor.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), floor.transforms.ModelMatrix, floor.transforms.Scale);
        })

        if(floorMat instanceof PhysicalMaterial) 
        {
            FloorFolder.add(floorMat.Metallic, 'val',  0.0, 1.0, 0.01).name("Metallic");
            FloorFolder.add(floorMat.Roughness, 'val',  0.0, 1.0, 0.01).name("Roughness");
        }
        FloorFolder.add(floorMat.emission, 'val',  0.0, 1.0, 0.01).name("Emission");
        FloorFolder.add(floorMat.isUsingTextures, 'val').name("isUsingTextures");
        
        // Lights

        const LightsFolder = Gui.addFolder("Lights");

        LightsFolder.add(light1.transforms.Translation, '0', -100.0, 100.0, 0.01).name("Light1|PosX").onChange(() => {
            light1.transforms.ModelMatrix = glm.mat4.translate(glm.mat4.create(), light1.transforms.ModelMatrix, light1.transforms.Translation);
        })
        LightsFolder.add(light1.transforms.Translation, '1', -100.0, 100.0, 0.01).name("Light1|PosY").onChange(() => {
            light1.transforms.ModelMatrix = glm.mat4.translate(glm.mat4.create(), light1.transforms.ModelMatrix, light1.transforms.Translation);
        })
        LightsFolder.add(light1.transforms.Translation, '2', -100.0, 100.0, 0.01).name("Light1|PosZ").onChange(() => {
            light1.transforms.ModelMatrix = glm.mat4.translate(glm.mat4.create(), light1.transforms.ModelMatrix, light1.transforms.Translation);
        })
        LightsFolder.add(light1, 'intensity', 0.0, 1000.0, 10.0).name("Light1|Intensity");
        LightsFolder.add(light1.color, '0', 0.0, 1.0, 0.01).name("Light1|ColorR");
        LightsFolder.add(light1.color, '1', 0.0, 1.0, 0.01).name("Light1|ColorG");
        LightsFolder.add(light1.color, '2', 0.0, 1.0, 0.01).name("Light1|ColorB");

        // Skybox
        const skyboxFolder = Gui.addFolder("Skybox");
        skyboxFolder.add(skyParams.bottomColor, '0', 0.0, 20.0, 0.1).name("BottomColor|R");
        skyboxFolder.add(skyParams.bottomColor, '1', 0.0, 20.0, 0.1).name("BottomColor|G");
        skyboxFolder.add(skyParams.bottomColor, '2', 0.0, 20.0, 0.1).name("BottomColor|B");
        skyboxFolder.add(skyParams.topColor, '0', 0.0, 20.0, 0.1).name("topColor|R");
        skyboxFolder.add(skyParams.topColor, '1', 0.0, 20.0, 0.1).name("topColor|G");
        skyboxFolder.add(skyParams.topColor, '2', 0.0, 20.0, 0.1).name("topColor|B");
    }

    public Render(ts : number): void 
    {
        // RenderCommand.SetDepthFunc(FunctionEquationTypes.LEQUAL);
        // RenderCommand.UseShader(this.environment.GetCube().GetMaterial().GetShader().GetId());
        // RenderCommand.SetMat4f(this.environment.GetCube().GetMaterial().GetShader().GetId(), "projection", this.camera.GetProjectionMatrix());
        // RenderCommand.SetMat4f(this.environment.GetCube().GetMaterial().GetShader().GetId(), "view", this.camera.GetViewMatrix());
        // RenderCommand.SetInt(this.environment.GetCube().GetMaterial().GetShader().GetId(), "environmentMap", 0);
        // RenderCommand.BindTexture(this.environment.GetRawCubeMap().GetId(), TextureType.CubeTex);
        // RenderCommand.DrawEnvironment(this.environment);
        // RenderCommand.ReleaseShader();
        // RenderCommand.UnBindTexture(TextureType.CubeTex);

        const shader = this.sky.GetSphere().GetMaterial().GetShader().GetId();
        RenderCommand.UseShader(shader);
        RenderCommand.SetVec3f(shader, "bottomColor", this.sky.GetParams().bottomColor);
        RenderCommand.SetVec3f(shader, "topColor", this.sky.GetParams().topColor);
        RenderCommand.SetMat4f(shader, "projection", this.camera.GetProjectionMatrix());
        RenderCommand.SetMat4f(shader, "view", this.camera.GetViewMatrix());
        RenderCommand.SetVec3f(shader, "light.Position", this.sky.GetSun().transforms.Translation);
        RenderCommand.SetVec3f(shader, "light.Color", this.sky.GetSun().color);
        RenderCommand.SetFloat(shader, "light.Intensity", this.sky.GetSun().intensity);
        RenderCommand.DrawSky(this.sky);
        RenderCommand.ReleaseShader();

        this.Traverse((child : Mesh) => 
        {

            // May end up adding all objects (lights, materials etc) into this.
            if(child instanceof Mesh) 
            {
                let mat = child.GetMaterial();

                if(mat instanceof PhysicalMaterial) 
                {
                    let shader = mat.GetShader();
                    let Id = shader.GetId();

                    child.transforms.ModelMatrix = glm.mat4.create();
                    child.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), child.transforms.ModelMatrix, child.transforms.Scale);
                    child.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), child.transforms.ModelMatrix, child.transforms.Translation);

                    // Clear up any texture units that we may need in case they weren't from the pervious render pass.
                    RenderCommand.UnBindTexture(TextureType.Tex2D, 0);
                    RenderCommand.UnBindTexture(TextureType.Tex2D, 1);
                    RenderCommand.UnBindTexture(TextureType.Tex2D, 2);
                    RenderCommand.UnBindTexture(TextureType.Tex2D, 3);

                    // Important uniforms for transforming coordinates between spaces.
                    RenderCommand.UseShader(Id);
                    RenderCommand.SetMat4f(Id, "model", child.transforms.ModelMatrix);
                    RenderCommand.SetMat4f(Id, "view", this.camera.GetViewMatrix());
                    RenderCommand.SetMat4f(Id, "projection", this.camera.GetProjectionMatrix());
                    RenderCommand.SetVec3f(Id, "camera.Position", this.camera.position);
                    RenderCommand.SetBool(Id, "IsUsingTextures", mat.isUsingTextures.val);

                    // Material Props - Could be either a texture or a float/array, so we need to check each property and assign it the correct unifrom.
                    if(mat.isUsingTextures.val && mat.Albedo.val instanceof Texture2D) {RenderCommand.SetInt(Id, "material.Albedo", 0); RenderCommand.BindTexture(mat.Albedo.val.GetId(), TextureType.Tex2D, 0)}
                    else RenderCommand.SetVec3f(Id, "rawMaterial.Albedo", mat.Albedo.val as glm.vec3);
                    if(mat.isUsingTextures.val && mat.Metallic.val instanceof Texture2D) {RenderCommand.SetInt(Id, "material.Metallic", 1); RenderCommand.BindTexture(mat.Metallic.val.GetId(), TextureType.Tex2D, 1)}
                    else RenderCommand.SetFloat(Id, "rawMaterial.Metallic", mat.Metallic.val as number);
                    if(mat.isUsingTextures.val && mat.Roughness.val instanceof Texture2D) {RenderCommand.SetInt(Id, "material.Roughness", 2); RenderCommand.BindTexture(mat.Roughness.val.GetId(), TextureType.Tex2D, 2)}
                    else RenderCommand.SetFloat(Id, "rawMaterial.Roughness", mat.Roughness.val as number);
                    if(mat.isUsingTextures.val && mat.AO.val instanceof Texture2D) {RenderCommand.SetInt(Id, "material.AO", 3); RenderCommand.BindTexture(mat.AO.val.GetId(), TextureType.Tex2D, 3)}
                    else RenderCommand.SetFloat(Id, "rawMaterial.AO", mat.AO.val as number); 
                    
                    RenderCommand.SetFloat(Id, "rawMaterial.Emission", mat.emission.val); // Only really makes sense for a raw material.

                    // Loop through each light and set their uniform data.
                    for(const light of this.lights)
                    {
                        var light_index : number = 1;
                        RenderCommand.SetVec3f(Id, "light" + light_index + ".Position", light.transforms.Translation);
                        RenderCommand.SetVec3f(Id, "light" + light_index + ".Color", light.color);
                        RenderCommand.SetFloat(Id, "light" + light_index + ".Intensity", light.intensity);
                        light_index++;
                    }
                }
                
                // This function handles calling the appropriate draw call based on whether we're using indices or not.
                RenderCommand.DrawMesh(child);
                // Clear up the textures that were used for our materials.
                RenderCommand.UnBindTexture(TextureType.Tex2D, 0);
                RenderCommand.UnBindTexture(TextureType.Tex2D, 1);
                RenderCommand.UnBindTexture(TextureType.Tex2D, 2);
                RenderCommand.UnBindTexture(TextureType.Tex2D, 3);
            } 
        })
        
        this.ProcessUserInput(ts);
        
    }

    public Resize(w : number, h : number): void {
        if(!this.output) return;
        
        // Delete current framebuffers, renderbuffers and textures, since they all require
        // information about our window dimensions which have now been changed. 
        if(this.output.target?.GetFBO()) RenderCommand.DeleteFramebuffer(this.output.target.GetFBO());
        if(this.output.target?.GetRBO()) RenderCommand.DeleteRenderBuffer(this.output.target.GetRBO());
        if(this.output.target?.GetColorTexture()) RenderCommand.DeleteTexture2D(this.output.target.GetColorTexture().GetId());

        // Instantiate a new ImageConfig object with the updated dimension parameters.
        var imageConfig : ImageConfig = {
            TargetType: TextureType.Tex2D,
            MipMapLevel: 0,
            NChannels: ImageChannels.RGBA32F,
            Width: w,
            Height: h,
            Format:ImageChannels.RGBA,
            DataType: DataSizes.FLOAT
        }

        // Reset the target.
        this.output.target = new Framebuffer(imageConfig, true);
    }

    public ProcessUserInput(ts : number): void 
    {
        Input.IsKeyPressed("w") ? this.camera.ProcessUserInput(CameraDirections.FORWARD, ts) : null;
        Input.IsKeyPressed("a") ? this.camera.ProcessUserInput(CameraDirections.LEFT, ts) : null;
        Input.IsKeyPressed("s") ? this.camera.ProcessUserInput(CameraDirections.BACKWARD, ts) : null;
        Input.IsKeyPressed("d") ? this.camera.ProcessUserInput(CameraDirections.RIGHT, ts) : null;
        Input.IsKeyPressed("q") ? this.camera.ProcessUserInput(CameraDirections.UP, ts) : null;
        Input.IsKeyPressed("e") ? this.camera.ProcessUserInput(CameraDirections.DOWN, ts) : null;
    }   

    public Push(obj : Mesh | Light) : void 
    {
        if(obj instanceof Mesh) this.meshes.push(obj);
        if(obj instanceof Light) this.lights.push(obj);
    }

    public Traverse(callback: (child : Mesh) => void) 
    {
        for(const obj of this.meshes) 
        {
            callback(obj);
        }
    }

    public meshes : Array<Mesh> = new Array<Mesh>();
    public lights : Array<Light> = new Array<Light>();
    public camera !: PerspectiveCamera; 
    public environment !: Environment;
    public sky !: Sky;
    public output !: RenderTarget;

};