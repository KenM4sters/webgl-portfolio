import Animus from "./Animus";
import Frontend from "./Frontend";
import Resources from "./Resources";

const canvas = document.getElementById("glcanvas") as HTMLCanvasElement | null;
if(!canvas) throw new Error("Failed to get canvas element!");

// The Frontend class is repsonsible for creating and managing the "actual website" if you like.
// Basically all the DOM elements, CSS etc... Nothing to do with WebGL.
const frontend : Frontend = new Frontend(canvas);
// frontend.Init();

// WebGL Experience.
const animus = new Animus(canvas as HTMLCanvasElement); 
const resources = new Resources();
resources.LoadAllResources(RunWebGL);

function RunWebGL() : void 
{
    animus.Init();  
    animus.Run();
}
