import React from "react";
import BaseComponent from "./BaseComponent";

export default class Wire extends BaseComponent {
    static defaultProps = {
        ...BaseComponent.defaultProps,
        draggable: true,

        isCollision: (props, state) => {
            const event = props.event; if (!event) { return null; }
            const mouse = event.mouse; if (!mouse) { return null; }
            const mousePosition = mouse.position; if (!mousePosition) { return null; }
            const mouseOldPosition = mouse.oldPosition; if (!mouseOldPosition) { return null; }
            const worldPosition = event.worldPosition; if (!worldPosition) { return null; }

            const nodePosition = { x: state.position.x + worldPosition.x, y: state.position.y + worldPosition.y };

            for (let i = 1; i < state.parts.length; i++) {
                let startPoint = { ...state.parts[i - 1] };
                if (startPoint.xStart !== undefined) {
                    startPoint.x = startPoint.xStart;
                    startPoint.y = startPoint.yStart;
                }
                startPoint.x += nodePosition.x + worldPosition.x;
                startPoint.y += nodePosition.y + worldPosition.y;

                let finishPoint = { ...state.parts[i] };
                if (finishPoint.xStart) {
                    continue;
                }
                finishPoint.x += nodePosition.x + worldPosition.x;
                finishPoint.y += nodePosition.y + worldPosition.y;

                const dx = finishPoint.x - startPoint.x;

                if (Math.max(finishPoint.x, startPoint.x) + 5 >= mousePosition.x && Math.min(finishPoint.x, startPoint.x) - 5 <= mousePosition.x) {
                    if (dx !== 0) {
                        if (Math.abs(((finishPoint.y - startPoint.y) / dx) * mousePosition.x + startPoint.y - mousePosition.y) <= 5)
                            return true;
                    } else if (Math.max(finishPoint.y, startPoint.y) >= mousePosition.y && Math.min(finishPoint.y, startPoint.y) <= mousePosition.y)
                        return true;
                }
            }

            return false;
        }
    }
    constructor(props) {
        super(props);

        this.state = Object.assign({
            parts: [
                { xStart: 0, yStart: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 60 },
                { x: 140, y: 60 },
                { xStart: 100, yStart: 40 },
                { x: 140, y: 40 },
                { xStart: 120, yStart: 60 },
                { x: 120, y: 80 },
                { x: 60, y: 80 }
            ]
        }, this.state);

        this.maxLeft = 0;
        this.maxRight = 0;
        this.maxTop = 0;
        this.maxBottom = 0;
    }

    render() {
        const props = this.props;
        const state = this.state;

        const ctx = props.ctx;
        if (ctx) {
            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#000000";

            if (state.isSelected) {
                ctx.strokeStyle = "#AA2222";
                ctx.fillStyle = "#AA2222";
            }

            ctx.beginPath();
            for (const part of state.parts) {
                if (part.xStart !== null && part.yStart !== null) {
                    ctx.moveTo(part.xStart + state.position.x + props.event.worldPosition.x, part.yStart + state.position.y + props.event.worldPosition.y);
                    if (part.xState < this.maxLeft)
                        this.maxLeft = part.xState;
                    if (part.xState > this.maxRight)
                        this.maxRight = part.xState;

                    if (part.yState < this.maxTop)
                        this.maxTop = part.yState;
                    if (part.yState > this.maxBottom)
                        this.maxBottom = part.yState;
                }

                if (part.x !== null && part.y !== null) {
                    ctx.lineTo(part.x + state.position.x + props.event.worldPosition.x, part.y + state.position.y + props.event.worldPosition.y);
                }
            }
            ctx.stroke();

            let circle = new Path2D();
            for (const startPath of state.parts) {
                const xStart = startPath.xStart;
                const yStart = startPath.yStart;
            
                if (xStart !== null && yStart !== null) {
                    for (let i = 1; i < state.parts.length; i++) {
                        const firstPart = state.parts[i];
                        const secondPart = state.parts[i - 1];

                        if (Math.abs(Math.abs(firstPart.y) - Math.abs(secondPart.y)) === Math.abs(Math.abs(yStart) - Math.abs(firstPart.y)) + Math.abs(Math.abs(yStart) - Math.abs(secondPart.y)) &&
                            Math.abs(Math.abs(firstPart.x) - Math.abs(secondPart.x)) === Math.abs(Math.abs(xStart) - Math.abs(firstPart.x)) + Math.abs(Math.abs(xStart) - Math.abs(secondPart.x))) {
                            circle.arc(xStart + state.position.x + props.event.worldPosition.x, yStart + state.position.y + props.event.worldPosition.y, 4, 0, 2 * Math.PI);
                        }
                    }
                }
            }
            ctx.fill(circle);
        }

        return null;
    }
}