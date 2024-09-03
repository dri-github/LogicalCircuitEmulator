import { convertCSSNumber } from "../../../header";
import BaseComponent from "./BaseComponent";

export default class Grid extends BaseComponent {
    static defaultProps = {
        ...BaseComponent.defaultProps,
        cellSize: { x: 20, y: 20 },
        getPropertys: (props, state) => {
            return { id: props.index }
        },
        setPropertys: (propertys, state) => { }
    }

    render() {
        const props = this.props;
        const state = this.state;

        const ctx = props.ctx;
        if (ctx) {
            const cellSize = props.cellSize;

            const width = convertCSSNumber(props.width, props.event.width) / props.event.scale;
            const height = convertCSSNumber(props.height, props.event.height) / props.event.scale;

            const zero_position = { x: state.position.x - width / 2, y: state.position.y - height / 2 };

            const start_x = (props.event.worldPosition.x - zero_position.x) % cellSize.x + zero_position.x;
            const start_y = (props.event.worldPosition.y - zero_position.y) % cellSize.y + zero_position.y;

            ctx.strokeStyle = "#CDCDCD";

            //Рисование сетки
            ctx.beginPath();
            for (let x = -cellSize.x + start_x; x <= width + start_x; x += cellSize.x) {
                ctx.moveTo(x, -cellSize.y + start_y);
                ctx.lineTo(x, height + start_y);
                for (let y = -cellSize.y + start_y; y <= height + start_y; y += cellSize.y) {
                    ctx.moveTo(-cellSize.x + start_x, y);
                    ctx.lineTo(width + start_x, y);
                }
            }
            ctx.stroke();
        }

        return null;
    }
}