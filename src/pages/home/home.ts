import {Component, ElementRef, ViewChild, Renderer2} from '@angular/core';
import {Gesture} from "ionic-angular";

const MAX_SCALE = 2;
const MIN_SCALE = 1;
const BASE_SCALE = 1;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {


  @ViewChild('imgContainer') imgContainer: ElementRef;

  private imgContainerHeight: number = 0;
  private imgContainerWidth: number = 0;

  private scale = BASE_SCALE;
  private alreadyScaled = BASE_SCALE;
  private totalScaled = BASE_SCALE;
  private isMoving = false;


  private translateX: number = 0;
  private translateY: number = 0;

  private lastTranslateX: number = 0;
  private lastTranslateY: number = 0;


  private dragStartPositionX: number;
  private dragStartPositionY: number;

  private currentPostionX: number;
  private currentPostionY: number;
  private ax: number;
  private ay: number;
  private bx: number;
  private cy: number;

  private transAnim: boolean;

  public height: number = 150;

  private gesture: Gesture;
  @ViewChild('image') image;
  @ViewChild('canvas') canvas;

  constructor(private renderer: Renderer2) {

  }

  public calcImageWrapperHeight(){
    return 170;
  }

  ionViewDidLoad() {

    this.height = this.calcImageWrapperHeight();

    this.imgContainerHeight = this.imgContainer.nativeElement.offsetHeight;
    this.imgContainerWidth = this.imgContainer.nativeElement.offsetWidth;





    //create gesture obj w/ ref to DOM image
    this.gesture = new Gesture(this.image.nativeElement);

    //listen for the gesture
    this.gesture.listen();

    //turn on listening for pinch
    this.gesture.on('pinch', e => this.onPinchMove(e));
    this.gesture.on('pinchstart', e => this.onPinchStart(e));
    this.gesture.on('pinchend', e => this.onPinchEnd(e));
    this.gesture.on('panmove', e => this.onDragging(e));
    this.gesture.on('panstart', e => this.ondragStart(e));
    this.gesture.on('panend', e => this.onDragEnd(e));
  }

  public onPinchStart(e) {

    // flag that sets the class to disable scrolling
    this.isMoving = true;
    this.transAnim = false;
  }


  // called at (pinchend) and (pinchcancel)
  public onPinchEnd(e) {

    // flip the flag, enable scrolling
    this.isMoving = false;

    // adjust the amount we already scaled
    this.alreadyScaled = this.scale * this.alreadyScaled;

    this.transAnim = true;

  }

  public onPinchMove(e) {

    // set the scale so we can track it globally
    this.scale = e.scale;
    this.renderer.setStyle(this.image.nativeElement,'transform','scale('+this.scale+') translateX('+this.translateX+'px) translateY('+this.translateY+')');
    // total amount we scaled
    this.totalScaled = this.alreadyScaled * e.scale;

    // did we hit the max scale (pinch out)
    if (this.totalScaled >= MAX_SCALE) {

      // fix the scale by calculating it, don't use the e.scale
      // scenario: an insane quick pinch out will offset the this.scale
      this.scale = MAX_SCALE / this.alreadyScaled;
      this.totalScaled = MAX_SCALE;

      // did we hit the min scale (pinch in)
    } else if (this.totalScaled <= MIN_SCALE) {

      // fix the scale
      this.scale = MIN_SCALE / this.alreadyScaled;
      this.totalScaled = MIN_SCALE;

    }

  }

  public onDragging(e) {
    this.currentPostionX = e.changedPointers[0].pageX;
    this.currentPostionY = e.changedPointers[0].pageY;
    /*console.log("translateX: ",this.translateX);
    console.log("translateY: ",this.translateY);*/
    this.transAnim = false;
    this.translateX = this.lastTranslateX + this.currentPostionX - this.dragStartPositionX;
    this.translateY = this.lastTranslateY + this.currentPostionY - this.dragStartPositionY;

    this.renderer.setStyle(this.image.nativeElement,'transform','scale('+this.scale+') translateX('+this.translateX+'px) translateY('+this.translateY+')');
  }

  public ondragStart(e) {



    this.isMoving = true;
    this.dragStartPositionX = e.changedPointers[0].pageX;
    this.dragStartPositionY = e.changedPointers[0].pageY;

  }

  public onDragEnd(e) {
    let deltaX = this.imgContainerWidth / 2 - this.imgContainerWidth / (2 * this.totalScaled);
    let deltaY = this.imgContainerHeight / 2 - this.imgContainerHeight / (2 * this.totalScaled);

    this.isMoving = false;


    if (this.translateX <= deltaX && this.translateX >= 0 - deltaX)
    /*this.lastTranslateX = this.translateX;*/
      console.log("");
    else {
      this.transAnim = true;
      if (!(this.translateX <= deltaX))
        this.translateX = deltaX;
      else
        this.translateX = 0 - deltaX;
      //this.transAnim = false;
    }


    if (this.translateY <= deltaY && this.translateY >= 0 - deltaY)
    /*this.lastTranslateY = this.translateY;*/
      console.log("");
    else {
      this.transAnim = true;
      if (!(this.translateY <= deltaY))
        this.translateY = deltaY;
      else
        this.translateY = 0 - deltaY;
      //this.transAnim = false;
    }


    this.lastTranslateX = this.translateX;
    this.lastTranslateY = this.translateY;
  }


  zoom() {
    this.totalScaled += 0.5;
  }

  setPoints() {


    let scale = this.totalScaled;
    this.ax = this.image.nativeElement.naturalWidth / 2 - this.image.nativeElement.naturalWidth / (2 * scale) - this.translateX * this.image.nativeElement.naturalWidth / this.imgContainerWidth;
    this.ay = this.image.nativeElement.naturalHeight / 2 - this.image.nativeElement.naturalHeight / (2 * scale) - this.translateY * this.image.nativeElement.naturalHeight / this.imgContainerHeight;

    this.bx = this.image.nativeElement.naturalWidth / 2 + this.image.nativeElement.naturalWidth / (2 * scale) - this.translateX * this.image.nativeElement.naturalWidth / this.imgContainerWidth;
    //this.by = this.ay;
    //this.cx = this.ax;
    this.cy = this.image.nativeElement.naturalHeight / 2 + this.image.nativeElement.naturalHeight / (2 * scale) - this.translateY * this.image.nativeElement.naturalHeight / this.imgContainerHeight;

    //this.dx = this.bx;
    //this.dy = this.cy;

    this.configCutImage();
  }

  private configCutImage() {
    //let canvas:any = document.getElementById('myCanvas');
    let canvas = this.canvas.nativeElement;
    let context = canvas.getContext('2d');
    let imageObj = new Image();

    imageObj.onload = () => context.drawImage(imageObj, this.ax, this.ay, this.bx - this.ax, this.cy - this.ay, 0, 0, canvas.width, canvas.height);

    imageObj.src = this.image.nativeElement.src;


  }
}
