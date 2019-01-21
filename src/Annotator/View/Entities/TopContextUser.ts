import * as SVG from "svg.js";
import { TopContext } from "./TopContext";
import { LabelView } from "./LabelView";

export abstract class TopContextUser {
    layer: number;

    context: TopContext;

    abstract readonly x: number;

    abstract readonly width: number;
    abstract readonly outterWidth: number;
    svgElement: SVG.Element;

    // 左下角在render context中的坐标
    get y() {
        return -(this.layer - 1) * 30 - 23.8;
    }

    abstract render()

    abstract preRender()

    abstract initPosition()

    private get overlapping() {
        if(this instanceof LabelView.Entity && !this.store.root.config.showLabelOnTop){
            return false;
        }

        let allElementsInThisLayer = new Set();
        for (let ele of this.context.elements) {
            if (ele !== this && ele.layer === this.layer) {
                allElementsInThisLayer.add(ele);
            }
        }
        let thisLeftX = this.x;
        let width = this.outterWidth;
        for (let other of allElementsInThisLayer) {
            let thisRightX = thisLeftX + width;
            let otherLeftX = other.x;
            let otherWidth = other.outterWidth;
            let otherRightX = otherLeftX + otherWidth;

            //判断是否有重叠
            let max = [thisLeftX, otherLeftX];
            let min = [thisRightX, otherRightX];
            if (Math.max.apply(null, max) < Math.min.apply(null, min)) {
                // 区间存在重叠交叉
                return true;
            }
        }
        return false;
    }

    eliminateOverlapping() {
        while (this.overlapping) {
            ++this.layer;
        }
    }

    postRender() {
    }
}