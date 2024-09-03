import React from "react";
import "./node_manager.css";

export class Port extends React.Component {
    render() { return null; }
}

export class Block extends React.Component {
    render() { return null; }
}

export class Node extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_drag: false,
            position: { x: props.x, y: props.y },
            is_fixed: props.property.value ? props.property.value.transform.is_fixed : false,
            delta_position: { x: 0, y: 0 }
        };
    }

    static isContain(position, size, mouse_position) {
        if (!position || !mouse_position)
            return false;

        return (mouse_position.x >= position.x && mouse_position.x <= position.x + size.width) &&
               (mouse_position.y >= position.y && mouse_position.y <= position.y + size.height)
    }

    static getDerivedStateFromProps(props, state) {
        const is_contain = Node.isContain({ x: state.position.x + props.world_position.x, y: state.position.y + props.world_position.y }, { width: props.width, height: props.height }, props.mouse_position);
        props.is_selected.setValue(is_contain, props.index);

        if (props.is_selected.value === true && state.is_fixed === false) {
            if (state.is_drag === true) {
                //Отправляет изменённые значения позиции
                if (props.property.setValue && (props.property.value === null || props.property.value.transform.position !== state.position || props.property.value.transform.is_fixed !== state.is_fixed)) {
                    props.property.setValue({ index: props.index, transform: { position: state.position, is_fixed: state.is_fixed } });
                }

                return {
                    position: {
                        x: props.mouse_position.x - state.delta_position.x,
                        y: props.mouse_position.y - state.delta_position.y
                    }
                };
            } else {
                return {
                    is_drag: true,
                    delta_position: {
                        x: props.mouse_position.x - state.position.x,
                        y: props.mouse_position.y - state.position.y
                    },
                    position: state.position
                };
            }
        } else {
            return {
                is_drag: false,
                is_fixed: props.property.value ? props.property.value.transform.is_fixed : state.is_fixed
            };
        }

        return null;
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
        const background_color = "#00FF00";

        const state = this.state;
        const props = this.props;
        const ctx = props.ctx;
        if (ctx) {
            let left_array = new Array(0);
            let max_left_width = 0;

            const position = { x: state.position.x + props.world_position.x, y: state.position.y + props.world_position.y };

            ctx.fillStyle = background_color;
            ctx.fillRect(position.x, position.y, props.width, props.height);

            ctx.strokeStyle = border_color;
            ctx.strokeRect(position.x, position.y, props.width, props.height);
            ctx.strokeRect(position.x, position.y, 50, props.height);
            ctx.strokeRect(position.x + props.width - 50, position.y, 50, props.height);

            /*React.Children.forEach(props.children, (block) => {
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

            let position = { x: state.position.x + props.world_position.x, y: state.position.y + props.world_position.y };
            for (let left_block of left_array) {
                let shift = 0;
                for (let left_port of left_block) {
                    ctx.fillText(left_port, position.x, position.y + shift);
                    shift += 20;
                }

                ctx.strokeStyle = "#000077";
                ctx.strokeRect(position.x, position.y - 20, max_left_width, shift);
                position.y += shift;
            }*/

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

/* 
 * Система предварительной перерисовки для определения всех необходимых значений ориентированна на 3 этапа:
 * 1. Вызывается при монтировании компонента происходит создание родительского div и дочернего canvas, определяются canvas_ref для рисования и
 * parent_div_ref для получения размера рабочей области, в конце монтирования в методе componentDidMount происходит определение размера рабочей области
 * и просиходит повторная перерисовка
 * 2. При повторной перерисовке на этапе обновления componentDidUpdate происходит получения ctx (context) для рисования и вызывается третья отрисовка
 * 3. Данная отрисовка является финальным результатом предварительных подготовок, она будет вызываеться при всех следующих обновлениях компонента,
 * происходит отрисовка сетки и всех возможных перерисовок в canvas
 */

//Стандартные коды клавиш мыши
const LEFT_MOUSE_BUTTON = 0;
const CENTER_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON = 2;

//Постоянные значения
const MOUSE_SENSITIVITY = 0.001; //Чувствительность мыши
const CANVAS_MOVE_BUTTON = CENTER_MOUSE_BUTTON; //Кнопка перемещения холста
const SELECT_BUTTON = LEFT_MOUSE_BUTTON; //Кнопка выделения

class NodeManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //контекст рисования на холсте
            ctx: null,
            //маштаб
            scale: 1,
            //находится ли холст в состоянии перемещения
            is_move: false,
            //координаты мыши в предыдущий момент времени
            old_mouse_position: { x: 0, y: 0 },
            //мировые координаты (определяет смешение для всего содержимого холста)
            world_position: { x: 0, y: 0 },
            //координаты и размер области холста
            rect: { x: 0, y: 0, width: 0, height: 0 },
            //происходит ли перетаскивание блока
            is_drag: false,
            //координаты мыши
            mouse_position: { x: 0, y: 0 },
            is_visible_popup_menu: false
        };

        //Индекс выбранного блока
        this.selected_node = -1;

        this.canvas_ref = React.createRef();
        this.parent_div_ref = React.createRef();

        this.drawGrid = this.drawGrid.bind(this);
    }

    componentDidMount() {
        this.setState((state) => { return { rect: this.parent_div_ref.current.getBoundingClientRect() } });
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.ctx && this.canvas_ref.current) {
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
            this.selected_node = -1;

            //В зависимости от нажатой кнопки определяется значение перемешения мыши
            switch (event.button) {
                case CANVAS_MOVE_BUTTON:
                    this.setState((state) => { return { is_move: true, is_drag: false } });
                    break;
                case SELECT_BUTTON:
                    this.setState((state) => { return { is_move: false, is_drag: true } });
                    break;
            }

            //Расчёт положения мыши на холсте
            this.setState((state) => {
                const mouse_position = { x: event.clientX - rect.x, y: event.clientY - rect.y };
                return {
                    //Закрывает меню если кнопка мыши была нажата за пределами меню
                    is_visible_popup_menu: false,
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

        const onSlectMenuTip = (name) => {
            this.setState((state) => { return { is_visible_popup_menu: false } });
        }

        return (
            <div ref={this.parent_div_ref} className="canvas">
                {state.is_visible_popup_menu === true ? <div style={{ position: "absolute", left: state.mouse_position.x + state.rect.left, top: state.mouse_position.y + state.rect.top }}>
                    {React.cloneElement(this.props.contextMenu, {
                        onSelect: (name) => {
                            if (this.props.onSlectMenuTip) {
                                this.props.onSlectMenuTip(name);
                            }
                            onSlectMenuTip(name);
                        }
                    })}
                </div> : null}
                <canvas ref={this.canvas_ref}
                    width={state.rect.width}
                    height={state.rect.height}
                    onWheel={onWheel}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onContextMenu={(event) => { this.setState((state) => { return { is_visible_popup_menu: true } }); event.preventDefault(); }}>
                    {React.Children.map(this.props.children, (child, index) => {
                        let child_props = Object.assign({}, child.props);
                        //Дополнение необходимыми свойствами
                        child_props.index = index;
                        child_props.ctx = state.ctx;
                        child_props.world_position = state.world_position;
                        child_props.mouse_position = {
                            x: (state.mouse_position.x - state.rect.width / 2) / state.scale,
                            y: (state.mouse_position.y - state.rect.height / 2) / state.scale
                        }

                        //Необходима для обратной связи с Node
                        //Позволяет Node объявить, что он может быть перемещён, так система понимает с каким из Node происходит взаимодействие
                        //Если активными считаются несколько блоков, то выбраным будет считаться последний активный
                        const setSelectedNode = (value, index) => {
                            //Если Node разрешает перетаскивание, то его индекс сохраняется
                            if (value === true) {
                                this.selected_node = index;
                            }
                        }

                        //Определяет выделен ли Node в данный момент
                        //Если индекс выделенного Node совпадает с текущим и система находится в состоянии перетаскивания то данный Node получает разрешение на перетаскивание
                        child_props.is_selected = { value: (index === this.selected_node) && state.is_drag, setValue: setSelectedNode };

                        let property = { value: null, setValue: null };
                        if (index === this.selected_node) {
                            property = this.props.propertySelectedNode;
                        }
                        child_props.property = property;

                        return React.cloneElement(child, child_props);
                    })}
                </canvas>
            </div>
        );
    }
}

export default NodeManager;