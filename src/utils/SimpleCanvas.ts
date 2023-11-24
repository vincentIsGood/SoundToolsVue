export default class SimpleCanvas{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.context = canvas.getContext("2d")!;
    }

    alignSizeWithCssStyle(){
        // align the width and height of the canvas with css values;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    middleYAsOrigin(){
        // make the middle of the canvas be our y=0 (origin)
        this.context.translate(0, this.canvas.offsetHeight / 2);
    }

    getContext(): CanvasRenderingContext2D{
        return this.context;
    }

    lineWidth(width: number){
        this.context.lineWidth = width;
    }
    
    /**
     * @param fillStyle hex or css color style (eg. rgba(0, 0, 0, 0.5))
     * @param strokeStyle hex or css color style (eg. rgba(0, 0, 0, 0.5))
     */
    style(fillStyle: string | null = null, strokeStyle: string | null = null){
        if(fillStyle) this.context.fillStyle = fillStyle;
        if(strokeStyle) this.context.strokeStyle = strokeStyle;
    }

    fillRect(x: number, y: number, w: number, h: number, fillStyle?: string | null){
        this.style(fillStyle, null);
        this.context.fillRect(x, y, w, h);
    }

    strokeRect(x: number, y: number, w: number, h: number, strokeStyle?: string | null){
        this.style(null, strokeStyle);
        this.context.strokeRect(x, y, w, h);
    }

    fillText(text: string, x: number, y: number, 
        {maxWidth, fillStyle}: {maxWidth?: number | undefined, fillStyle?: string | null}){
        this.style(fillStyle, null);
        this.context.fillText(text, x, y, maxWidth);
    }

    strokeText(text: string, x: number, y: number, 
        {maxWidth, strokeStyle}: {maxWidth?: number | undefined, strokeStyle?: string | null}){
        this.style(null, strokeStyle);
        this.context.strokeText(text, x, y, maxWidth);
    }

    path(): WrapperPath2D{
        return new WrapperPath2D(this);
    }
}

class WrapperPath2D extends Path2D{
    canvas: SimpleCanvas;

    constructor(canvas: SimpleCanvas){
        super();
        this.canvas = canvas;
    }

    moveTo(x: number, y: number): WrapperPath2D {
        super.moveTo(x, y);
        return this;
    }

    lineTo(x: number, y: number): WrapperPath2D {
        super.lineTo(x, y);
        return this;
    }

    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): WrapperPath2D {
        super.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        return this;
    }
    
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): WrapperPath2D {
        super.quadraticCurveTo(cpx, cpy, x, y);
        return this;
    }

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean | undefined): WrapperPath2D {
        super.arc(x, y, radius, startAngle, endAngle, counterclockwise);
        return this;
    }

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): WrapperPath2D {
        super.arcTo(x1, y1, x2, y2, radius);
        return this;
    }

    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean | undefined): WrapperPath2D {
        super.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
        return this;
    }

    rect(x: number, y: number, w: number, h: number): WrapperPath2D {
        super.rect(x, y, w, h);
        return this;
    }

    roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | (number | DOMPointInit)[] | undefined): WrapperPath2D;
    roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | Iterable<number | DOMPointInit> | undefined): WrapperPath2D{
        super.roundRect(x, y, w, h, radii);
        return this;
    }

    /**
     * Equivalent to `this.stroke()`
     */
    draw(){
        this.stroke();
    }

    stroke(){
        this.canvas.context.stroke(this);
    }

    fill(){
        this.canvas.context.fill(this);
    }
}

export {WrapperPath2D};