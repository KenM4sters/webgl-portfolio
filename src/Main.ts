import Frontend from "./Frontend";
import Resources from "./Resources";
import Sandbox from "./Sandbox";

const canvas = document.getElementById("glcanvas") as HTMLCanvasElement | null;
if(!canvas) throw new Error("Failed to get canvas element!");

// The Frontend class is repsonsible for creating and managing the "actual website" if you like.
// Basically all the DOM elements, CSS etc... Nothing to do with WebGL.
const frontend : Frontend = new Frontend(canvas);
frontend.InitPreloader();

// WebGL Experience.
const resources = new Resources();
resources.LoadAllResources(RunWebGL);

function RunWebGL() : void 
{
    frontend.InitFrontend();
    const sandbox = new Sandbox(canvas as HTMLCanvasElement); 
    sandbox.Init();  
    sandbox.Run();
}
