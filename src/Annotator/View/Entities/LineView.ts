import {Base} from "../../Infrastructure/Repository";
import {View} from "../View";
import * as SVG from "svg.js";
import {Line} from "../../Store/Entities/Line";
import {TopContext} from "./TopContext";
import {filter} from "rxjs/operators";
import {fromEvent, Observable} from "rxjs";

export namespace LineView {
    export class Entity {
        svgElement: SVG.Tspan = null;
        xCoordinateOfChar: Array<number>;
        y: number;
        topContext: TopContext = null;

        constructor(public readonly id: number,public store: Line.Entity,public readonly root: View) {
            this.xCoordinateOfChar = [];
            this.topContext = new TopContext(this);
            root.store.lineRepo.updated$.pipe(filter(it => it === this.id)).subscribe(() => {
                this.store = root.store.lineRepo.get(id);
                this.rerender();
            });
        }

        get prev(): Entity {
            let firstIterator = this.root.lineViewRepo[Symbol.iterator]();
            let secondIterator = this.root.lineViewRepo[Symbol.iterator]();
            let id = secondIterator.next().value[0];
            let result: Entity = null;
            while (id !== this.id) {
                result = firstIterator.next().value[1];
                id = secondIterator.next().value[0];
            }
            return result;
        }

        get isFirst() {
            for (let [id, _] of this.root.lineViewRepo) {
                if (id < this.id) {
                    return false;
                }
            }
            return true;
        }

        get isLast() {
            for (let [id, _] of this.root.lineViewRepo) {
                if (id > this.id) {
                    return false;
                }
            }
            return true
        }

        remove() {
            let dy = -this.topContext.height - 23.8;
            this.topContext.remove();
            this.svgElement.node.remove();
            this.layoutAfterSelf(dy);
        }

        render(context: SVG.Text) {
            this.svgElement = context.tspan(this.store.text).newLine();
            (this.svgElement as any).AnnotatorElement = this;
            this.svgElement.on('mouseup', () => {
                this.root.root.textSelectionHandler.textSelected(this.root.selection);
                this.root.textSelectBackground.innerHTML="";
            });
            this.svgElement.on('mousemove', (e)=>{
                if(e.which==1){
                    if(window.getSelection){
                        this.root.selection =window.getSelection();
                        let selection=this.root.selection;
                        const BGCOLOR='#4aa2ff'; // 选中文字的背景色
                        const BGHEIGHT='18px'; // 选中文字的高度
                        let startElement = null;
                        let endElement = null;
                        try {
                            startElement = selection.anchorNode.parentNode;
                            endElement = selection.focusNode.parentNode;
                        } catch (e) {
                            return null;
                        }
                        let startLineView: LineView.Entity;
                        let endLineView: LineView.Entity;
                        let startIndex: number;
                        let endIndex: number;
                        let anchorPos:{x:number,y:number,endCharX:number};//鼠标选中的起点
                        let focusPos:{x:number,y:number,endCharX:number};//鼠标选中的终点
                        try {
                            startLineView = (startElement as any).instance.AnnotatorElement as LineView.Entity;
                            endLineView = (endElement as any).instance.AnnotatorElement as LineView.Entity;
                            // if (startLineView.root.root !== this.root || endLineView.root.root !== this.root) {
                            //     return null;
                            // }
                            let getdyTotal=function(element:any){
                                let dyTotal=0;
                                for(let i=0;i<[...element.parentNode.children].length;i++){
                                    let child=[...element.parentNode.children][i];
                                    if(i>0){
                                        dyTotal+=Number(child.getAttribute('dy'));
                                    }
                                    if(child.id==element.id){
                                        return dyTotal;
                                    }
                                }
                                return dyTotal;
                            }
                            anchorPos={
                                x:startLineView.xCoordinateOfChar[selection.anchorOffset]+30,//30是svg的左边距
                                endCharX:startLineView.xCoordinateOfChar[startLineView.xCoordinateOfChar.length-1]+30, //结尾字符的x坐标
                                y:startElement.getBBox().y+getdyTotal(startElement)+2
                            };
                            focusPos={
                                x:endLineView.xCoordinateOfChar[selection.focusOffset]+30,
                                endCharX:endLineView.xCoordinateOfChar[endLineView.xCoordinateOfChar.length-1]+30,
                                y:endElement.getBBox().y+getdyTotal(endElement)+2
                            };
                            // startIndex = startLineView.store.startIndex + selection.anchorOffset;
                            // endIndex = endLineView.store.startIndex + selection.focusOffset;
                        } catch (e) {
                            return null;
                        }
                        if(focusPos.x!=this.root.lastPos.x||focusPos.y!=this.root.lastPos.y){
                             this.root.lastPos=focusPos;
                             if(focusPos.y==anchorPos.y){ //鼠标选中的文字没有跨行
                                this.root.textSelectBackground.innerHTML=`
                                    <div style="position:absolute;
                                                top:${anchorPos.y}px;
                                                left:${Math.min(focusPos.x,anchorPos.x)}px;
                                                width:${Math.abs(focusPos.x-anchorPos.x)}px;
                                                height:${BGHEIGHT};
                                                background:${BGCOLOR}">
                                    </div>`;
                             }else if(focusPos.y>anchorPos.y){ // 鼠标从上往下滑动选中跨行文字
                                let tempHtml=`
                                    <div style="position:absolute;
                                                top:${anchorPos.y}px;
                                                left:${anchorPos.x}px;
                                                width:${Math.abs(anchorPos.endCharX-anchorPos.x)}px;
                                                height:${BGHEIGHT};
                                                background:${BGCOLOR}">
                                    </div>`;
                                    tempHtml+=`
                                    <div style="position:absolute;
                                                top:${focusPos.y}px;
                                                left:30px;
                                                width:${Math.abs(focusPos.x-30)}px;
                                                height:${BGHEIGHT};
                                                background:${BGCOLOR}">
                                    </div>`;
                                this.root.textSelectBackground.innerHTML=tempHtml;
                             }else{ // 鼠标从下往上滑动选中跨行文字
                                let tempHtml=`
                                    <div style="position:absolute;
                                                top:${anchorPos.y}px;
                                                left:30px;
                                                width:${Math.abs(anchorPos.x-30)}px;
                                                height:${BGHEIGHT};
                                                background:${BGCOLOR}">
                                    </div>`;
                                    tempHtml+=`
                                    <div style="position:absolute;
                                                top:${focusPos.y}px;
                                                left:${focusPos.x}px;
                                                width:${Math.abs(focusPos.endCharX-focusPos.x)}px;
                                                height:${BGHEIGHT};
                                                background:${BGCOLOR}">
                                    </div>`;
                                this.root.textSelectBackground.innerHTML=tempHtml;
                             }
                        }
                    }
                }
            });
        }

