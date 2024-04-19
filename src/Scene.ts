import { ComponentTypes } from "./Entity/ECS";
import Entity from "./Entity/Entities";

export default class Scene 
{
    constructor() 
    {

    }

    Init(): void 
    {
    }

    Render(): void 
    {
        for(const e of this.entities) 
        {
            e.Traverse();
        }
    }

    Resize(): void 
    {
        
    }
    
    CreateEntity() : Entity 
    {
        var e = new Entity();
        this.entities.push(e);
        return e;
    }

    Traverse(callback: () => void) : void 
    {

    }

    private entities : Array<Entity> = new Array<Entity>();
}