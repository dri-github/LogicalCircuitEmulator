import React from "react";
import "./canvas.css";

/*
<WorkZone width="100" height="100">
    <Node type/name="">
        <Block side="left">
            <Port name="INT" />
        </Block>
    </Node>
</WorkZone>
*/

/*function sizeGenerator(value, full_size) {
    switch (typeof (value)) {
        case "number":
            return value;
        case "string":
            if (value.length > 0) {
                if (value[value.length - 1] === "%")
                    return full_size * Number(value.substring(0, value.length - 1)) * 0.01;

                if (value.length > 2) {
                    const value_type = value.substring(value.length - 2, value.length);
                    switch (value_type) {
                        case "px":
                            return Number(value.substring(0, value.length - value_type.length));
                        default:
                            console.warn("Warning: unreal type '" + value_type + "'");
                            return Number(value.substring(0, value.length - value_type.length));
                    }
                }

                return Number(value);
            }
            break;
        default:
            console.error("Error: unreal input type '" + typeof (value) + "' in sizeGenerator");
            break;
    }

    return 0;
}*/

export class Port extends React.Component {
    render() {
        const props = this.props;
        const ctx = props.ctx;
        if (ctx) {
            ctx.font = "18px serif";
            ctx.fillStyle = "#770000";
            ctx.fillText(props.name, props.x, props.y);
        }

        return null;
    }
}

export class Block extends React.Component {
    render() {
        let children = null;

        const props = this.props;
        const ctx = props.ctx;
        if (ctx) {
            children = React.Children.map(this.props.children, (element) => {
                let element_props = Object.assign({}, element.props);
                element_props.x = element_props.x ? element_props.x + props.x : props.x;
                element_props.y = element_props.y ? element_props.y + props.y : props.y;

                return React.createElement(element.type, Object.assign({}, element_props, {
                    ctx: ctx
                }), element.props.children)
            })

            ctx.strokeStyle = "#000077";
            ctx.strokeRect(props.x, props.y, 50, 100);
        }

        return children;
    }
}

export class Node extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_drag: false,
            position: { x: props.x, y: props.y },
            delta_position: { x: 0, y: 0 }
        };
    }

    static isContain(props, mouse_position) {
        if (!props.world_position)
            return false;

        const position = { x: props.x + props.world_position.x, y: props.y + props.world_position.y };
        return (mouse_position.x >= position.x && mouse_position.x <= position.x + props.width) && 
               (mouse_position.y >= position.y && mouse_position.y <= position.y + props.height)
    }

    static getDerivedStateFromProps(props, state) {
        console.log("props in derived ", props.x);
        //if (props.draggable) {
        //    if (props.is_drag === true) {
        //        return {
        //            position: {
        //                x: props.x + props.delta_position.x,
        //                y: props.y + props.delta_position.y
        //            }
        //        };
        //    }
        //}

        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("prev props ", prevProps.x);
        console.log("prev state", this.props.x)
    }

    renderBlock(props, position, side) {
        const ctx = this.props.ctx;
        let copy_position_y = position.y;
        let max_width = 0;
        React.Children.forEach(props.children, (element) => {
            const element_props = element.props;
            ctx.font = "18px serif";
            ctx.fillStyle = "#770000";
            ctx.fillText(element_props.name, position.x, position.y);

            let metrics = ctx.measureText(element_props.name);
            if (max_width < metrics.width)
                max_width = metrics.width;

            ctx.strokeStyle = "#000077";
            ctx.beginPath();
            switch (side) {
                case "left":
                    ctx.moveTo(position.x, position.y - 10);
                    ctx.lineTo(position.x - 20, position.y - 10);
                    break;
                case "right":
                    ctx.moveTo(position.x + metrics.width, position.y - 10);
                    ctx.lineTo(position.x + metrics.width + 20, position.y - 10);
                    break;
            }
            ctx.stroke();

            //let metrics = ctx.measureText(element_props.name);//metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
            position.y += 20;
        })

        ctx.strokeStyle = "#000077";
        ctx.strokeRect(position.x, copy_position_y - 20, max_width, position.y - copy_position_y);
    }

    render() {
        const port_height = 20;
        const font = "18px serif";
        const text_color = "#770000";
        const border_color = "#000077";

        const props = this.props;
        const ctx = props.ctx;
        if (ctx) {
            let left_array = new Array(0);
            let max_left_width = 0;

            ctx.fillStyle = "#00FF00";
            ctx.fillRect(props.x + props.world_position.x, props.y + props.world_position.y, props.width, props.height);

            React.Children.forEach(props.children, (block) => {
                const block_props = block.props;
                switch (block_props.side) {
                    case "left":
                        let ports_array = new Array(0);
                        React.Children.forEach(block_props.children, (port) => {
                            const port_name = port.props.name;
                            let metrics = ctx.measureText(port_name);
                            if (max_left_width < metrics.width)
                                max_left_width = metrics.width;
                            ports_array.push(port_name);
                        });
                        left_array.push(ports_array);
                        break;
                    case "reight":
                        break;
                }
            });

            ctx.font = "18px serif";
            ctx.fillStyle = "#770000";

            let position = { x: props.x + props.world_position.x, y: props.y + props.world_position.y };
            for (let left_block of left_array) {
                let shift = 0;
                for (let left_port of left_block) {
                    ctx.fillText(left_port, position.x, position.y + shift);
                    shift += 20;
                }

                ctx.strokeStyle = "#000077";
                ctx.strokeRect(position.x, position.y - 20, max_left_width, shift);
                position.y += shift;
            }

            //let position_left = { x: props.x, y: props.y + 20 };
            //let position_right = { x: props.x + 100, y: props.y + 20 };
            //React.Children.forEach(props.children, (block) => {
            //    const block_props = block.props;
            //    if (block_props.side === "right") {
            //        this.renderBlock(block_props, position_right, block_props.side);
            //    } else {
            //        this.renderBlock(block_props, position_left, block_props.side);
            //    }
            //})
        }

        return null;
    }
}

