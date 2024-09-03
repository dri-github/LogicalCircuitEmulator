import React from "react";
import { TL_SELECTING_NODES, TL_NODE_DRAGGING } from "./NodeManager";

export class Pin extends React.Component { render() { return null; } }

export class Block extends React.Component { render() { return null; } }

export class Line extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            points: props.points ? props.points : [{ x: 0, y: 0 }]
        };
    }

    render() {
        const props = this.props;
        const state = this.state;

        const event = props.event;
        const worldPosition = event.worldPosition;

        const points = state.points;

        const ctx = props.ctx;
        if (ctx) {
            ctx.strokeStyle = "#000000";
            ctx.beginPath();
            let point = points[0];
            ctx.moveTo(point.x + worldPosition.x, point.y + worldPosition.y);
            for (let i = 1; i < points.length; i++) {
                point = points[i];
                ctx.lineTo(point.x + worldPosition.x, point.y + worldPosition.y);
            }

            ctx.stroke();
        }

        return null;
    }
}

export default class Node extends React.Component {
    static defaultProps = {
        position: { x: 0, y: 0 },
        width: 0,
        height: 0,
        ctx: null,
        event: null
    }
    constructor(props) {
        super(props);
        this.state = {
            is_drag: false,
            position: props.position ? props.position : { x: 0, y: 0 },
            isFixed: false,
            delta_position: { x: 0, y: 0 },
            isSelected: false
        };
    }

    static getDerivedStateFromProps(props, state) {
        const event = props.event; if (!event) { return null; }
        const mouse = event.mouse; if (!mouse) { return null; }
        const mousePosition = mouse.position; if (!mousePosition) { return null; }
        const mouseOldPosition = mouse.oldPosition; if (!mouseOldPosition) { return null; }
        const worldPosition = event.worldPosition; if (!worldPosition) { return null; }

        const nodePosition = { x: state.position.x + worldPosition.x, y: state.position.y + worldPosition.y };
        const nodeSize = { width: props.width ? props.width : 0, height: props.height ? props.height : 0 };

        const mouseState = mouse.state;

        //ѕроверка столкновени€ Node с точькой
        const isCollisionWithPoint = (pointPosition) => {
            if (!pointPosition || !pointPosition.x || !pointPosition.y) {
                return false;
            }

            return (pointPosition.x >= nodePosition.x && pointPosition.x <= nodePosition.x + nodeSize.width) &&
                   (pointPosition.y >= nodePosition.y && pointPosition.y <= nodePosition.y + nodeSize.height);
        }
        //ѕроверка столкновени€ Node с пр€моугольником
        const isCollisionWithRect = (rect) => {
            if (!rect || !rect.left || !rect.top || !rect.right || !rect.bottom) {
                return false;
            }

            if (rect.left > rect.right) rect.left = [rect.right, rect.right = rect.left][0];
            if (rect.top > rect.bottom) rect.top = [rect.bottom, rect.bottom = rect.top][0];

            return (rect.right >= nodePosition.x) && (rect.left <= nodePosition.x + nodeSize.width) &&
                   (rect.bottom >= nodePosition.y) && (rect.top <= nodePosition.y + nodeSize.height);
        }

        let result = Object.assign({}, state);

        const getPropertys = () => {
            return {
                id: props.index,
                transform: {
                    position: result.position,
                    isFixed: result.isFixed
                }
            };
        }

        switch (mouseState) {
            case TL_SELECTING_NODES:
                let isSelected = (mousePosition.x === mouseOldPosition.x && mousePosition.y === mouseOldPosition.y) ? isCollisionWithPoint(mousePosition) : isCollisionWithRect({ left: mouseOldPosition.x, top: mouseOldPosition.y, right: mousePosition.x, bottom: mousePosition.y });
                if (props.setSelected)
                    props.setSelected(getPropertys(), isSelected);
                result.is_drag = false;
                result.isSelected = isSelected;
                break;
            case TL_NODE_DRAGGING:
                if ((result.isSelected = props.getSelected(getPropertys()))) {
                    if (state.is_drag === true) {
                        if (state.isFixed === false) {
                            result.position = {
                                x: mousePosition.x - state.delta_position.x,
                                y: mousePosition.y - state.delta_position.y
                            };
                        }
                    } else {
                        result.is_drag = true;
                        result.delta_position = {
                            x: mousePosition.x - state.position.x,
                            y: mousePosition.y - state.position.y
                        };
                    }
                }

                if (state.isFixed === false) { //≈сли при зафиксированном ноде пользователь попробует произвести перетаскивание, то по завершению при попытке отключени€
                                               //фиксации необходимо дважды нажать на кнопку чтобы изменилось значение (исправл€ет данный нюанс)
                    
                    //ѕроисходит сохранение изменений в массив выбраных нодов
                    props.getSelected(getPropertys(), true);
                }
                break;
            default:
                if (event.propertys) {
                    if (JSON.stringify(event.propertys.transform) !== JSON.stringify(state.position))
                        result.position = event.propertys.transform.position;
                    result.isFixed = event.propertys.transform.isFixed;
                }
                break;
        }

        return result;
    }

