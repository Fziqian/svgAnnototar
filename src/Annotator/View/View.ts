import * as SVG from "svg.js";
import {RepositoryRoot} from "../Infrastructure/Repository";
import {LineView} from "./Entities/LineView";
import {Annotator} from "../Annotator";
import {LabelView} from "./Entities/LabelView";
import {ConnectionView} from "./Entities/ConnectionView";

export class View implements RepositoryRoot {
    readonly svgDoc: SVG.Doc;
    readonly lineViewRepo: LineView.Repository;
    readonly labelViewRepo: LabelView.Repository;
    readonly connectionViewRepo: ConnectionView.Repository;
    public selection: any;
    public textSelectBackground: HTMLElement;
    public lastPos:{x:number,y:number,endCharX:number}={x:0,y:0,endCharX:0};

    constructor(htmlElement: HTMLElement, public readonly root: Annotator) {
        this.svgDoc = SVG(htmlElement);
        this.svgDoc.width(1024).height(768);
        (this.svgDoc as any).view = this;
        this.svgDoc.style({'padding-left': '30px', 'padding-right': '0px', 'position': 'relative', 'z-index': 2});
        this.lineViewRepo = new LineView.Repository(this);
        this.labelViewRepo = new LabelView.Repository(this);
        this.connectionViewRepo = new ConnectionView.Repository(this);
        this.textSelectBackground = document.createElement("div");
        this.textSelectBackground.style.cssText="position:absolute;top:0;left:0";
        htmlElement.style.position="relative";
        htmlElement.appendChild(this.textSelectBackground);
        this.store.ready$.subscribe(() => {
            this.construct();
            this.render();
        });
        this.store.lineRepo.deleted$.subscribe(it => {
            this.lineViewRepo.delete(it.id);
        });
    }

    get store() {
        return this.root.store;
    }

    private construct() {
        LineView.constructAll(this).map(it => this.lineViewRepo.add(it));
    }

    render() {
        const head = document.getElementsByTagName('head')[0];

        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode('svg .label-view:hover rect {transition: all 0.15s;stroke: red;stroke-width:2;}'));
        style.appendChild(document.createTextNode('svg .connection-view:hover text {transition: all 0.15s;fill:#006699;cursor:pointer;text-decoration:underline;color:blue;}'));
        style.appendChild(document.createTextNode('svg text tspan::selection{background:rgba(0,0,0,0);}'));
        style.appendChild(document.createTextNode('svg text tspan::-moz-selection{background:rgba(0,0,0,0);}'));
        head.appendChild(style);
        let svgText = this.svgDoc.text('');
        svgText.clear();
        svgText.build(true);
        // who believe it takes such effort to separate read & write
        for (let [_, entity] of this.lineViewRepo) {
            entity.render(svgText);
        }
        for (let [_, entity] of this.lineViewRepo) {
            entity.calculateInitialCharPositions();
        }
        for (let [_, entity] of this.lineViewRepo) {
            entity.topContext.preRender(this.svgDoc);
        }
        for (let [_, entity] of this.lineViewRepo) {
            entity.topContext.initPosition();
        }
        for (let [_, entity] of this.lineViewRepo) {
            entity.layout();
        }
        for (let [_, entity] of this.lineViewRepo) {
            entity.renderTopContext();
        }
        for (let [_, entity] of this.lineViewRepo) {
            entity.topContext.layout(null);
        }
        for (let [_, entity] of this.lineViewRepo) {
            entity.topContext.postRender();
        }
        this.resize();
        this.svgDoc.on('mouseup', (e)=>{
            this.root.textSelectionHandler.textSelected(this.selection);
            this.textSelectBackground.innerHTML="";
        });
    }

    rerendered(id?:number){
        
        for (let [_, entity] of this.lineViewRepo) {
            if(id && id === entity.id){
                entity.Test();
                break;
            }else{
                entity.Test();
            }     
        }
        this.resize();
    }

    resize() {
        this.svgDoc.size(this.svgDoc.bbox().width + 50, this.svgDoc.bbox().height + 50);
    }
}