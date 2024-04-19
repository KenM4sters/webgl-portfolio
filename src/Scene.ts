import GUI from "lil-gui";
import * as glm from "gl-matrix"
import { Mesh } from "./Mesh";
import { CubeGeometry } from "./Geometry";
import { PhysicalMaterial } from "./Material";
import { Shader } from "./Shader";
import { Light, PointLight } from "./Light";
import { DataSizes, ImageChannels, ImageConfig, RenderConfig, TextureType } from "./Types";
import { RenderCommand } from "./RenderCommand";
import Input from "./Input";
import PerspectiveCamera, { CameraDirections } from "./Camera/PerspectiveCamera";
import Framebuffer from "./Framebuffer";
import { Texture2D } from "./Texture";

// Shaders
import mvpVertSrc from "./Shaders/ModelViewProjection.vert?raw";
import pbrFragSrc from "./Shaders/PhysicalMaterial.frag?raw";


export default class Scene
{
    constructor() {}

    public Init(Gui : GUI, w : number, h : number): void 
    {
        const PBR_MVP_Shader = new Shader(mvpVertSrc, pbrFragSrc);
        // Mesh 1
        var cubeGeo = new CubeGeometry();
        var cubeMat = new PhysicalMaterial(PBR_MVP_Shader);
        var cube = new Mesh(cubeGeo, cubeMat);
        cube.transforms.Scale = glm.vec3.fromValues(1.0, 1.0, 1.0);
        cube.transforms.Translation = glm.vec3.fromValues(-1.0, 0.55, 0.0);
        cube.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), cube.transforms.ModelMatrix, cube.transforms.Translation);
        this.Push(cube);
        
        // Mesh 2
        var floorGeo = new CubeGeometry();
        var floorMat = new PhysicalMaterial(PBR_MVP_Shader);
        var floor = new Mesh(floorGeo, floorMat); 
        floor.transforms.Scale = glm.vec3.fromValues(100.0, 0.1, 100.0);
        floor.transforms.Translation = glm.vec3.fromValues(0.0, -0.6, 0.0);
        floor.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), floor.transforms.ModelMatrix, floor.transforms.Translation);
        this.Push(floor);

        // Light 1
        var light1 = new PointLight(glm.vec3.fromValues(1.0, 1.0, 1.0), 1.0);
        light1.intensity = 1000.0;
        light1.color = glm.vec3.fromValues(0.0, 0.0, 0.2);
        light1.transforms.Translation = glm.vec3.fromValues(1.0, 100.0, 2.0);
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
            Format:ImageChannels.RGBA,
            DataType: DataSizes.FLOAT
        }
        console.log(w, h);
        

        this.output = 
        {
            target: new Framebuffer(imageConfig),
            config: {
                ClearDepthBit: true,
                ClearColorBit: true,
                DepthTest: true
            }
        };

 
        // GUI Parameters
        // Cube
        const CubeFolder = Gui.addFolder('Cube');
        CubeFolder.add(cube.transforms.Translation, '0', -100.0, 100.0, 0.01).name("PosX").onChange(() => {
            cube.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), cube.transforms.ModelMatrix, cube.transforms.Translation);
        })
        CubeFolder.add(cube.transforms.Translation, '1', -100.0, 100.0, 0.01).name("PosY").onChange(() => {
            cube.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), cube.transforms.ModelMatrix, cube.transforms.Translation);
        })
        CubeFolder.add(cube.transforms.Translation, '2', -100.0, 100.0, 0.01).name("PosZ").onChange(() => {
            cube.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), cube.transforms.ModelMatrix, cube.transforms.Translation);
        })
        CubeFolder.add(cube.transforms.Scale, '0', -100.0, 100.0, 0.01).name("ScaleX").onChange(() => {
            cube.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), cube.transforms.ModelMatrix, cube.transforms.Scale);
        })
        CubeFolder.add(cube.transforms.Scale, '1', -100.0, 100.0, 0.01).name("ScaleY").onChange(() => {
            cube.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), cube.transforms.ModelMatrix, cube.transforms.Scale);
        })
        CubeFolder.add(cube.transforms.Scale, '2', -100.0, 100.0, 0.01).name("ScaleZ").onChange(() => {
            cube.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), cube.transforms.ModelMatrix, cube.transforms.Scale);
        })
        if(cubeMat instanceof PhysicalMaterial) 
        {
            CubeFolder.add(cubeMat.Metallic, 'val',  0.0, 1.0, 0.01).name("Metallic");
            CubeFolder.add(cubeMat.Roughness, 'val',  0.0, 1.0, 0.01).name("Roughness");
        }
        CubeFolder.add(cubeMat.emission, 'val',  0.0, 1.0, 0.01).name("Emission");
        CubeFolder.add(cubeMat.isUsingTextures, 'val').name("isUsingTextures");


        // Floor 
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
    }

    public Render(ts : number): void 
    {
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
    }

    public Resize(w : number, h : number): void {
        if(!this.output) return;
        // Delete current framebuffers, renderbuffers and textures, since they all require
        // information about our window dimensions which have now been changed. 
        if(this.output.target.GetFBO()) RenderCommand.DeleteFramebuffer(this.output.target.GetFBO());
        if(this.output.target.GetRBO()) RenderCommand.DeleteRenderBuffer(this.output.target.GetRBO());
        if(this.output.target.GetColorTexture()) RenderCommand.DeleteTexture2D(this.output.target.GetColorTexture().GetId());

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
        this.output.target = new Framebuffer(imageConfig);
    }

    public ProcessUserInput(dt : number): void 
    {
        Input.IsKeyPressed("w") ? this.camera.ProcessUserInput(CameraDirections.FORWARD, dt) : null;
        Input.IsKeyPressed("a") ? this.camera.ProcessUserInput(CameraDirections.LEFT, dt) : null;
        Input.IsKeyPressed("s") ? this.camera.ProcessUserInput(CameraDirections.BACKWARD, dt) : null;
        Input.IsKeyPressed("d") ? this.camera.ProcessUserInput(CameraDirections.RIGHT, dt) : null;
        Input.IsKeyPressed("q") ? this.camera.ProcessUserInput(CameraDirections.UP, dt) : null;
        Input.IsKeyPressed("e") ? this.camera.ProcessUserInput(CameraDirections.DOWN, dt) : null;
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
    public output !: {target : Framebuffer, config : RenderConfig};
};