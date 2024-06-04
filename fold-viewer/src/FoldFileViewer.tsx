import { Component, createEffect, createSignal, onMount } from "solid-js"
import { createFileUploader } from "@solid-primitives/upload";
import { FoldCanvasRenderer } from "./FoldCanvasRenderer"

const FoldFileViewer: Component = () => {
    let canvas: HTMLCanvasElement;
    let canvasDiv: HTMLDivElement;

    const [transform, setTransform] = createSignal<[number, number]>([0,0]);
    const { files, selectFiles } = createFileUploader();
    const [foldFile, setFoldFile] = createSignal<FOLD>();

    const [renderer, setRenderer] = createSignal<FoldCanvasRenderer>();

    let updateCanvas = () => {
        renderer().render();
    };
    createEffect(() => {
        setRenderer(new FoldCanvasRenderer(foldFile(), canvas));
    })
    createEffect(() => {
        renderer().translation = transform();
        updateCanvas();
    })

    onMount(() => {
        new ResizeObserver(() => {
            canvas.width = canvasDiv.clientWidth;
            canvas.height = canvasDiv.clientHeight;
            updateCanvas();
        }).observe(canvasDiv);
    });
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