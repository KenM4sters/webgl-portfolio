import { VertexBuffer, IndexBuffer } from "./Buffer";
import { BufferType, RenderCommand } from "./RenderCommand";
import { Ref } from "./Types";


export default class VertexArray 
{
    constructor(vBuffer : VertexBuffer, iBuffer : IndexBuffer | null = null) 
    {
        this.vertexBuffer = vBuffer;
        this.indexBuffer = iBuffer;
        this.Init();
    } 
    
    // Getters
    GetId() : Ref<WebGLVertexArrayObject | null> { return this.Id; }
    GetVertexBuffer() : VertexBuffer { return this.vertexBuffer; }
    GetIndexBuffer() : IndexBuffer | null { return this.indexBuffer; }

    private Id : Ref<WebGLVertexArrayObject | null> = {val: null};
    private vertexBuffer : VertexBuffer; 
    private indexBuffer : IndexBuffer | null = null;

    Init() : void 
    {
        this.Id = {val: RenderCommand.CreateVertexArray()};
        RenderCommand.BindVertexArray(this.Id);
        RenderCommand.BindBuffer(VertexBuffer.Id, BufferType.Vertex);
        if(this.indexBuffer)
            RenderCommand.BindBuffer(IndexBuffer.Id, BufferType.Index);
 
        var layoutLoc = 0;
        for(const attrib of this.vertexBuffer.GetUniqueLayout().GetAttributes()) 
        {
            var uniqueLayout = this.vertexBuffer.GetUniqueLayout();
            var layoutOffset = VertexBuffer.cachedSize - (this.vertexBuffer.GetUniqueVertexData().length * this.vertexBuffer.GetUniqueVertexData().BYTES_PER_ELEMENT); // computes the offset due to preceding layouts.
            
            RenderCommand.SetVertexArrayAttribute(layoutLoc, attrib.Count, attrib.Type, uniqueLayout.stride, layoutOffset + attrib.Offset); // Remember to add the unique offset of the attribute itself to the layout offset.
            RenderCommand.EnableVertexArray(layoutLoc); // Don't forget to enable the layout location.
            layoutLoc++;
        }

        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Vertex);
        if(this.indexBuffer)
            RenderCommand.UnbindBuffer(BufferType.Index);
    }
};