Node.defaultProps = {
    x: 0,
    y: 0
};

//Стандартные коды клавиш мыши
const LEFT_MOUSE_BUTTON = 0;
const CENTER_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON = 2;

//Чувствительность мыши
const MOUSE_SENSITIVITY = 0.001;
//Кнопка перемещения холста
const CANVAS_MOVE_BUTTON = CENTER_MOUSE_BUTTON;
const DRAG_BUTTON = LEFT_MOUSE_BUTTON;

class WorkZone extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null, //контекст рисования на холсте
            scale: 1, //маштаб
            is_move: false, //находится ли холст в состоянии перемещения
            old_mouse_position: { x: 0, y: 0 },
            world_position: { x: 0, y: 0 },
            rect: { width: props.width, height: props.height },
            is_drag: false,
            mouse_position: { x: 0, y: 0 }
        };
        this.canvas_ref = React.createRef();
        this.parent_div_ref = React.createRef();

        this.drawGrid = this.drawGrid.bind(this);
    }

    componentDidMount() {
        this.setState((state) => { return { rect: this.parent_div_ref.current.getBoundingClientRect() } });
    }

    //Отрисовка сетки заданного размера
    //ctx - контекст рисования на холсте
    //screen_position - позиция на экране
    //world_position - мировые координаты по которым строиться сетка
    //canvas_size - размер холста
    //cell_size - размер одной ячейки
    drawGrid(ctx, screen_position, world_position, canvas_size, cell_size) {
        //Расчёт сдвига сетки относительно мировых координат (создаёт эффект бесконечной сетки)
        const start_x = (world_position.x - screen_position.x) % cell_size.x + screen_position.x;
        const start_y = (world_position.y - screen_position.y) % cell_size.y + screen_position.y;

        //Рисование сетки
        ctx.beginPath();
        for (let x = -cell_size.x + start_x; x <= canvas_size.x + start_x; x += cell_size.x) {
            ctx.moveTo(x, -cell_size.y + start_y);
            ctx.lineTo(x, canvas_size.y + start_y);
            for (let y = -cell_size.y + start_y; y <= canvas_size.y + start_y; y += cell_size.y) {
                ctx.moveTo(-cell_size.x + start_x, y);
                ctx.lineTo(canvas_size.x + start_x, y);
            }
        }
        ctx.stroke();
    }

    render() {
        const state = this.state;

        const ctx = state.ctx;
        if (ctx) {
            //Размеры экрана с учётом увеличения
            const width = state.rect.width / state.scale;
            const height = state.rect.height / state.scale;

            //Так как начало координат находится в центре canvas, то необходимо смещение в левый верхний угол
            const zero_position = { x: -width / 2, y: -height / 2 };
            //Очистка перед отрисовкой
            ctx.clearRect(zero_position.x, zero_position.y, width, height);

            //Рисование сетки
            ctx.strokeStyle = "#CDCDCD";
            this.drawGrid(ctx, zero_position, state.world_position, { x: width, y: height }, { x: 20, y: 20 });
        } else if (this.canvas_ref.current) {
            if (this.canvas_ref.current.getContext) {
                this.setState((state) => {
                    const ctx = this.canvas_ref.current.getContext("2d");
                    ctx.setTransform(1, 0, 0, 1, state.rect.width / 2, state.rect.height / 2);
                    return { ctx: ctx }
                });
            } else {
                // Canvas unsupported
            }
        }

        //Функция вызываемая при прокручивании колёсика мыши
        const onWheel = (event) => {
            //Коэффициент маштабирования
            const delta = 1 + (event.deltaY || event.detail || event.wheelDelta) * MOUSE_SENSITIVITY;
            state.ctx.scale(delta, delta);

            this.setState((state) => { return { scale: state.scale * delta } });
        }

        //Функция вызываемая при нажатии кнопки мыши
        const onMouseDown = (event) => {
            const rect = this.parent_div_ref.current.getBoundingClientRect();
            //В зависимости от нажатой кнопки определяется значение перемешения мыши
            switch (event.button) {
                case CANVAS_MOVE_BUTTON:
                    this.setState((state) => { return { is_move: true, is_drag: false } });
                    break;
                case DRAG_BUTTON:
                    this.setState((state) => { return { is_move: false, is_drag: true } });
                    break;
            }

            //Расчёт положения мыши на холсте
            this.setState((state) => {
                const mouse_position = { x: event.clientX - rect.x, y: event.clientY - rect.y };
                return {
                    mouse_position: mouse_position,
                    old_mouse_position: mouse_position
                }
            });

            //Блокирует возможность выделения текста если мышь вышла за пределы canvas при этом кнопка мыши была зажата
            if (event.preventDefault)
                event.preventDefault();
        }
        //Функция вызываемая при перемещении мыши
        const onMouseMove = (event) => {
            const rect = this.parent_div_ref.current.getBoundingClientRect();

            //Производится ли перетаскивание мышью
            if (state.is_drag === true) {
                this.setState((state) => { return { mouse_position: { x: event.clientX - rect.x, y: event.clientY - rect.y } } });
            } else if (state.is_move === true) { //Иначе перемещает ли мышь холст
                this.setState((state) => {
                    return {
                        world_position: {
                            x: state.world_position.x + (event.clientX - rect.x - state.old_mouse_position.x) / state.scale,
                            y: state.world_position.y + (event.clientY - rect.y - state.old_mouse_position.y) / state.scale
                        },
                        old_mouse_position: {
                            x: event.clientX - rect.x,
                            y: event.clientY - rect.y
                        }
                    }
                });
            }
        }
        //Функция вызываемая при отпускании кнопки мыши или когда мышь покидает canvas
        const onMouseUp = (event) => {
            this.setState((state) => { return { is_move: false, is_drag: false } });
        }

        let is_drag_reserved = false;

        const result = React.Children.map(this.props.children, (child) => {
            let child_props = Object.assign({}, child.props);
            child_props.ctx = state.ctx;
            child_props.world_position = state.world_position;

            if (is_drag_reserved === false) {
                if (is_drag_reserved = Node.isContain(child_props, {
                    x: (state.mouse_position.x - state.rect.width / 2) / state.scale,
                    y: (state.mouse_position.y - state.rect.height / 2) / state.scale
                }) === true) {
                    child_props.x += state.mouse_position.x - state.old_mouse_position.x;
                    child_props.y += state.mouse_position.y - state.old_mouse_position.y;
                }
            }
            child_props.is_drag = state.is_drag;

            return React.cloneElement(child, child_props);
        });

        return (
            <div ref={this.parent_div_ref} className="canvas">
                <canvas ref={this.canvas_ref}
                    width={state.rect.width}
                    height={state.rect.height}
                    onWheel={onWheel}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}>
                    {result}
                </canvas>
            </div>
        );
    }
}

export default WorkZone;