import * as glm from 'gl-matrix';

export default abstract class Component
{
    constructor() {}
};

export class GeometryComponent extends Component 
{
    constructor() {
        super();
    }
}
export class MaterialComponent extends Component 
{
    constructor() {
        super();
    }
}
export class LightComponent extends Component 
{
    constructor() {
        super();
    }
}
export class TransformComponent extends Component 
{
    constructor() {
        super();
    }

    ModelMatrix : glm.mat4 = glm.mat4.create();
}
export class CameraComponent extends Component 
{
    constructor() {
        super();
    }
}
