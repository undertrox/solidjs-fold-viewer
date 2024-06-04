export class FoldCanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly foldFile: FOLD;
  translation: [number, number] = [0,0];
  private zoom: number = 1;
  private zoomCenter: [number, number] = [0,0];

  private colors: {[key: string]: string} = {
    "M": "red",
    "V": "blue",
    "B": "black",
    "F": "gray",
  };

  constructor(foldFile: FOLD, canvas: HTMLCanvasElement) {
    this.foldFile = foldFile;
    this.canvas = canvas;
  }

  public render() : void {
    let ctx = this.canvas.getContext("2d")
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.foldFile == null) {return;}
    ctx.save();
    const [translateX, translateY] = this.translation;
    ctx.translate(translateX, translateY);
    this.foldFile.edges_vertices.forEach(([i1, i2], index) => {
      const p1 = this.foldFile.vertices_coords[i1];
      const p2 = this.foldFile.vertices_coords[i2];
      ctx.strokeStyle = this.colors[this.foldFile.edges_assignment[index]];
      let [x1, y1] = p1;
      let [x2, y2] = p2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    })
    ctx.restore();
  }
}