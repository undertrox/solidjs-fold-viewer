import { Component, createEffect, createSignal, onMount } from "solid-js"
import * as geom from "fold/lib/geom.js";
import { createFileUploader } from "@solid-primitives/upload";

const FoldFileViewer: Component = () => {
    let canvas: HTMLCanvasElement;
    let canvasDiv: HTMLDivElement;

    let updateCanvas = () => {
        let ctx = canvas.getContext("2d")
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const fold = foldFile();
        if (fold == null) {return;}
        ctx.save();
        const [translateX, translateY] = transform();
        ctx.translate(translateX, translateY);
        fold.edges_vertices.forEach(([i1, i2], index) => {
            const p1 = fold.vertices_coords[i1];
            const p2 = fold.vertices_coords[i2];
            ctx.strokeStyle = fold.edges_assignment[index] == "M"? "red" : "blue";
            let [x1, y1] = p1;
            let [x2, y2] = p2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        })
        ctx.restore();
    };

    onMount(() => {
        new ResizeObserver(() => {
            canvas.width = canvasDiv.clientWidth;
            canvas.height = canvasDiv.clientHeight;
            updateCanvas();
        }).observe(canvasDiv);
    });
    const [transform, setTransform] = createSignal<[number, number]>([0,0]);
    const { files, selectFiles } = createFileUploader();
    const [foldFile, setFoldFile] = createSignal<FOLD>();
    createEffect(() => {
        updateCanvas();
    })
    return (
    <div class="self-stretch">
        <div ref={canvasDiv}>
            <canvas ref={canvas} width="1000" height="600" onMouseMove={(evt) => {
                if (!(evt.buttons & 1)){return;}
                let [translateX, translateY] = transform();
                translateX += evt.movementX;
                translateY += evt.movementY;
                setTransform([translateX, translateY]);
            }}/>
        </div>
        <button class="btn" onClick={() => {
            selectFiles(allFiles => {
                const file = allFiles[0];
                const fileReader = new FileReader();
                fileReader.onload = (ev) => {
                    const str = ev.target.result.toString()
                    const jsonFold = JSON.parse(str);
                    if (jsonFold.file_spec <= 1.2){
                        // assume its a valid fold file
                        // TODO: validate
                        setFoldFile(jsonFold);
                    }
                }
                fileReader.readAsText(file.file)
            });
        }}>upload</button>
    </div>
    );
}

export default FoldFileViewer;