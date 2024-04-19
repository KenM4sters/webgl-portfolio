import { RenderCommand } from "./RenderCommand.ts";
import { Ref, ShaderType } from "./Types.ts";

export class Shader 
{
    private ID !: Ref<WebGLProgram>;
    private debugName : string = "";

    constructor(vScriptId : string, fScriptId : string, name : string) 
    {
        this.debugName = name;
        this.Compile(vScriptId, fScriptId);      
    }
    
    // Getters 
    GetId() : Ref<WebGLProgram> { return this.ID; }
    GetName() : string { return this.debugName; }
    // Setters
    SetName(name : string) { this.debugName = name; }

    private Compile(vSource : string, fSource : string) : void 
    {   
        if(!vSource || !fSource)
            throw new Error("Failed to get Shader source code from scriptId!");

        // Secondly, we need to create glPrograms for each shader.
        var vShader = RenderCommand.CreateShaderSource(ShaderType.Vertex);
        if(vShader == null) throw new Error("Failed to create vertex shader!");
        RenderCommand.SetShaderSource(vShader, vSource);
        RenderCommand.CompileShader(vShader);
        RenderCommand.CheckShaderErrors(vShader);
        

        var fShader = RenderCommand.CreateShaderSource(ShaderType.Fragment);
        if(fShader == null) throw new Error("Failed to create fragment shader!");
        RenderCommand.SetShaderSource(fShader, fSource);
        RenderCommand.CompileShader(fShader);
        RenderCommand.CheckShaderErrors(fShader);


        // Thirdly, we need to link the 2 shaders into a single shader program that we can use/release
        // as and when we want to use the two shaders.
        this.ID = {val : RenderCommand.CreateShader()};
        if(this.ID.val == null) throw new Error("Failed to create shader program!");
        RenderCommand.AttachShader(this.ID, vShader);
        RenderCommand.AttachShader(this.ID, fShader);
        RenderCommand.LinkShader(this.ID);
        RenderCommand.CheckShaderProgramErrors(this.ID);
        RenderCommand.UseShader(this.ID);        
    }
};

