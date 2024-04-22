import { BufferAttribLayout, BufferAttribute, IndexBuffer, VertexBuffer } from "./Buffer";
import { GeometryDrawFunction, GeometryDrawFunctionShapes, GeometryDrawFunctionTypes, ShaderDataType } from "./Types";
import { CUBE_VERTICES_COMPLETE, LARGE_SQUARE_VERTCES_COMPLETE, SQUARE_INDICES } from "./Primitives";
import VertexArray from "./VertexArray";


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


// export function GenerateSphereIndices(latBands : number, longBands : number) : Uint16Array 
// {
//     const i = [];
//     for (let lat = 0; lat < latBands; lat++) {
//         for (let lon = 0; lon < longBands; lon++) {
//             const first = (lat * (longBands + 1)) + lon;
//             const second = first + longBands + 1;
//             i.push(first);
//             i.push(second);
//             i.push(first + 1);

//             i.push(second);
//             i.push(second + 1);
//             i.push(first + 1);
//         }
//     }

//     const indices = new Uint16Array(i.length);
//     indices.set(i, 0);

//     return indices;
// }