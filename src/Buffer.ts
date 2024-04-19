import {RenderCommand, BufferType} from "./RenderCommand";
import { GetShaderDataType, GetShaderDataTypeCount, Ref, ShaderDataType } from "./Types";

interface Buffer {
    Init() : void;
};


//============================================================================
// Vertex Buffer
//============================================================================

export class BufferAttribute 
{   
    constructor(type : ShaderDataType, name : string, ) 
    {
        this.Type = type;
        this.Name = name;
        this.Size = GetShaderDataType(this.Type);
        this.Count = GetShaderDataTypeCount(this.Type);
    }

    public Type : ShaderDataType;
    public Name : string;
    public Offset !: number; // We need more context about the overall BufferAttribLayout in order to define its offset in the layout, so we'll promise the compiler that it will eventually be defined, and before we attempt to access it.
    public Size : number;
    public Count : number;
}


export class BufferAttribLayout
{
    constructor(elements : Array<BufferAttribute>) 
    {
        this.attributes = this.attributes.concat(elements);
        this.CalculateStrideAndOffsets();
        this.CaclulateAttributesSize();
    }

    public attributes : Array<BufferAttribute> = []; 
    public size : number = 0;
    public stride : number = 0;

    public PushElement(element : BufferAttribute) : void 
    {
        this.attributes.push(element);
        this.CalculateStrideAndOffsets();
        this.CaclulateAttributesSize();
    }

    public PushElementArray(elements : Array<BufferAttribute>) : void 
    {
        this.attributes = this.attributes.concat(elements);
        this.CalculateStrideAndOffsets();
        this.CaclulateAttributesSize();
    }

    private CalculateStrideAndOffsets() : void 
    {
        var offset : number = 0;
        for(const element of this.attributes) 
        {
            element.Offset = offset;
            offset += element.Size;
            this.stride += element.Size;
        }
    }

    private CaclulateAttributesSize() : void 
    {
        for(const atttrib of this.attributes) 
        {
            this.size += atttrib.Size;
        }

    }   

    // Getters
    public GetAttributes() : Array<BufferAttribute> { return this.attributes; }
}

export class VertexBuffer implements Buffer
{
    constructor(vertices : Float32Array)
    {
        this.uniqueVertexData = vertices;
        
        // Cache new vertex data into a single shared Float32Array.
        var temp = new Float32Array(VertexBuffer.cachedVertexData.length + this.uniqueVertexData.length);
        temp.set(VertexBuffer.cachedVertexData, 0);
        temp.set(this.uniqueVertexData, VertexBuffer.cachedVertexData.length);
        VertexBuffer.cachedVertexData = temp;
    }

    // Getters
    public GetUniqueLayout() : BufferAttribLayout { return this.uniqueLayout; } 
    public GetUniqueVertexData() : Float32Array { return this.uniqueVertexData; } 
    public GetUniqueOffset() : number { return this.uniqueOffset; } 
    public GetUniqueSize() : number { return this.uniqueSize; } 
    public GetVerticesCount() : number { return this.nUniqueVertices; } 

    // Setters
    public SetLayout(layout : BufferAttribLayout) : void { 

        // Set the layout of our updated cached vertex data;
        this.uniqueLayout = layout;

        // Update existing layout properties to reflect the new layout.
        this.uniqueSize = this.uniqueVertexData.length * this.uniqueVertexData.BYTES_PER_ELEMENT
        this.uniqueOffset = VertexBuffer.cachedSize;
        this.nUniqueVertices = this.uniqueSize / this.uniqueLayout.size;
                
        VertexBuffer.cachedSize += this.uniqueSize;
        this.PushLayoutToBuffer();
        this.Init();        
    }

    public PushLayoutToBuffer() : void 
    {
        VertexBuffer.cachedLayout.concat(this.uniqueLayout); 
    }

    
    public static Id : Ref<WebGLBuffer | null> = {val: null}
    public static cachedVertexData : Float32Array = new Float32Array();
    public static cachedLayout : Array<BufferAttribLayout> = new Array<BufferAttribLayout>();
    public static cachedSize : number = 0;
    
    private nUniqueVertices !: number;
    private uniqueLayout !: BufferAttribLayout;
    private uniqueVertexData : Float32Array;
    private uniqueSize : number = 0
    private uniqueOffset : number = 0;

    Init() : void
    {
        // Only create a new buffer if one doesn't exist already.
        if(!VertexBuffer.Id.val)
            VertexBuffer.Id = {val: RenderCommand.CreateBuffer()};

        RenderCommand.BindBuffer(VertexBuffer.Id, BufferType.Vertex);
        RenderCommand.SetVertexBufferData(VertexBuffer.Id, VertexBuffer.cachedVertexData);
        RenderCommand.UnbindBuffer(BufferType.Vertex);
    }

    Resize() : void 
    {

    }
};


//============================================================================
// Index Buffer
//============================================================================

export class IndexBuffer implements Buffer  
{
    constructor(indices : Uint16Array) {
        this.uniqueIndices = indices;
        this.uniqueOffset = IndexBuffer.cachedSize;
        this.uniqueSize = this.uniqueIndices.length * 2; // 16 bits = 2 bytes.

        var temp = new Uint16Array(IndexBuffer.cachedIndices.length + this.uniqueIndices.length);
        temp.set(IndexBuffer.cachedIndices, 0);
        temp.set(this.uniqueIndices, IndexBuffer.cachedIndices.length);

        IndexBuffer.cachedIndices = temp;
        IndexBuffer.cachedSize = IndexBuffer.cachedIndices.length * 2; // 16 bits = 2 bytes.
        
        this.Init();
    }

    // Getters
    public GetUniqueIndices() : Uint16Array { return this.uniqueIndices; }
    public GetUniqueOffset() : number { return this.uniqueOffset; }
    public GetUniqueSize() : number { return this.uniqueSize; }

    public static cachedIndices : Uint16Array = new Uint16Array();
    public static cachedSize : number = 0;
    public static Id : Ref<WebGLBuffer | null> = {val: null}

    private uniqueIndices : Uint16Array;
    private uniqueOffset : number;
    private uniqueSize : number;

    Init() : void
    {
        if(!IndexBuffer.Id.val) IndexBuffer.Id.val = RenderCommand.CreateBuffer();

        RenderCommand.BindBuffer(IndexBuffer.Id, BufferType.Index);
        RenderCommand.SetIndexBufferData(IndexBuffer.Id, IndexBuffer.cachedIndices);
        RenderCommand.UnbindBuffer(BufferType.Index);
    }
};
