export class Transform {
  public zoom: number = 1;
  public offsetX: number = 250;
  public offsetY: number = 250;
  public cameraCenterX: number = 0;
  public cameraCenterY: number = 0;

  public toScreenCoords(x: number, y: number): [number, number] {
    let x1 = x - this.cameraCenterX;
    let y1 = y - this.cameraCenterY;

    let x2 = x1 * this.zoom;
    let y2 = y1 * this.zoom;
    return [x2 + this.offsetX, y2 + this.offsetY];
  }

  public lineToScreenCoords(line: [number, number, number, number]) : [number, number, number, number] {
    let [x1, y1, x2, y2] = line;
    x1 = (x1 - this.cameraCenterX)*this.zoom + this.offsetX;
    x2 = (x2 - this.cameraCenterX)*this.zoom + this.offsetX;
    y1 = (y1 - this.cameraCenterY)*this.zoom + this.offsetY;
    y2 = (y2 - this.cameraCenterY)*this.zoom + this.offsetY;
    return [x1, y1, x2, y2];
  }

  public fromScreenCoords(x: number, y: number): [number, number] {
    let x1 = x - this.offsetX;
    let y1 = y - this.offsetY;

    let x2 = x1 / this.zoom;
    let y2 = y1 / this.zoom;
    return [x2 + this.cameraCenterX, y2 + this.cameraCenterY];
  }

  public setCenter(x: number, y: number): void {
    [this.cameraCenterX, this.cameraCenterY] = this.fromScreenCoords(x,y);
    this.offsetX = x;
    this.offsetY = y;
  }
}