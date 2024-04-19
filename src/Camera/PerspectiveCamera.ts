import * as glm from "gl-matrix";

export enum CameraDirections  
{
    FORWARD,
    BACKWARD,
    LEFT,
    RIGHT,
    UP,
    DOWN
};

export default class PerspectiveCamera 
{
    constructor(pos : glm.vec3, w : number, h : number) 
    {
        this.position = pos;
        this.UpdateProjectionMatrix(w, h);
        this.UpdateViewMatrix();
    }

    public UpdateViewMatrix() : void 
    {
        glm.mat4.lookAt(this.viewMatrix, this.position, glm.vec3.add(glm.vec3.create(), this.position, this.front), this.up);
    }

    public UpdateProjectionMatrix(w : number, h : number) : void 
    {
        glm.mat4.perspective(this.projectionMatrix, glm.glMatrix.toRadian(this.fov), w/h, 0.1, 1000);
    }

    // Modifies the camera position and updates the view matrix - Apologies in advance for the absolutely disgusting syntax (blame TS).
    public ProcessUserInput(dir : CameraDirections, dt : number) : void 
    {
        // Nothing ontoward is actually going on here - it's just a lot of namespaces and strange functions that output new variables instead of changing
        // the inputs. We set the position to add the direction vector but scaled down by the delta time (*movementSpeed because it's a little too slow). That's it.
        if(dir == CameraDirections.FORWARD)  this.position = glm.vec3.add(glm.vec3.create(), this.position, glm.vec3.scale(glm.vec3.create(), {...this.front}, dt*this.movementSpeed));
        if(dir == CameraDirections.BACKWARD) this.position = glm.vec3.add(glm.vec3.create(), this.position, glm.vec3.negate(glm.vec3.create(), glm.vec3.scale(glm.vec3.create(), {...this.front}, dt*this.movementSpeed)));
        if(dir == CameraDirections.LEFT)     this.position = glm.vec3.add(glm.vec3.create(), this.position, glm.vec3.negate(glm.vec3.create(), glm.vec3.scale(glm.vec3.create(), {...this.right}, dt*this.movementSpeed)));
        if(dir == CameraDirections.RIGHT)    this.position = glm.vec3.add(glm.vec3.create(), this.position, glm.vec3.scale(glm.vec3.create(), {...this.right}, dt*this.movementSpeed));
        if(dir == CameraDirections.UP)       this.position = glm.vec3.add(glm.vec3.create(), this.position, glm.vec3.scale(glm.vec3.create(), {...this.up}, dt*this.movementSpeed));
        if(dir == CameraDirections.DOWN)     this.position = glm.vec3.add(glm.vec3.create(), this.position, glm.vec3.negate(glm.vec3.create(), glm.vec3.scale(glm.vec3.create(), {...this.up}, dt*this.movementSpeed)));

        this.UpdateViewMatrix(); // This must be called if you want objects to properly be updated in the viewport.        
    }

    // Getters.
    public GetProjectionMatrix() : glm.mat4 { return this.projectionMatrix; }
    public GetViewMatrix() : glm.mat4 { return this.viewMatrix; }

    public ResetFOV(fov : number, w: number, h : number) : void 
    { 
        this.fov = fov; this.UpdateProjectionMatrix(w, h); 
    }


    public position : glm.vec3;
    
    private front : glm.vec3 = [0.0, 0.0, -1.0];
    private up : glm.vec3 = [0.0, 1.0, 0.0];
    private right : glm.vec3 = [1.0, 0.0, 0.0];
    private fov : number = 45;
    private movementSpeed : number = 2.0;

    private projectionMatrix : glm.mat4 = glm.mat4.create();
    private viewMatrix : glm.mat4 = glm.mat4.create();
};