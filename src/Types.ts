

//----------------------------------------------------------------
// Global
//----------------------------------------------------------------

import Framebuffer from "./Framebuffer";

export class Ref <T> 
{
    constructor(public val: T) {}
}

//----------------------------------------------------------------
// Geometry
//----------------------------------------------------------------

export interface GeometryDrawFunction 
{
    type  : GeometryDrawFunctionTypes,
    shape : GeometryDrawFunctionShapes
}

export enum GeometryDrawFunctionTypes 
{
    DRAW_ARRAYS,
    DRAW_ARRAYS_INDEXED,
    DRAW_ARRAYS_INSTANCED,
};

export enum GeometryDrawFunctionShapes 
{
    TRIANGLES,
    TRIANGLES_STRIP,
    LINES,
    POINTS
};

export interface GeometryDrawFunction 
{
    type  : GeometryDrawFunctionTypes,
    shape : GeometryDrawFunctionShapes
}


//----------------------------------------------------------------
// Shaders
//----------------------------------------------------------------

export enum ShaderType 
{
    Vertex,
    Fragment
}

export enum ShaderDataType 
{
    None = 0, Float, Float2, Float3, Float4, Mat3f, Mat4f, Int, Int2, Int3, Int4, Bool
}

//----------------------------------------------------------------
// Textures
//----------------------------------------------------------------

export enum TextureType 
{
    Tex2D,
    CubeTex 
}

export enum ImageChannels 
{
    RGB,
    RGBA,
    RGBA32F
}

export interface ImageConfig {
    TargetType : number;
    MipMapLevel : number;
    NChannels : number;
    Width : number;
    Height : number;
    Format : number;
    DataType : number;
};

export enum DataSizes 
{
    FLOAT,
    UCHAR
}

//----------------------------------------------------------------
// Framebuffers
//----------------------------------------------------------------


export enum FramebufferBits 
{
    DEPTH_BIT,
    COLOR_BIT,
};

export enum ColorAttachments 
{
    COLOR_0,
    COLOR_1
};

export enum BlendFunctionTypes 
{
    ONE
};

export enum FunctionEquationTypes 
{
    FUNC_ADD,
    LEQUAL,
    EQUAL
};

export interface RenderConfig 
{
    DepthTest : boolean;
    ClearColorBit : boolean;
    ClearDepthBit : boolean;
};

export interface RenderTarget 
{
    target : Framebuffer | null,
    config : RenderConfig;
};

// Some utility functions to convert types into sizes.

// Returns the size of a given shader type in bytes.
export function GetShaderDataType(type: ShaderDataType) : number 
{
    switch(type) 
    {
        case ShaderDataType.Float:      return 4;
        case ShaderDataType.Float2:     return 4 * 2;
        case ShaderDataType.Float3:     return 4 * 3;
        case ShaderDataType.Float4:     return 4 * 4;
        case ShaderDataType.Mat3f:      return 4 * 3 * 3;
        case ShaderDataType.Mat4f:      return 4 * 4 * 4;
        case ShaderDataType.Int:        return 4;
        case ShaderDataType.Int2:       return 4 * 2;
        case ShaderDataType.Int3:       return 4 * 3;
        case ShaderDataType.Int4:       return 4 * 4;
        case ShaderDataType.Bool:       return 1;
    }
    console.warn("GetShaderDataType() | Type is unknown! Returning 0!");
    return 0;
}

// Returns the number of elements of a given shader type.
export function GetShaderDataTypeCount(type: ShaderDataType) : number 
{
    switch(type) 
    {
        case ShaderDataType.Float:      return 1;
        case ShaderDataType.Float2:     return 2;
        case ShaderDataType.Float3:     return 3;
        case ShaderDataType.Float4:     return 4;
        case ShaderDataType.Mat3f:      return 3*3;
        case ShaderDataType.Mat4f:      return 4*4;
        case ShaderDataType.Int:        return 1;
        case ShaderDataType.Int2:       return 2;
        case ShaderDataType.Int3:       return 3;
        case ShaderDataType.Int4:       return 4;
        case ShaderDataType.Bool:       return 1;
    }
    console.warn("GetShaderDataType() | Type is unknown! Returning 0!");
    return 0;
}