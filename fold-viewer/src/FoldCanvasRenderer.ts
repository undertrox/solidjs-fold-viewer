import { Transform } from "./Transform"

type Line = [number, number, number, number];

export class FoldCanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly foldFile: FOLD;
  private cacheOversize = 500;
  transform: Transform = new Transform();
  private mLines: Line[] = [];
  private vLines: Line[] = [];
  private bLines: Line[] = [];
  private tmpTransform = new Transform();
  private readonly tmpCanvas: HTMLCanvasElement;
  private readonly resizeObserver: ResizeObserver;
  private lastRenderRect: [number, number, number, number] = [0,0,0,0];
  private cacheData: ImageData;
  private firstRender: boolean = true;

  constructor(foldFile: FOLD, canvas: HTMLCanvasElement) {
    this.foldFile = foldFile;
    this.canvas = canvas;
    this.tmpCanvas = document.createElement("canvas");

    this.resizeObserver = new ResizeObserver(() => {
      this.tmpCanvas.width = canvas.width + this.cacheOversize;
      this.tmpCanvas.height = canvas.height + this.cacheOversize;
      this.cacheRender();
    });
    this.resizeObserver.observe(canvas);

    if (!foldFile) {return;}
    foldFile.edges_vertices.forEach(([i1, i2], index) => {
      const [x1, y1] = this.foldFile.vertices_coords[i1];
      const [x2, y2] = this.foldFile.vertices_coords[i2];
      const line: Line = [x1, y1, x2, y2];
      const col = this.foldFile.edges_assignment[index];
      switch (col){
        case "M":
          this.mLines.push(line);
          break;
        case "V":
          this.vLines.push(line);
          break;
        case "B":
          this.bLines.push(line);
          break;
      }
    })
  }

  public cacheRender() : void {
    let ctx = this.tmpCanvas.getContext("2d")

    let t = this.tmpTransform;
    ctx.fillStyle = "white";
    if (t.zoom != this.transform.zoom || this.firstRender) {
      this.firstRender = false;
      this.lastRenderRect = [0,0,0,0];
      ctx.fillRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
    } else {
      let data = ctx.getImageData(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
      let [tx, ty] = this.transform.toScreenCoords(0, 0);
      let [ttx, tty] = this.tmpTransform.toScreenCoords(0, 0);
      let dx = tx - ttx;
      let dy = ty - tty;
      ctx.fillRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
      ctx.putImageData(data, dx, dy);
    }
    t.cameraCenterX = this.transform.cameraCenterX;
    t.cameraCenterY = this.transform.cameraCenterY;
    t.offsetX = this.transform.offsetX;
    t.offsetY = this.transform.offsetY;
    t.zoom = this.transform.zoom;


    if (this.foldFile == null) {return;}

    ctx.save();
    //ctx.translate(this.cacheOversize/2, this.cacheOversize/2);
    this.renderLines(ctx, "blue", this.vLines,t);
    this.renderLines(ctx, "red", this.mLines, t);
    this.renderLines(ctx, "black", this.bLines, t);
    this.renderPoints(ctx, this.foldFile.vertices_coords as [number, number][], t);
    ctx.fillStyle = "green";
    let [cx, cy] = t.toScreenCoords(t.cameraCenterX, t.cameraCenterY);
    ctx.fillRect(cx, cy, 4, 4);
    this.lastRenderRect = this.getRenderRect(t);
    ctx.restore();
    this.cacheData = ctx.getImageData(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
  }

  private getRenderRect(t: Transform): [number, number, number, number]  {
    let [rx, ry] = t.fromScreenCoords(0,0);
    let [r2x, r2y] = t.fromScreenCoords(this.tmpCanvas.width,this.tmpCanvas.height);
    return [rx, ry, r2x, r2y];
  }

  public renderCachedImage() : void {
    let ctx = this.canvas.getContext("2d");
    let [tx, ty] = this.transform.toScreenCoords(0, 0);
    let [ttx, tty] = this.tmpTransform.toScreenCoords(0, 0);
    let dx = tx - ttx - this.cacheOversize/2;// - 65;
    let dy = ty - tty - this.cacheOversize/2;// - 90;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.putImageData(this.cacheData, dx, dy);

  }

  public render() : void {
    if (this.needsRerender()) {
      this.cacheRender();
    }
    this.renderCachedImage();
  }

  private needsRerender(): boolean {
    if (this.transform.zoom != this.tmpTransform.zoom) {return true;}
    if (Math.abs(this.transform.offsetX - this.tmpTransform.offsetX) > this.cacheOversize/2) {
      return true;
    }
    if (Math.abs(this.transform.offsetY - this.tmpTransform.offsetY) > this.cacheOversize/2) {
      return true;
    }
    return false;
  }

  public fullRender(): void {
    this.cacheRender();
    this.renderCachedImage();
  }

  public requestRender(): void {
    requestAnimationFrame(this.render.bind(this));
  }
  private mightBeInRect(line: [number, number, number, number], rect: [number, number, number, number]) {
    let [cs1, cs2] = this.outCodes(line, rect);
    return (cs1 & cs2) === 0;
  }

  private outCodes(line: [number, number, number, number], rect: [number, number, number, number]): [number, number] {
    let cs1 = +(rect[0] > line[0]) | (+(rect[2] < line[0]) << 1) | (+(rect[1] > line[1]) << 2) | (+(rect[3] < line[1]) << 3);
    let cs2 = +(rect[0] > line[2]) | (+(rect[2] < line[2]) << 1) | (+(rect[1] > line[3]) << 2) | (+(rect[3] < line[3]) << 3);
    return [cs1, cs2];
  }

  private isInRect(line: [number, number, number, number], rect: [number, number, number, number]) {
    let [cs1, cs2] = this.outCodes(line, rect);
    return (cs1 | cs2) === 0;
  }

  private renderLines(ctx: CanvasRenderingContext2D, strokeStyle: string, lines: Line[], transform: Transform) : void {
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    let rect = this.getRenderRect(transform);
    for (let i = 0; i < lines.length; i+= 1) {
      let line = lines[i];
      if (!this.mightBeInRect(line, rect)) {
        continue; // definitely outside of screen
      }
      if (this.isInRect(line, this.lastRenderRect)) {
        continue; // part of last cache render, no need to rerender
      }
      let [x1, y1, x2, y2] = transform.lineToScreenCoords(lines[i]);
      if (((x1-x2)**2 + (y1-y2)**2 ) < 1 && i % 5 != 0){ // skip some lines if they are less than 1px
        continue;
      }
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
  }

  private renderPoints(ctx: CanvasRenderingContext2D, points: [number, number][], transform: Transform){
    ctx.fillStyle = "black";
    let [rx, ry, r2x, r2y] = this.lastRenderRect;
    for (let i = 0; i < points.length; i++) {
      let p = points[i];
      if (rx != r2x && ry != r2y && (rx < p[0] && r2x > p[0] && ry < p[1] && r2y > p[1]) ) {
        continue;
      }
      let [x, y] = transform.toScreenCoords(p[0], p[1]);
      ctx.fillRect(x-2, y-2, 4, 4);
    }
  }
}