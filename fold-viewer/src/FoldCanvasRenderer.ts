export class FoldCanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly foldFile: FOLD;
  translation: [number, number] = [0,0];
  zoom: number = 1;
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
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(translateX, translateY);
    let edges_vertices = this.foldFile.edges_vertices;
    for (let i = 0; i < edges_vertices.length; i++) {
      let [i1, i2] = edges_vertices[i];
      const [x1, y1] = this.foldFile.vertices_coords[i1];
      const [x2, y2] = this.foldFile.vertices_coords[i2];
      ctx.strokeStyle = this.colors[this.foldFile.edges_assignment[i]];
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }
}