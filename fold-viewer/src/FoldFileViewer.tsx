import { Component, createEffect, createSignal, onMount } from "solid-js"
import { createFileUploader } from "@solid-primitives/upload";
import { FoldCanvasRenderer } from "./FoldCanvasRenderer"

const FoldFileViewer: Component = () => {
    let canvas: HTMLCanvasElement;
    let canvasDiv: HTMLDivElement;

    const { files, selectFiles } = createFileUploader();
    const [foldFile, setFoldFile] = createSignal<FOLD>();

    const [renderer, setRenderer] = createSignal<FoldCanvasRenderer>();

    let updateCanvas = () => {
        renderer().requestRender();
    };
    createEffect(() => {
        setRenderer(new FoldCanvasRenderer(foldFile(), canvas));
    })
    createEffect(() => {
        let r = renderer();
        r.transform.zoom = 0.9;
        r.fullRender();
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
                let r = renderer();
                r.transform.offsetX += evt.movementX;
                r.transform.offsetY += evt.movementY;
                r.requestRender();
            }} onwheel={(evt)=> {
                renderer().transform.setCenter(evt.x, evt.y);
                if (evt.deltaY > 0) {
                    renderer().transform.zoom /= 1.3;
                } else {
                    renderer().transform.zoom *= 1.3;
                }
                renderer().requestRender();
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
        <button class="btn" onClick={() => {
            canvas.width = 900;
            canvas.height = 600;
            let iterations = 150;
            let canvasRenderer = renderer();
            const t1 = performance.now();
            for (let i = 0; i < iterations; i++) {
                canvasRenderer.render();
            }
            const t2 = performance.now();
            const time = t2 - t1;
            console.log(`rendering ${iterations} frames took ${time} ms. (${time/iterations} ms per frame, ${1000/(time/iterations)} fps`);

            console.log(`firefox;${iterations};${time};${files()[0].file.name};${canvas.width};${canvas.height}`)
        }}>benchmark</button>
    </div>
    );
}

export default FoldFileViewer;