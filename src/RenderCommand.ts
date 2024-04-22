import * as glm from "gl-matrix";
import { VertexBuffer, IndexBuffer } from "./Buffer.ts";
import { FunctionEquationTypes, BlendFunctionTypes, ColorAttachments, DataSizes, GeometryDrawFunctionShapes, GeometryDrawFunctionTypes, ImageChannels, ImageConfig, Ref, ShaderDataType, ShaderType, TextureType } from "./Types.ts";
import { Mesh } from "./Mesh.ts";
import { Geometry } from "./Geometry.ts";
import { Shader } from "./Shader.ts";


export enum BufferType 
{
    Vertex,
    Index
};


// This class is entirely responsible for connecting our application to the WebGL API. 
// Every single call made to WebGL can be found here, which is why I like to create this 
// layer of abstraction that seperates our application from the actual WebGL API. 
// It's essentially our own tiny custom graphics API.
export class RenderCommand 
{
    private constructor() {}

    // Very important function - must be called before any other commands are made in order
    // to make the context available to this class.
    public static SubmitContext(context : WebGL2RenderingContext) {RenderCommand.gl = context};

    private static gl : WebGL2RenderingContext;
    // Create Buffer
    public static CreateVertexBuffer(vertices : Float32Array) : VertexBuffer 
    {
        return new VertexBuffer(vertices)
    }
    public static CreateIndexBuffer(indices : Uint16Array) : IndexBuffer 
    {
        return new IndexBuffer(indices)
    }

    // Bind Buffer
    public static CreateBuffer() : WebGLBuffer 
    {
        const Id = RenderCommand.gl.createBuffer();
        if(!Id) throw new Error("RenderCommand | Failed to create buffer!");
        return Id;
    }

    public static BindBuffer(Id : Ref<WebGLBuffer | null>, type : BufferType) : void { 
        if(Id.val && type == BufferType.Vertex) RenderCommand.gl.bindBuffer(RenderCommand.gl.ARRAY_BUFFER, Id.val) 
        else if(Id.val && type == BufferType.Index) RenderCommand.gl.bindBuffer(RenderCommand.gl.ELEMENT_ARRAY_BUFFER, Id.val);
        else throw new Error("RenderCommand | Failed to bind buffer! Id::Val is null!");
    }

