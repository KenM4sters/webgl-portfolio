import GUI from "lil-gui";
import * as glm from "gl-matrix"
import { Mesh } from "./Mesh";
import { PlaneGeometry, SphereGeometry } from "./Geometry";
import { PhysicalMaterial } from "./Material";
import { Shader } from "./Shader";
import { Light, PointLight } from "./Light";
import { DataSizes, ImageChannels, ImageConfig, ImageWrappingTypes, RenderTarget, SkyParams, TextureType, WaterParams } from "./Types";
import { RenderCommand } from "./RenderCommand";
import Input from "./Input";
import PerspectiveCamera, { CameraDirections } from "./Camera/PerspectiveCamera";
import Framebuffer from "./Framebuffer";
import { Texture2D } from "./Texture";
import Environment from "./Environment";

// Shaders
import skyVertSrc from "./Shaders/Sky.vert?raw";
import skyFragSrc from "./Shaders/Sky.frag?raw";
import Water from "./Water";
import Sky from "./Sky";
import AppStateListener, { ApplicationStates } from "./AppStateListener";


export default class Scene extends AppStateListener
{
    constructor() 
    {
        super();
    }

    public Init(Gui : GUI, w : number, h : number): void 
    {
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
            DataType: DataSizes.FLOAT,
            WrappingType: ImageWrappingTypes.CLAMP
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

        // Camera
        this.camera = new PerspectiveCamera([0.0, 2.0, 90.0], w, h);

        // Water. 
        var waterGeo = new PlaneGeometry(1000, 1000, 10, 10);
        const waterParams : WaterParams = {};
        this.water = new Water(waterGeo, this.camera, waterParams, w, h);

        // Sky.
        const skyGeo = new SphereGeometry(100, 100, 100);
        const skyMat = new PhysicalMaterial(new Shader(skyVertSrc, skyFragSrc));
        skyMat.Albedo.val = [0.0, 0.1, 1.0];
        const sky = new Mesh(skyGeo, skyMat);

        const skyParams : SkyParams = 
        {
            turbidity: {val: 0.09},
            rayleigh: {val: 0.16},
            mieCoefficient: {val: 0.03},
            mieDirectionalG: {val: 0.99} ,
            sunPosition: {val: glm.vec3.fromValues(0.0, 45.0, -200.0)},
            sunColor: {val: glm.vec3.fromValues(1.0, 1.0, 1.0)},
            sunIntensity: {val: 10000},
            up: {val: glm.vec3.fromValues(0, 1, 0)} 
        };

        this.sky = new Sky(sky, skyParams);

        // GUI Parameters
        // Sky
        const SkyFolder = Gui.addFolder('Sky');
        SkyFolder.add(skyParams.sunPosition.val,     '0',    -200.0, 200.0,     1.0).name("sunLight|PositionX");
        SkyFolder.add(skyParams.sunPosition.val,     '1',    -200.0, 200.0,     1.0).name("sunLight|PositionY");
        SkyFolder.add(skyParams.sunPosition.val,     '2',    -200.0, 200.0,     1.0).name("sunLight|PositionZ");
        SkyFolder.add(skyParams.sunColor.val,        '0',    0.0, 1.0,     0.1).name("sunLight|ColorR");
        SkyFolder.add(skyParams.sunColor.val,        '1',    0.0, 1.0,     0.1).name("sunLight|ColorG");
        SkyFolder.add(skyParams.sunColor.val,        '2',    0.0, 1.0,     0.1).name("sunLight|ColorB");   
        SkyFolder.add(skyParams.sunIntensity,        'val',  0.0, 10000.0, 50.0).name("sunLight|Intensity");
        
        SkyFolder.add(skyParams.mieCoefficient,      'val',  0.0, 1.0,     0.01).name("mieCoefficient");
        SkyFolder.add(skyParams.mieDirectionalG,     'val',  0.0, 1.0,     0.01).name("mieDirectionalG");
        SkyFolder.add(skyParams.rayleigh,            'val',  0.0, 4.0,     0.01).name("rayleigh");
        SkyFolder.add(skyParams.turbidity,           'val',  0.0, 20.0,    0.01).name("turbidity");

        // Water 
        const WaterFolder = Gui.addFolder('Water');
        WaterFolder.add(this.water.GetMesh().transforms.Translation, '0', -100.0, 100.0, 0.01).name("PosX").onChange(() => {
            this.water.GetMesh().transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), this.water.GetMesh().transforms.ModelMatrix, this.water.GetMesh().transforms.Translation);
        })
        WaterFolder.add(this.water.GetMesh().transforms.Translation, '1', -100.0, 100.0, 0.01).name("PosY").onChange(() => {
            this.water.GetMesh().transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), this.water.GetMesh().transforms.ModelMatrix, this.water.GetMesh().transforms.Translation);
        })
        WaterFolder.add(this.water.GetMesh().transforms.Translation, '2', -100.0, 100.0, 0.01).name("PosZ").onChange(() => {
            this.water.GetMesh().transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), this.water.GetMesh().transforms.ModelMatrix, this.water.GetMesh().transforms.Translation);
        })
        WaterFolder.add(this.water.GetMesh().transforms.Scale, '0', -100.0, 100.0, 0.01).name("ScaleX").onChange(() => {
            this.water.GetMesh().transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), this.water.GetMesh().transforms.ModelMatrix, this.water.GetMesh().transforms.Scale);
        })
        WaterFolder.add(this.water.GetMesh().transforms.Scale, '1', -100.0, 100.0, 0.01).name("ScaleY").onChange(() => {
            this.water.GetMesh().transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), this.water.GetMesh().transforms.ModelMatrix, this.water.GetMesh().transforms.Scale);
        })
        WaterFolder.add(this.water.GetMesh().transforms.Scale, '2', -100.0, 100.0, 0.01).name("ScaleZ").onChange(() => {
            this.water.GetMesh().transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), this.water.GetMesh().transforms.ModelMatrix, this.water.GetMesh().transforms.Scale);
        })

        Gui.show(false);
    }

    public Render(ts : number, currentTime : number): void 
    {            
        this.SceneRender();

        const water = this.water.GetMesh();
        const waterMat = this.water.GetMesh().GetMaterial();
        water.transforms.ModelMatrix =  glm.mat4.create();
        water.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), water.transforms.ModelMatrix, water.transforms.Scale);
        water.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), water.transforms.ModelMatrix, water.transforms.Translation);
        
        RenderCommand.UseShader(waterMat.GetShader().GetId());
        RenderCommand.SetFloat(waterMat.GetShader().GetId(), "time", currentTime / 10000);
        RenderCommand.SetMat4f(waterMat.GetShader().GetId(), "model", water.transforms.ModelMatrix);
        RenderCommand.SetMat4f(waterMat.GetShader().GetId(), "projection", this.camera.GetProjectionMatrix());
        RenderCommand.SetMat4f(waterMat.GetShader().GetId(), "view", this.camera.GetViewMatrix());
        RenderCommand.SetVec3f(waterMat.GetShader().GetId(), "sunPosition", this.sky.GetParams().sunPosition.val);
        RenderCommand.SetVec3f(waterMat.GetShader().GetId(), "sunColor", this.sky.GetParams().sunColor.val);
        RenderCommand.SetFloat(waterMat.GetShader().GetId(), "sunIntensity", this.sky.GetParams().sunIntensity.val);
        RenderCommand.SetVec3f(waterMat.GetShader().GetId(), "cameraPosition", this.camera.position);
        this.water.OnRender(this);
        RenderCommand.ReleaseShader();
        
        this.ProcessUserInput(ts);
        
    }

    public SceneRender() 
    {
        // Scene Objects
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
            });
            // Sky
            const sky = this.sky.GetSphere();
            const mat = sky.GetMaterial();
            sky.transforms.ModelMatrix = glm.mat4.create();
            sky.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), sky.transforms.ModelMatrix, sky.transforms.Scale);
            sky.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), sky.transforms.ModelMatrix, sky.transforms.Translation);
            RenderCommand.UseShader(mat.GetShader().GetId());
            RenderCommand.SetMat4f(mat.GetShader().GetId(), "model", sky.transforms.ModelMatrix);
            RenderCommand.SetMat4f(mat.GetShader().GetId(), "view", this.camera.GetViewMatrix());
            RenderCommand.SetMat4f(mat.GetShader().GetId(), "projection", this.camera.GetProjectionMatrix());
            RenderCommand.SetVec3f(mat.GetShader().GetId(), "camera.Position", this.camera.position);

            RenderCommand.SetFloat(mat.GetShader().GetId(), "params.Turbidity", this.sky.GetParams().turbidity.val);
            RenderCommand.SetFloat(mat.GetShader().GetId(), "params.Rayleigh", this.sky.GetParams().rayleigh.val);
            RenderCommand.SetFloat(mat.GetShader().GetId(), "params.MieCoefficient", this.sky.GetParams().mieCoefficient.val);
            RenderCommand.SetFloat(mat.GetShader().GetId(), "params.MieDirectionalG", this.sky.GetParams().mieDirectionalG.val);
            RenderCommand.SetVec3f(mat.GetShader().GetId(), "params.SunPosition", this.sky.GetParams().sunPosition.val);
            RenderCommand.SetVec3f(mat.GetShader().GetId(), "params.SunColor", this.sky.GetParams().sunColor.val);
            RenderCommand.SetFloat(mat.GetShader().GetId(), "params.SunIntensity", this.sky.GetParams().sunIntensity.val);
            RenderCommand.SetVec3f(mat.GetShader().GetId(), "params.Up", this.sky.GetParams().up.val);

            RenderCommand.DrawSky(this.sky);
            RenderCommand.ReleaseShader();
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
            DataType: DataSizes.FLOAT,
            WrappingType: ImageWrappingTypes.CLAMP
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

    protected HandleChangeInState(newState: ApplicationStates): void 
    {
        let params = this.sky.GetParams();
        if(newState == ApplicationStates.VIEWING_PROJECTS) 
        {
            params.rayleigh.val = 4.0;
            params.mieCoefficient.val = 0.1;
            params.mieDirectionalG.val = 0.7;
            params.sunPosition.val = [0.0, 4.0, -200.0];

        } else 
        {
            params.rayleigh.val = 0.16;
            params.mieCoefficient.val = 0.03;
            params.mieDirectionalG.val = 0.99;
            params.sunPosition.val  = [0.0, 45.0, -200.0];
        }
    }

    public meshes : Array<Mesh> = new Array<Mesh>();
    public lights : Array<Light> = new Array<Light>();
    public camera !: PerspectiveCamera; 
    public environment !: Environment;
    public sky !: Sky;
    public output !: RenderTarget;
    public water !: Water;

};