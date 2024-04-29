import { BufferAttribLayout, BufferAttribute, IndexBuffer, VertexBuffer } from "./Buffer";
import { GeometryDrawFunction, GeometryDrawFunctionShapes, GeometryDrawFunctionTypes, ShaderDataType } from "./Types";
import { CUBE_VERTICES_COMPLETE, LARGE_SQUARE_VERTCES_COMPLETE, SQUARE_INDICES } from "./Primitives";
import VertexArray from "./VertexArray";
import { log } from "three/examples/jsm/nodes/Nodes.js";


export abstract class Geometry 
{
    constructor() {}

    public vertexArray !: VertexArray;
    public drawFunction : GeometryDrawFunction = {
        type: GeometryDrawFunctionTypes.DRAW_ARRAYS,
        shape : GeometryDrawFunctionShapes.TRIANGLES
    };
};


export class SquareGeometry extends Geometry
{
    constructor() 
    {
        super();
        
        const vertices = LARGE_SQUARE_VERTCES_COMPLETE;
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
            new BufferAttribute(ShaderDataType.Float3, "aNormal"),
            new BufferAttribute(ShaderDataType.Float2, "aUV")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);
        var EBO = new IndexBuffer(SQUARE_INDICES);
        this.drawFunction.type = GeometryDrawFunctionTypes.DRAW_ARRAYS_INDEXED;
        this.vertexArray = new VertexArray(VBO, EBO);
    }
};
export class CustomGeometry extends Geometry
{
    constructor(vertices : Float32Array, attributes : BufferAttribute[] = []) 
    {
        super();

        var elements : BufferAttribute[];
        if(!attributes.length) 
        {
            elements = new Array<BufferAttribute>(
                new BufferAttribute(ShaderDataType.Float3, "aPosition"),
                new BufferAttribute(ShaderDataType.Float3, "aNormal"),
                new BufferAttribute(ShaderDataType.Float2, "aUV")
            );
        } else 
        {
            elements = attributes;
        }

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);
        var EBO = new IndexBuffer(SQUARE_INDICES);
        this.drawFunction.type = GeometryDrawFunctionTypes.DRAW_ARRAYS_INDEXED;
        this.vertexArray = new VertexArray(VBO, EBO);
    }
};

export class CubeGeometry extends Geometry
{
    constructor() 
    {
        super();
        
        const vertices = CUBE_VERTICES_COMPLETE;
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
            new BufferAttribute(ShaderDataType.Float3, "aNormal"),
            new BufferAttribute(ShaderDataType.Float2, "aUV")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);
        // var EBO = new IndexBuffer(CUBE_INDICES);

        this.vertexArray = new VertexArray(VBO);
    }
};

export class SphereGeometry extends Geometry
{
    constructor(radius : number, latBands : number, lonBands : number) 
    {
        super();
        
        const data = GenerateCompleteSphere(radius, latBands, lonBands);
        const vertices = data.vertices;
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
            new BufferAttribute(ShaderDataType.Float3, "aNormal"),
            new BufferAttribute(ShaderDataType.Float2, "aUV")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);
        var EBO = new IndexBuffer(data.indices);
        this.drawFunction.type = GeometryDrawFunctionTypes.DRAW_ARRAYS_INDEXED;
        this.vertexArray = new VertexArray(VBO, EBO);
    }
};

export class PlaneGeometry extends Geometry
{
    constructor(width : number, height: number, wSegments : number, hSegments : number) 
    {
        super();
        
        const data = GenerateCompletePlane(width, height, wSegments, hSegments);
        const vertices = data.vertices;
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
            new BufferAttribute(ShaderDataType.Float3, "aNormal"),
            new BufferAttribute(ShaderDataType.Float2, "aUV")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);
        var EBO = new IndexBuffer(data.indices);
        this.drawFunction.type = GeometryDrawFunctionTypes.DRAW_ARRAYS_INDEXED;
        this.vertexArray = new VertexArray(VBO, EBO);
    }
};


export class PointsGeometry extends Geometry
{
    constructor(vertices : Float32Array) 
    {
        super();
        
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);

