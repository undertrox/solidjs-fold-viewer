import {Component, onMount} from "solid-js";
import * as geom from "fold/lib/geom.js";

const FoldFileViewer: Component = () => {
    let canvas: HTMLCanvasElement;
    let canvasDiv: HTMLDivElement;
    let clearCanvas = () => {
        let ctx = canvas.getContext("2d")
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    onMount(() => {
        new ResizeObserver(() => {
            canvas.width = canvasDiv.clientWidth;
            canvas.height = canvasDiv.clientHeight;
            clearCanvas();
        }).observe(canvasDiv);
    });

    console.log(geom);

    return (
    <div class="self-stretch">
        <div ref={canvasDiv}>
            <canvas ref={canvas} width="1000" height="600"/>
        </div>
        <button class="btn" onClick={clearCanvas}>draw</button>
    </div>
    );
}

export default FoldFileViewer;