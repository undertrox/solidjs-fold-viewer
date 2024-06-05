import { Transform } from "./Transform"

type Line = [number, number, number, number];

export class FoldCanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly foldFile: FOLD;
  transform: Transform = new Transform();
  private mLines: Line[] = [];
  private vLines: Line[] = [];
  private bLines: Line[] = [];

  constructor(foldFile: FOLD, canvas: HTMLCanvasElement) {
    this.foldFile = foldFile;
    this.canvas = canvas;
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

  public render() : void {
    let ctx = this.canvas.getContext("2d")
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.foldFile == null) {return;}

    this.renderLines(ctx, "blue", this.vLines);
    this.renderLines(ctx, "red", this.mLines);
    this.renderLines(ctx, "black", this.bLines);
  }

  public requestRender(): void {
    requestAnimationFrame(this.render.bind(this));
  }

  private renderLines(ctx: CanvasRenderingContext2D, strokeStyle: string, lines: Line[]) : void {
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    for (let i = 0; i < lines.length; i++) {
      let [x1, y1, x2, y2] = this.transform.lineToScreenCoords(lines[i]);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
  }
}