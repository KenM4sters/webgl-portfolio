import App from "./App";
import Frontend from "./Frontend";

function main() : void
{
    const canvas = document.getElementById("glcanvas") as HTMLCanvasElement | null;
    if(!canvas) throw new Error("Failed to get canvas element!");

    // The Frontend class is repsonsible for creating and managing the "actual website" if you like.
    // Basically all the DOM elements, CSS etc... Nothing to do with WebGL.
    const frontend : Frontend = new Frontend(canvas);
    // frontend.Init();

    // WebGL Experience.
    const app = new App(canvas);
    app.Init();
    // <--- TBC
}

main();