        renderTopContext() {
            this.topContext.render();
        }

        layout(dy: number = this.topContext.height + 23.8) {
            // line itself's layout will be handled by svg.js itself
            this.svgElement.dy(dy);
            if (this.isLast) {
                this.root.resize();
            }
        }

        get rendered(): boolean {
            return this.svgElement !== null;
        }

        layoutAfterSelf(dy: number) {
            for (let id = this.id + 1; id < this.root.lineViewRepo.length; ++id) {
                if (this.root.lineViewRepo.has(id) && this.root.lineViewRepo.get(id).rendered) {
                    this.root.lineViewRepo.get(id).topContext.layout(dy);
                }
            }
        }

        calculateInitialCharPositions() {
            this.xCoordinateOfChar = [];
            this.y = (this.svgElement.node as any).getExtentOfChar(0).y;
            for (let i = 0; i < this.store.text.length; ++i) {
                this.xCoordinateOfChar.push((this.svgElement.node as any).getExtentOfChar(i).x);
            }
            let last = (this.svgElement.node as any).getExtentOfChar(this.store.text.length - 1);
            this.xCoordinateOfChar.push(last.x + last.width);
        }

        /**
         * 重新渲染指定行
         */
        public Test(){
            //this.rerender()
            const oldHeight = this.topContext.height;
            this.topContext.remove();

            this.topContext = new TopContext(this);
            this.topContext.preRender(this.svgElement.doc() as SVG.Doc);
            this.topContext.initPosition();
            this.layout();
            this.layoutAfterSelf(this.topContext.height - oldHeight);
            this.renderTopContext();
            this.topContext.layout(null);
            this.topContext.postRender();
        }

        public rerender() {
            const oldHeight = this.topContext.height;
            this.topContext.remove();
            this.svgElement.clear();
            this.svgElement.plain(this.store.text);
            this.calculateInitialCharPositions();
            this.topContext = new TopContext(this);
            this.topContext.preRender(this.svgElement.doc() as SVG.Doc);
            this.topContext.initPosition();
            this.layout();
            this.layoutAfterSelf(this.topContext.height - oldHeight);
            this.renderTopContext();
            this.topContext.layout(null);
            this.topContext.postRender();
            this.topContext.attachTo.root.lineViewRepo.rerendered(this.id);
        }
    }

    export class Repository extends Base.Repository<Entity> {
        root: View;

        rerendered$: Observable<number> = null;

        constructor(root: View) {
            super(root);
            this.rerendered$ = fromEvent(this.eventEmitter, "rerendered");
        }

        rerendered(id: number) {
            this.eventEmitter.emit("rerendered", id);
        }

        delete(key: number | Entity): boolean {
            if (typeof key !== "number") {
                key = key.id;
            }
            if (this.has(key)) {
                this.get(key).remove();
            }
            return super.delete(key);
        }


    }

    export function constructAll(root: View): Array<Entity> {
        let result = [];
        for (let [id, entity] of root.store.lineRepo) {
            result.push(new Entity(id, entity, root));
        }
        return result;
    }
}