        this.vertexArray = new VertexArray(VBO);
    }
};
export class LinesGeometry extends Geometry
{
    constructor(vertices : Float32Array) 
    {
        super();
        
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);
 
        this.vertexArray = new VertexArray(VBO);
    }
};



export function GenerateCompleteSphere(radius: number, stackCount: number, sectorCount: number): { vertices: Float32Array, indices: Uint16Array } {
    const vert: number[] = [];
    const ind: number[] = [];

    let x, y, z, xy, nx, ny, nz, s, t, i, j, k, k1, k2, ii, jj, kk = 0;
    const lengthInv = 1.0 / radius;
    const sectorStep = 2 * Math.PI / sectorCount;
    const stackStep = Math.PI / stackCount;
    let offset = 0;

    for (i = 0; i <= stackCount; ++i) {
        const stackAngle = Math.PI / 2 - i * stackStep; // starting from pi/2 to -pi/2
        xy = radius * Math.cos(stackAngle); // r * cos(u)
        z = radius * Math.sin(stackAngle); // r * sin(u)

        for (j = 0; j <= sectorCount; ++j) {
            const sectorAngle = j * sectorStep; // starting from 0 to 2pi

            // Vertex position
            x = xy * Math.cos(sectorAngle); // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle); // r * cos(u) * sin(v)

            // r * sin(u)
            vert.push(x);
            vert.push(y);
            vert.push(z);

            // Normalized vertex normal
            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            vert.push(nx);
            vert.push(ny);
            vert.push(nz);

            // Vertex tex coord between [0, 1]
            s = j / sectorCount;
            t = i / stackCount;
            vert.push(s);
            vert.push(t);

            // next
            offset += 3;
            offset += 3;
            offset += 2;
        }
    }

    for(i=0; i < stackCount; ++i)
        {
            k1 = i * (sectorCount + 1);            // beginning of current stack
            k2 = k1 + sectorCount + 1;             // beginning of next stack

            for(j=0; j < sectorCount; ++j, ++k1, ++k2)
            {
                // 2 triangles per sector excluding 1st and last stacks
                if(i != 0)
                {
                    ind[kk] = (k1);  // k1---k2---k1+1
                    ind[kk+1] = (k2);  // k1---k2---k1+1
                    ind[kk+2] = (k1+1);  // k1---k2---k1+1
                    kk += 3;
                }

                if(i != (stackCount-1))
                {
                    ind[kk] = (k1+1);  // k1---k2---k1+1
                    ind[kk+1] = (k2);  // k1---k2---k1+1
                    ind[kk+2] = (k2+1);  // k1---k2---k1+1
                    kk += 3;
                }
            }
        }
    

    const vertices = new Float32Array(vert);
    const indices = new Uint16Array(ind);

    return { vertices, indices };
}


export function GenerateCompletePlane(w : number, h : number, wSegments : number, hSegments : number) : {vertices : Float32Array, indices : Uint16Array}
{
    const vert: number[] = [];
    const ind: number[] = [];

    const segmentWidth = w / wSegments;
    const segmentHeight = h / hSegments;

    for (let y = 0; y <= hSegments; y++) {
        for (let x = 0; x <= wSegments; x++) {
            const u = x / wSegments;
            const v = y / hSegments;
            const posX = u * w - w / 2; // Center the plane
            const posZ = v * h - h / 2; // Center the plane
            vert.push(posX, 0.0, posZ);
            vert.push(0.0, 1.0, 0.0);

            // Store UV coordinates
            // vert.push(x % 2 ? 0.0 : 1.0);
            // vert.push(y % 2 ? 0.0 : 1.0);
            vert.push(u);
            vert.push(v);
        }
    }
    
    for (let y = 0; y < hSegments; y++) {
        for (let x = 0; x < wSegments; x++) {
            const v0 = y * (wSegments + 1) + x;
            const v1 = v0 + 1;
            const v2 = (y + 1) * (wSegments + 1) + x;
            const v3 = v2 + 1;

            ind.push(v0, v1, v2);
            ind.push(v1, v3, v2);
        }
    }

    const vertices = new Float32Array(vert);
    const indices = new Uint16Array(ind);
    
    return {vertices, indices};
}