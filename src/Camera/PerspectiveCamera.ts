import * as glm from "gl-matrix";
import { Animator } from "../Frontend";
import { Ref } from "../Types";
import AppStateListener, { ApplicationStates } from "../AppStateListener";

export enum CameraDirections  
{
    FORWARD,
    BACKWARD,
    LEFT,
    RIGHT,
    UP,
    DOWN
};

export default class PerspectiveCamera extends AppStateListener
{
    constructor(pos : glm.vec3, w : number, h : number) 
    {
        super();
        this.position = pos;
        this.UpdateProjectionMatrix(w, h);
        this.UpdateViewMatrix();
    }

    public UpdateViewMatrix() : void 
    {
        let front : glm.vec3 = glm.vec3.create();
        front[0] = Math.cos(glm.glMatrix.toRadian(this.yaw.val)) * Math.cos(glm.glMatrix.toRadian(this.pitch.val));
        front[1] = Math.sin(glm.glMatrix.toRadian(this.pitch.val));
        front[2] = Math.sin(glm.glMatrix.toRadian(this.yaw.val)) * Math.cos(glm.glMatrix.toRadian(this.pitch.val));
        this.front = glm.vec3.normalize(glm.vec3.create(), front);
        // also re-calculate the right_ and up_ vector
        this.right = glm.vec3.normalize(glm.vec3.create(), glm.vec3.cross( glm.vec3.create(), this.front, this.up));  // normalize the vectors, because their length gets closer to 0 the more you look up or down which results in slower movement.
        this.up  = glm.vec3.normalize(glm.vec3.create(), glm.vec3.cross(glm.vec3.create(), this.right, this.front));
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

    public OnMouseMove(pos : {x : number, y : number}, constrainPitch : boolean) : void 
    {

        const glPos = Animator.ConvertPosToWebGL(pos.x, pos.y);

        if(this.enableMouseMovement) {
            // glPos.x *= this.mouseSensitivity;
            // glPos.y *= this.mouseSensitivity;

            // Animator.LerpFloat(this.yaw, glPos.x - 90, 2000);
            // Animator.LerpFloat(this.pitch, glPos.y, 2000);

            this.yaw.val = glPos.x - 90;
            this.pitch.val = glPos.y;
    
            // To prevent the screen from being flipped on >= 90 degree rotations.
            if (constrainPitch)
            {
                if (this.pitch.val > 89.0)
                    this.pitch.val = 89.0;
                if (this.pitch.val < -89.0)
                    this.pitch.val = -89.0;
            }
            
            this.UpdateViewMatrix(); // This must be called if you want objects to properly be updated in the viewport.
        }
    }

    public override HandleChangeInState(newState: ApplicationStates): void {
        // Would rather the camera not rotate when viewing the projects (a bit distracting)
        if(newState == ApplicationStates.VIEWING_PROJECTS) 
        {
            this.enableMouseMovement = false;
            // Reset the camera's yaw so that it's looking directly at the Sun.
            this.yaw.val = -90;
            this.UpdateViewMatrix(); 
        }
        else {
            // Allow 2s for the projects to fade out.
            window.setTimeout(() => {this.enableMouseMovement = true}, 2000);
        };
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
    private yaw : Ref<number> = {val : -90};
    private pitch : Ref<number> = {val : 0.0}
    public enableMouseMovement : boolean = true;
    private mouseSensitivity : number = 0.01;

    private projectionMatrix : glm.mat4 = glm.mat4.create();
    private viewMatrix : glm.mat4 = glm.mat4.create();
};