    render() {
        const port_height = 20;
        const port_width = 70;
        const font_height = 18;
        const font = font_height + "px arial";
        const text_color = "#000000";
        const border_color = "#000000";
        const background_color = "#FFFFFF";

        const state = this.state;
        const props = this.props;

        const event = props.event;
        const worldPosition = event.worldPosition;

        const ctx = props.ctx;
        if (ctx) {
            const position = { x: state.position.x + worldPosition.x, y: state.position.y + worldPosition.y };

            ctx.fillStyle = background_color;
            if (state.isSelected === true) {
                ctx.fillStyle = "#9999CC";
            }
            ctx.fillRect(position.x, position.y, props.width, props.height);

            let delta_position = { left: 0, right: 0, top: 0, bottom: 0 };

            ctx.strokeStyle = border_color;
            for (let block of React.Children.toArray(props.children)) {
                const block_props = block.props;
                const pins_count = React.Children.count(block_props.children);
                const side = block_props.side;

                switch (side) {
                    case "right":
                        delta_position.right += port_height;
                        ctx.strokeRect(position.x + props.width - port_width, position.y, port_width, pins_count * port_height + delta_position.right);
                        delta_position.right -= port_height / 2;
                        break;
                    case "top":
                        break;
                    case "bottom":
                        break;
                    case "left":
                    default:
                        delta_position.left += port_height;
                        ctx.strokeRect(position.x, position.y, port_width, pins_count * port_height + delta_position.left);
                        delta_position.left -= port_height / 2;
                        break;
                }

                ctx.font = font;
                ctx.fillStyle = text_color;
                ctx.beginPath();

                const ports = React.Children.toArray(block.props.children);
                for (let i = 0; i < ports.length; i++) {
                    if (ports[i].props.name) {
                        let metrics = ctx.measureText(ports[i].props.name);
                        switch (side) {
                            case "right":
                                ctx.moveTo(position.x + props.width, position.y + delta_position.right + port_height / 2);
                                ctx.lineTo(position.x + props.width + 20, position.y + delta_position.right + port_height / 2);

                                ctx.fillText(ports[i].props.name, position.x + props.width - (port_width + metrics.width) / 2, position.y + font_height + delta_position.right);
                                break;
                            case "top":
                                break;
                            case "bottom":
                                break;
                            case "left":
                            default:
                                ctx.moveTo(position.x, position.y + delta_position.left + port_height / 2);
                                ctx.lineTo(position.x - 20, position.y + delta_position.left + port_height / 2);

                                ctx.fillText(ports[i].props.name, position.x + (port_width - metrics.width) / 2, position.y + font_height + delta_position.left);
                                break;
                        }
                        ctx.stroke();
                    }

                    delta_position[side] += port_height;
                }

                delta_position[side] += port_height / 2;
            }

            ctx.strokeStyle = border_color;
            ctx.strokeRect(position.x, position.y, props.width, props.height);
            ctx.strokeRect(position.x, position.y, port_width, props.height);
            ctx.strokeRect(position.x + props.width - port_width, position.y, port_width, props.height);
        }

        return null;
    }
}