import React from "react";
import BaseComponent from "./BaseComponent";

/*
<Chip>
    <Block side="left">
        <Pin width="20px" height="20px" name="D0"/>
    </Block>
</Chip>
*/

const PIN_LENGHT = 20;
const BORDER_COLOR = "#000000";
const FONT_HEIGHT = 18;
const FONT = FONT_HEIGHT + "px arial";
const TEXT_COLOR = "#000000";
const NEGATIVE_BACKGROUND_COLOR = "#FFFFFF";
const NAGATIVE_RADIUS = 4;
const BACKGROUND_COLOR = "#FFFFFF";

const SIDE_LEFT = "left";
const SIDE_RIGHT = "right";
const SIDE_TOP = "top";
const SIDE_BOTTOM = "bottom";

export class Pin extends React.Component {
    static defaultProps = {
        position: { x: 300, y: 0 },
        side: SIDE_RIGHT
    }
    render() {
        const props = this.props;

        const ctx = props.ctx;
        if (ctx) {
            const position = props.position;
            const width = props.width;

            ctx.strokeStyle = BORDER_COLOR;
            ctx.font = FONT;
            ctx.fillStyle = TEXT_COLOR;
            
            const name = props.name;
            if (name && width) {
                ctx.beginPath();

                ctx.textAlign = "center";
                ctx.moveTo(position.x, position.y);
                switch (props.side) {
                    case SIDE_LEFT: {
                        ctx.lineTo(position.x - PIN_LENGHT, position.y);
                        ctx.fillText(name, position.x + width / 2, position.y + FONT_HEIGHT / 2);
                        break;
                    }
                    case SIDE_RIGHT: {
                        ctx.lineTo(position.x + PIN_LENGHT, position.y);
                        ctx.fillText(name, position.x - width / 2, position.y + FONT_HEIGHT / 2);
                        break;
                    }
                    case SIDE_TOP: {    //TODO: Доделать вертикальные пины
                        ctx.lineTo(position.x, position.y - PIN_LENGHT);

                        ctx.rotate(Math.PI / 2);
                        ctx.fillText(name, position.x, position.y + FONT_HEIGHT / 2);
                        ctx.rotate(-Math.PI / 2);
                        break;
                    }
                    case SIDE_BOTTOM: {
                        ctx.lineTo(position.x, position.y + PIN_LENGHT);
                        break;
                    }
                    default: {
                        console.warn("Unreal side in class \"Pin\"");
                        return null;
                    }
                }

                ctx.stroke();

                if (props.negative) {
                    ctx.fillStyle = NEGATIVE_BACKGROUND_COLOR;
                    const negativePoint = new Path2D();
                    negativePoint.arc(position.x, position.y, NAGATIVE_RADIUS, 0, 2 * Math.PI);
                    ctx.fill(negativePoint);
                    ctx.stroke(negativePoint);
                }
            }
        }

        return null;
    }
}

export class Block extends React.Component {
    static defaultProps = {
        side: SIDE_LEFT,
        pinSize: 0,
        width: 0
    }
    constructor(props) {
        super(props);

        this.state = {
            position: props.position ? props.position : { x: 0, y: 0 }
        };
    }

    static getDerivedStateFromProps(props, state) {
        return { position: props.position }
    }

    render() {
        const props = this.props;
        const state = this.state;

        const position = state.position;
        const pinSize = props.pinSize;

        const ctx = props.ctx;
        if (ctx) {
            ctx.strokeStyle = BORDER_COLOR;
            ctx.strokeRect(position.x, position.y, props.width, pinSize * (React.Children.count(props.children) + 1));
        }

        let delta = { x: 0, y: 0 };

        return React.Children.map(props.children, (pin, index) => {
            let blockProps = {};
            //Свойства имеющие постоянное значение и определяются в каком-то из циклов инициализации
            blockProps.index = index;
            blockProps.ctx = ctx;
            blockProps.height = pinSize;
            blockProps.width = props.width;
            delta.y += pinSize;
            switch (props.side) {
                case SIDE_LEFT: {
                    delta.x = 0;
                    break;
                }
                case SIDE_RIGHT: {
                    delta.x = props.width;
                    break;
                }
                default:
                    break;
            }
            blockProps.position = { x: position.x + delta.x, y: position.y + delta.y };
            blockProps.side = props.side;
            //event представляет собой свойства которые изменяются по ходу выполнения программы
            //blockProps.event = props.event;

            return React.cloneElement(pin, blockProps);
        });
    }
}

export default class Chip extends BaseComponent {
    static defaultProps = {
        ...BaseComponent.defaultProps,
        draggable: true,

        getPropertys: (props, state) => {
            return {
                ...BaseComponent.defaultProps.getPropertys(props, state),
                code: {}
            }
        }
    }
    constructor(props) {
        super(props);

        this.state = Object.assign({
            code: {}
        }, this.state);
    }

    render() {
        const props = this.props;
        const state = this.state;

        const event = props.event;
        const worldPosition = event.worldPosition;

        const ctx = props.ctx;
        if (ctx) {
            const position = { x: state.position.x + worldPosition.x, y: state.position.y + worldPosition.y };

            ctx.fillStyle = BACKGROUND_COLOR;
            ctx.strokeStyle = BORDER_COLOR;
            if (state.isSelected === true) {
                ctx.fillStyle = "#9999CC";
            }
            ctx.fillRect(position.x, position.y, props.width, props.height);

            ctx.strokeRect(position.x, position.y, props.width, props.height);
            ctx.strokeRect(position.x, position.y, props.blockWidth, props.height);
            ctx.strokeRect(position.x + props.width - props.blockWidth, position.y, props.blockWidth, props.height);
        }

        let stepPosition = { left: 0, right: 0, top: 0, bottom: 0 };
        return React.Children.map(props.children, (block, index) => {
            let blockProps = {};
            //Свойства имеющие постоянное значение и определяются в каком-то из циклов инициализации
            blockProps.index = index;
            blockProps.ctx = ctx;

            blockProps.position = { x: state.position.x + worldPosition.x, y: state.position.y + worldPosition.y };

            switch (block.props.side) {
                case SIDE_LEFT: {
                    blockProps.position.x += 0;
                    blockProps.position.y += stepPosition.left;
                    stepPosition.left += (React.Children.count(block.props.children) + 1) * block.props.pinSize;
                    break;
                }
                case SIDE_RIGHT: {
                    blockProps.position.x += props.width - props.blockWidth;
                    blockProps.position.y += stepPosition.right;
                    stepPosition.right += (React.Children.count(block.props.children) + 1) * block.props.pinSize;
                    break;
                }
                default: {
                    console.warn("Unreal side in class \"Chip\"");
                    return null;
                }
            }
            blockProps.width = props.blockWidth;

            //event представляет собой свойства которые изменяются по ходу выполнения программы
            //blockProps.event = props.event;

            return React.cloneElement(block, blockProps);
        });
    }
}