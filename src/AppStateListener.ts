export interface State 
{
    val : ApplicationStates
};

export enum ApplicationStates 
{
    VIEWING_PROJECTS,
    HIDING_PROJECTS
};

let singleton : boolean = false;

export default abstract class AppStateListener 
{
    constructor() 
    {
        AppStateListener.instances.push(this);
    }

    protected ModifyState(state: ApplicationStates) : void 
    {
        this.appState.val = state;
        for(const i of AppStateListener.instances) 
        {
            i.HandleChangeInState(this.appState.val);
        }
    }

    public GetCurrentAppState() : ApplicationStates 
    {
        return this.appState.val;
    }

    protected abstract HandleChangeInState(newState : ApplicationStates) : void;

    private readonly appState : State = {val: ApplicationStates.HIDING_PROJECTS};
    private static instances : AppStateListener[] = [];
};