    public static UnbindBuffer(type : BufferType) {
        type == BufferType.Vertex ? RenderCommand.gl.bindBuffer(RenderCommand.gl.ARRAY_BUFFER, null) 
            : RenderCommand.gl.bindBuffer(RenderCommand.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    // Set Buffer Data
    public static SetVertexBufferData(Id : Ref<WebGLBuffer | null>, cachedVertexData : Float32Array) : void 
    {
        // Check if there's any data in the existing buffer bound to Id.
        // If there is then, we'll have to delete and create a new one, since it will be too small.
        // Otherwise, just set it with our vertex data and return void.
        const bufferSize = RenderCommand.gl.getBufferParameter(RenderCommand.gl.ARRAY_BUFFER, RenderCommand.gl.BUFFER_SIZE);
        
        if(!bufferSize) 
        {            
            RenderCommand.gl.bufferData(RenderCommand.gl.ARRAY_BUFFER, cachedVertexData, RenderCommand.gl.STATIC_DRAW);
            return;
        }
        
        // Delete the old one since it won't be large enough to contain new vertex data.
        RenderCommand.BindBuffer(Id, BufferType.Vertex);
        RenderCommand.gl.deleteBuffer(Id.val);

        // Reallocate the Id with a new buffer, and set the new vertex data.
        Id.val = RenderCommand.gl.createBuffer();
        RenderCommand.BindBuffer(Id, BufferType.Vertex);
        RenderCommand.gl.bufferData(RenderCommand.gl.ARRAY_BUFFER, cachedVertexData, RenderCommand.gl.STATIC_DRAW);
    }

    public static SetIndexBufferData(Id : Ref<WebGLBuffer | null>, cachedIndexData : Uint16Array) : void 
    {
        // Check if there's any data in the existing buffer bound to Id.
        // If there is then, we'll have to delete and create a new one, since it will be too small.
        // Otherwise, just set it with our vertex data and return void.
        const bufferSize = RenderCommand.gl.getBufferParameter(RenderCommand.gl.ELEMENT_ARRAY_BUFFER, RenderCommand.gl.BUFFER_SIZE);
        if(!bufferSize) 
        {
            RenderCommand.gl.bufferData(RenderCommand.gl.ELEMENT_ARRAY_BUFFER, cachedIndexData, RenderCommand.gl.STATIC_DRAW);
            return;
        }

        // Delete the old one since it won't be large enough to contain new vertex data.
        RenderCommand.BindBuffer(Id, BufferType.Index);
        RenderCommand.gl.deleteBuffer(Id.val);

        // Reallocate the Id with a new buffer, and set the new vertex data.
        Id.val = RenderCommand.gl.createBuffer() as WebGLBuffer;
        RenderCommand.BindBuffer(Id, BufferType.Index);
        RenderCommand.gl.bufferData(RenderCommand.gl.ELEMENT_ARRAY_BUFFER, cachedIndexData, RenderCommand.gl.STATIC_DRAW);
    }

    // Vertex Array

    public static CreateVertexArray() : WebGLVertexArrayObject 
    {
        var temp : WebGLVertexArrayObject | null = RenderCommand.gl.createVertexArray();
        if(!temp) throw new Error("RenderCommand | Failed to create vertex array object!");
        return temp;
    }
    public static BindVertexArray(Id : Ref<WebGLVertexArrayObject | null>) : void
    {
        if(Id.val) RenderCommand.gl.bindVertexArray(Id.val);
        else throw new Error("RenderCommand | Failed to bind vertex array object! Id::val is null!")
    }

    public static UnbindVertexArray() : void 
    {
        RenderCommand.gl.bindVertexArray(null);
    }

    public static EnableVertexArray(layoutLoc : number) : void 
    {
        RenderCommand.gl.enableVertexAttribArray(layoutLoc);
    }
    
    public static SetVertexArrayAttribute(layoutLoc : number, count : number, type : number, stride : number, offset : number) : void 
    {
        RenderCommand.gl.vertexAttribPointer(layoutLoc, count, RenderCommand.ConvertShaderTypeToNative(type), false, stride, offset);
    }
    public static SetVertexArrayDivisor(layoutLoc : number, freq : number) : void 
    {
        RenderCommand.gl.vertexAttribDivisor(layoutLoc, freq);
    }


    // Shaders
    public static CreateShader() : WebGLProgram
    {
        const temp : WebGLProgram | null = RenderCommand.gl.createProgram();
        if(temp) return temp;
        throw new Error("RenderCommand | Failed to create shader program!");
    }

    public static UseShader(Id : Ref<WebGLProgram | null>) : void 
    { 
        if(Id.val) RenderCommand.gl.useProgram(Id.val); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!");
    }

    public static ReleaseShader() : void 
    { 
        RenderCommand.gl.useProgram(null); 
    }
    public static CreateShaderSource(s : ShaderType) : WebGLShader 
    { 
        const temp : WebGLProgram | null = RenderCommand.gl.createShader(RenderCommand.ConvertShaderType(s));
        if(temp) return temp;
        throw new Error("RenderCommand | Failed to create shader program source!"); 
    }
    public static SetShaderSource(shader : WebGLShader, src : string) : void 
    { 
        RenderCommand.gl.shaderSource(shader, src); 
    }
    public static CompileShader(shader : WebGLShader) : void 
    { 
        RenderCommand.gl.compileShader(shader); 
    }
    public static CheckShaderErrors(shader : WebGLShader) : void 
    { 
        if(RenderCommand.gl.getShaderInfoLog(shader)) console.log(RenderCommand.gl.getShaderInfoLog(shader));
    }
    public static AttachShader(Id : Ref<WebGLProgram>, shader : WebGLShader) : void 
    { 
        RenderCommand.gl.attachShader(Id.val, shader);
    }
    public static LinkShader(Id : Ref<WebGLProgram>) : void 
    { 
        RenderCommand.gl.linkProgram(Id.val);
    }
    public static CheckShaderProgramErrors(Id : Ref<WebGLProgram>) : void 
    { 
        if (!RenderCommand.gl.getProgramParameter(Id.val, RenderCommand.gl.LINK_STATUS)) {
            console.warn("Could not initialise shaders");
            console.log(RenderCommand.gl.getProgramInfoLog(Id.val));
        }
    }


    public static SetInt(Id : Ref<WebGLProgram | null>, name : string, val : number) : void 
    {
        if(Id.val) RenderCommand.gl.uniform1i(RenderCommand.gl.getUniformLocation(Id.val, name), val); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    public static SetFloat(Id : Ref<WebGLProgram | null>, name : string, val : number) : void 
    {
        if(Id.val) RenderCommand.gl.uniform1f(RenderCommand.gl.getUniformLocation(Id.val, name), val); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }
    public static SetBool(Id : Ref<WebGLProgram | null>, name : string, val : boolean) : void 
    {
        if(Id.val) RenderCommand.gl.uniform1i(RenderCommand.gl.getUniformLocation(Id.val, name), val ? 1 : 0); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    public static SetVec2f(Id : Ref<WebGLProgram | null>, name : string, val : glm.vec2) : void 
    {        
        if(Id.val) RenderCommand.gl.uniform2f(RenderCommand.gl.getUniformLocation(Id.val, name), val[0], val[1]); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }
    public static SetVec3f(Id : Ref<WebGLProgram | null>, name : string, val : glm.vec3) : void 
    {
        if(Id.val) RenderCommand.gl.uniform3f(RenderCommand.gl.getUniformLocation(Id.val, name), val[0], val[1], val[2]); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    public static SetVec4f(Id : Ref<WebGLProgram | null>, name : string, val : glm.vec4) : void 
    {
        if(Id.val) RenderCommand.gl.uniform4f(RenderCommand.gl.getUniformLocation(Id.val, name), val[0], val[1], val[2], val[3]); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    public static SetMat3f(Id : Ref<WebGLProgram | null>, name : string, val : glm.mat3) : void 
    {
        if(Id.val) RenderCommand.gl.uniformMatrix3fv(RenderCommand.gl.getUniformLocation(Id.val, name), false, val); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    public static SetMat4f(Id : Ref<WebGLProgram | null>, name : string, val : glm.mat4) : void 
    {
        if(Id.val) RenderCommand.gl.uniformMatrix4fv(RenderCommand.gl.getUniformLocation(Id.val, name), false, val); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    // Textures
    public static CreateTexture() : WebGLTexture 
    {
        const temp : WebGLTexture | null = RenderCommand.gl.createTexture();        
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create texture!");
    }
    public static BindTexture(Id : Ref<WebGLTexture>, type : TextureType, texUnit : number = 0) : void 
    {
        RenderCommand.gl.activeTexture(RenderCommand.gl.TEXTURE0 + texUnit);
        RenderCommand.gl.bindTexture(RenderCommand.ConvertTextureTypeToNative(type), Id.val);
    }
    public static UnBindTexture(type : TextureType, texUnit : number = 0) : void 
    {
        RenderCommand.gl.activeTexture(RenderCommand.gl.TEXTURE0 + texUnit);
        RenderCommand.gl.bindTexture(RenderCommand.ConvertTextureTypeToNative(type), null);
    }
    public static SetTexture2DArray(config : ImageConfig, data : Ref<Float32Array>) : void 
    {
        if(data instanceof HTMLImageElement) throw new Error("RenderCommand | Calling SetTexture2DArray on an image element!");
        // Initialize texture parameters
        RenderCommand.gl.texParameteri(RenderCommand.gl.TEXTURE_2D, RenderCommand.gl.TEXTURE_MIN_FILTER, RenderCommand.gl.LINEAR);
        RenderCommand.gl.texParameteri(RenderCommand.gl.TEXTURE_2D, RenderCommand.gl.TEXTURE_MAG_FILTER, RenderCommand.gl.LINEAR);
        RenderCommand.gl.texParameteri(RenderCommand.gl.TEXTURE_2D, RenderCommand.gl.TEXTURE_WRAP_S, RenderCommand.gl.CLAMP_TO_EDGE);
        RenderCommand.gl.texParameteri(RenderCommand.gl.TEXTURE_2D, RenderCommand.gl.TEXTURE_WRAP_T, RenderCommand.gl.CLAMP_TO_EDGE);
        // Set data.
        RenderCommand.gl.texImage2D(RenderCommand.ConvertTextureTypeToNative(config.TargetType), config.MipMapLevel, RenderCommand.ConvertImageChannelsToNative(config.NChannels), config.Width, config.Height, 0, RenderCommand.ConvertImageChannelsToNative(config.Format), RenderCommand.ConvertDataSizes(config.DataType), data.val);
        // RenderCommand.gl.texImage2D(RenderCommand.gl.TEXTURE_2D, config.MipMapLevel, RenderCommand.gl.RGBA32F, config.Width, config.Height, 0, RenderCommand.gl.RGBA, RenderCommand.gl.FLOAT, data.val);
    }  
    public static SetTexture2DImage(config : ImageConfig, data : HTMLImageElement) : void 
    {
        RenderCommand.gl.texImage2D(RenderCommand.ConvertTextureTypeToNative(config.TargetType), config.MipMapLevel, RenderCommand.ConvertImageChannelsToNative(config.NChannels), RenderCommand.ConvertImageChannelsToNative(config.Format), RenderCommand.ConvertDataSizes(config.DataType), data);
    }
    public static SetTextureCubeMapArray(config : ImageConfig, data : Ref<Float32Array>) : void 
    {
        if(data instanceof HTMLImageElement) throw new Error("RenderCommand | Calling SetTexture2DArray on an image element!");
        // Initialize texture parameters
        RenderCommand.gl.texParameteri(RenderCommand.gl.TEXTURE_CUBE_MAP, RenderCommand.gl.TEXTURE_MIN_FILTER, RenderCommand.gl.LINEAR);
        RenderCommand.gl.texParameteri(RenderCommand.gl.TEXTURE_CUBE_MAP, RenderCommand.gl.TEXTURE_MAG_FILTER, RenderCommand.gl.LINEAR);
        RenderCommand.gl.texParameteri(RenderCommand.gl.TEXTURE_CUBE_MAP, RenderCommand.gl.TEXTURE_WRAP_S, RenderCommand.gl.CLAMP_TO_EDGE);
        RenderCommand.gl.texParameteri(RenderCommand.gl.TEXTURE_CUBE_MAP, RenderCommand.gl.TEXTURE_WRAP_T, RenderCommand.gl.CLAMP_TO_EDGE);
        RenderCommand.gl.texParameteri(RenderCommand.gl.TEXTURE_CUBE_MAP, RenderCommand.gl.TEXTURE_WRAP_R, RenderCommand.gl.CLAMP_TO_EDGE);
        // Set data.
        for(let i = 0; i < 6; i++)
            RenderCommand.gl.texImage2D(RenderCommand.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, config.MipMapLevel, RenderCommand.ConvertImageChannelsToNative(config.NChannels), config.Width, config.Height, 0, RenderCommand.ConvertImageChannelsToNative(config.Format), RenderCommand.ConvertDataSizes(config.DataType), data.val);
        // RenderCommand.gl.texImage2D(RenderCommand.gl.TEXTURE_2D, config.MipMapLevel, RenderCommand.gl.RGBA32F, config.Width, config.Height, 0, RenderCommand.gl.RGBA, RenderCommand.gl.FLOAT, data.val);
    }  
    public static SetTextureCubeMapImage(config : ImageConfig, data : HTMLImageElement) : void 
    {
        RenderCommand.gl.texImage2D(RenderCommand.ConvertTextureTypeToNative(config.TargetType), config.MipMapLevel, RenderCommand.ConvertImageChannelsToNative(config.NChannels), RenderCommand.ConvertImageChannelsToNative(config.Format), RenderCommand.ConvertDataSizes(config.DataType), data);
    }
    public static GenerateMipMap(type : TextureType) : void 
    {
        RenderCommand.gl.generateMipmap(type);
    }
    public static DeleteTexture2D(Id : Ref<WebGLTexture | null>) : void 
    {
        RenderCommand.gl.deleteTexture(Id.val);
    }

    // Framebuffers
    public static CreateFramebuffer() : WebGLFramebuffer  
    {
        const temp : WebGLFramebuffer | null = RenderCommand.gl.createFramebuffer();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create framebuffer!");
    }
    public static BindFramebuffer(Id : Ref<WebGLFramebuffer | null>) : void
    {
        RenderCommand.gl.bindFramebuffer(RenderCommand.gl.FRAMEBUFFER, Id.val);
    }
    public static UnbindFramebuffer() : void
    {
        RenderCommand.gl.bindFramebuffer(RenderCommand.gl.FRAMEBUFFER, null);
    }
    public static SetFramebufferColorAttachment(targetTexture : Ref<WebGLTexture | null>, unit : number = 0) : void
    {
        const attachmentUnit = RenderCommand.gl.COLOR_ATTACHMENT0 + unit;
        RenderCommand.gl.framebufferTexture2D(RenderCommand.gl.FRAMEBUFFER, attachmentUnit, RenderCommand.gl.TEXTURE_2D, targetTexture.val, 0); 
        
        // Check for any errors.
        const status = RenderCommand.gl.checkFramebufferStatus(RenderCommand.gl.FRAMEBUFFER);
        if (status !== RenderCommand.gl.FRAMEBUFFER_COMPLETE) {
            console.error('Framebuffer is not complete: ' + status.toString(16));
        }    
    }
    public static SetFramebufferCubeMapColorAttachment(targetTexture : Ref<WebGLTexture | null>, cubeFace : number, unit : number = 0) : void
    {
        const attachmentUnit = RenderCommand.gl.COLOR_ATTACHMENT0 + unit;
        RenderCommand.gl.framebufferTexture2D(RenderCommand.gl.FRAMEBUFFER, attachmentUnit, RenderCommand.gl.TEXTURE_CUBE_MAP_POSITIVE_X + cubeFace, targetTexture.val, 0); 
        
        // Check for any errors.
        const status = RenderCommand.gl.checkFramebufferStatus(RenderCommand.gl.FRAMEBUFFER);
        if (status !== RenderCommand.gl.FRAMEBUFFER_COMPLETE) {
            console.error('Framebuffer is not complete: ' + status.toString(16));
        }    
    }
    public static DrawFramebuffer(attachments : ColorAttachments[]) : void 
    {
        var temp : Array<number> = new Array<number>();
        for(const a of attachments) 
        {
            temp.push(RenderCommand.ConvertColorAttachmentsToNative(a));
        }
        
        RenderCommand.gl.drawBuffers(temp);
    }

    public static DeleteFramebuffer(FBO : Ref<WebGLFramebuffer | null>) 
    {
        if(!FBO) console.warn("RenderCommand | Attempting to delete a null framebuffer!");
        RenderCommand.gl.deleteFramebuffer(FBO.val);        
    }

    // Renderbuffers
    public static CreateRenderbuffer() : WebGLRenderbuffer 
    {
        const temp : WebGLRenderbuffer | null = RenderCommand.gl.createRenderbuffer();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create renderbuffer!");
    }
    public static BindRenderbuffer(Id : Ref<WebGLRenderbuffer | null>) : void 
    {
        if(!Id) return;
        RenderCommand.gl.bindRenderbuffer(RenderCommand.gl.RENDERBUFFER, Id.val);
    }
    public static SetRenderbufferDepthAttachment(RBO : Ref<WebGLRenderbuffer | null>, FBO: Ref<WebGLFramebuffer | null>, config : ImageConfig) : void 
    {
        RenderCommand.gl.renderbufferStorage(RenderCommand.gl.RENDERBUFFER, RenderCommand.gl.DEPTH_COMPONENT16, config.Width, config.Height);
        RenderCommand.BindFramebuffer(FBO);
        RenderCommand.BindRenderbuffer(RBO);
        RenderCommand.gl.framebufferRenderbuffer(RenderCommand.gl.FRAMEBUFFER, RenderCommand.gl.DEPTH_ATTACHMENT, RenderCommand.gl.RENDERBUFFER, RBO.val);
        RenderCommand.UnbindFramebuffer();
    }
    public static UnbindRenderbuffer() : void 
    {
        RenderCommand.gl.bindRenderbuffer(RenderCommand.gl.RENDERBUFFER, null);
    } 

    public static DeleteRenderBuffer(RBO : Ref<WebGLRenderbuffer | null>) 
    {
        if(!RBO) console.warn("RenderCommand | Attempting to delete a null renderbuffer!");
        RenderCommand.gl.deleteRenderbuffer(RBO.val);        
    }

    public static ReadFramebufferResults(buffer : {value: Uint8Array}) : void 
    {        
    }


    // Rendering

    public static SetViewportDimensions(width : number, height : number) : void 
    {
        RenderCommand.gl.viewport(0, 0, width, height);
    }

    public static EnableDepthTest(b : boolean) : void
    {
        b ? RenderCommand.gl.enable(RenderCommand.gl.DEPTH_TEST) : RenderCommand.gl.disable(RenderCommand.gl.DEPTH_TEST);
    }

    public static EnableAdditiveBlending(b : boolean) : void
    {
        b ? RenderCommand.gl.enable(RenderCommand.gl.BLEND) : RenderCommand.gl.disable(RenderCommand.gl.BLEND);
    }
    public static SetBlendFunc(a : BlendFunctionTypes, b : BlendFunctionTypes) : void
    {
        RenderCommand.gl.blendFunc(RenderCommand.ConvertBlendFunctionTypes(a), RenderCommand.ConvertBlendFunctionTypes(b));
    }
    public static SetDepthFunc(e : FunctionEquationTypes) : void
    {
        RenderCommand.gl.depthFunc(RenderCommand.ConvertFunctionEquationTypes(e));
    }
    public static SetBlendEquation(e : FunctionEquationTypes) : void
    {
        RenderCommand.gl.blendEquation(RenderCommand.ConvertFunctionEquationTypes(e));
    }
    
    public static SetClearColor(color : glm.vec4) : void
    {
        RenderCommand.gl.clearColor(color[0], color[1], color[2], color[3]);
    }

    public static ClearColorBufferBit(b : boolean) : void 
    {
        b ? RenderCommand.gl.clear(RenderCommand.gl.COLOR_BUFFER_BIT) : null;
    }
    public static ClearDepthBufferBit(b : boolean) : void 
    {
        b ? RenderCommand.gl.clear(RenderCommand.gl.DEPTH_BUFFER_BIT) : null;
    }

    // Draw Commands
    public static Draw(shape : GeometryDrawFunctionShapes, nVertices : number) : void 
    {
        switch(shape) // This switch statement is a bit redundant at the moment but I think we'll have to change some of the parameters for other shapes. 
        {
            case GeometryDrawFunctionShapes.TRIANGLES: RenderCommand.gl.drawArrays(RenderCommand.ConvertShapeToNativeShape(shape), 0, nVertices); break; 
            case GeometryDrawFunctionShapes.TRIANGLES_STRIP: RenderCommand.gl.drawArrays(RenderCommand.ConvertShapeToNativeShape(shape), 0, nVertices); break;
        }        
    }
    public static DrawIndexed(shape : GeometryDrawFunctionShapes, count : number, offset : number) : void
    {
        RenderCommand.gl.drawElements(RenderCommand.ConvertShapeToNativeShape(shape), count, RenderCommand.gl.UNSIGNED_SHORT, offset);        
    }
    public static DrawMesh(mesh : Mesh) : void
    {
        var VAO = mesh.GetGeometry().vertexArray;
        var EBO = VAO.GetIndexBuffer();
        var shader = mesh.GetMaterial().GetShader();

        // Bind the vertex array object and shader program.
        RenderCommand.BindVertexArray(VAO.GetId());
        RenderCommand.UseShader(shader.GetId());

        // Make the correct draw call.
        switch(mesh.GetGeometry().drawFunction.type) 
        {
            case GeometryDrawFunctionTypes.DRAW_ARRAYS: RenderCommand.Draw(mesh.GetGeometry().drawFunction.shape, VAO.GetVertexBuffer().GetVerticesCount()); break;
            case GeometryDrawFunctionTypes.DRAW_ARRAYS_INDEXED: if(EBO) RenderCommand.DrawIndexed(mesh.GetGeometry().drawFunction.shape, EBO.GetUniqueSize() / EBO.GetUniqueIndices().BYTES_PER_ELEMENT , EBO.GetUniqueOffset()); break; 
        };
        

        // Cleanup.
        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Index);
        RenderCommand.ReleaseShader();
    }
    public static DrawGeometry(geo : Geometry, shader : Shader) : void
    {
        var VAO = geo.vertexArray;
        var EBO = VAO.GetIndexBuffer();

        // Bind the vertex array object and shader program.
        RenderCommand.BindVertexArray(VAO.GetId());
        RenderCommand.UseShader(shader.GetId());

        // Make the correct draw call.
        if(EBO) RenderCommand.DrawIndexed(geo.drawFunction.shape, EBO.GetUniqueSize() / EBO.GetUniqueIndices().BYTES_PER_ELEMENT , EBO.GetUniqueOffset());
    
        // Cleanup.
        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Index);
        RenderCommand.ReleaseShader();
    }

    //----------------------------------------------------------------
    // Convertion Functions.
    //----------------------------------------------------------------

    private static ConvertShaderType(type : ShaderType) : number 
    {
        switch(type) 
        {
            case ShaderType.Vertex: return RenderCommand.gl.VERTEX_SHADER; 
            case ShaderType.Fragment: return RenderCommand.gl.FRAGMENT_SHADER; 
        }
    }

    // Returns the WebGL type equivalent of our "ShaderDataType".
    private static ConvertShaderTypeToNative(type: ShaderDataType) : number 
    {
        switch(type) 
        {
            case ShaderDataType.Float:      return RenderCommand.gl.FLOAT;
            case ShaderDataType.Float2:     return RenderCommand.gl.FLOAT;
            case ShaderDataType.Float3:     return RenderCommand.gl.FLOAT;
            case ShaderDataType.Float4:     return RenderCommand.gl.FLOAT;
            case ShaderDataType.Mat3f:      return RenderCommand.gl.FLOAT;
            case ShaderDataType.Mat4f:      return RenderCommand.gl.FLOAT;
            case ShaderDataType.Int:        return RenderCommand.gl.INT;
            case ShaderDataType.Int2:       return RenderCommand.gl.INT;
            case ShaderDataType.Int3:       return RenderCommand.gl.INT;
            case ShaderDataType.Int4:       return RenderCommand.gl.INT;
            case ShaderDataType.Bool:       return RenderCommand.gl.BOOL;
        }
        console.warn("GetShaderDataType() | Type is unknown! Returning 0!");
        return 0;
    }

    private static ConvertTextureTypeToNative(type : TextureType) : number 
    {
        switch(type) 
        {
            case TextureType.Tex2D: return RenderCommand.gl.TEXTURE_2D;
            case TextureType.CubeTex: return RenderCommand.gl.TEXTURE_CUBE_MAP;
        }

        return 0;
    }

    private static ConvertImageChannelsToNative(type : ImageChannels) : number 
    {
        switch(type) 
        {
            case ImageChannels.RGB: return RenderCommand.gl.RGB;
            case ImageChannels.RGBA: return RenderCommand.gl.RGBA;
            case ImageChannels.RGBA32F: return RenderCommand.gl.RGBA32F;
        }

        return 0;
    }
    private static ConvertDataSizes(size : DataSizes) : number 
    {
        switch(size) 
        {
            case DataSizes.FLOAT: return RenderCommand.gl.FLOAT;
            case DataSizes.UCHAR: return RenderCommand.gl.UNSIGNED_BYTE;
        }

        return 0;
    }

    private static ConvertShapeToNativeShape(shape : GeometryDrawFunctionShapes) : number 
    {
        switch(shape) 
        { 
            case GeometryDrawFunctionShapes.TRIANGLES: return RenderCommand.gl.TRIANGLES;
            case GeometryDrawFunctionShapes.TRIANGLES_STRIP: return RenderCommand.gl.TRIANGLE_STRIP;
            case GeometryDrawFunctionShapes.POINTS: return RenderCommand.gl.POINTS;
            case GeometryDrawFunctionShapes.LINES: return RenderCommand.gl.LINES;
        }

        return 0;
    }
    private static ConvertColorAttachmentsToNative(ca : ColorAttachments) : number 
    {
        switch(ca) 
        { 
            case ColorAttachments.COLOR_0: return RenderCommand.gl.COLOR_ATTACHMENT0;
            case ColorAttachments.COLOR_1: return RenderCommand.gl.COLOR_ATTACHMENT1;
        }

        return 0;
    }
    private static ConvertBlendFunctionTypes(type : BlendFunctionTypes) : number 
    {
        switch(type) 
        { 
            case BlendFunctionTypes.ONE: return RenderCommand.gl.ONE;
        }

        return 0;
    }
    private static ConvertFunctionEquationTypes(type : FunctionEquationTypes) : number 
    {
        switch(type) 
        { 
            case FunctionEquationTypes.FUNC_ADD: return RenderCommand.gl.FUNC_ADD;
            case FunctionEquationTypes.LEQUAL: return RenderCommand.gl.LEQUAL;
            case FunctionEquationTypes.EQUAL: return RenderCommand.gl.EQUAL;
        }

        return 0;
    }


};