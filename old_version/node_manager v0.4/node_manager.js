import React from "react";
import "./node_manager.css";

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
        this.selectedNodeIndex = -1;

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
            this.selectedNodeIndex = -1;

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

                        child_props.selectedNode = { is_drag: state.is_drag, value: this.selectedNodeIndex, setValue: (value) => { this.selectedNodeIndex = value } }
                        child_props.property = this.props.propertySelectedNode;

                        //Необходима для обратной связи с Node
                        //Позволяет Node объявить, что он может быть перемещён, так система понимает с каким из Node происходит взаимодействие
                        //Если активными считаются несколько блоков, то выбраным будет считаться последний активный
                        /*const setSelectedNode = (value, index) => {
                            //Если Node разрешает перетаскивание, то его индекс сохраняется
                            if (value === true) {
                                this.selected_node = index;
                            }
                        }*/

                        //Определяет выделен ли Node в данный момент
                        //Если индекс выделенного Node совпадает с текущим и система находится в состоянии перетаскивания то данный Node получает разрешение на перетаскивание
                        //child_props.is_selected = { value: (index === this.selected_node) && state.is_drag, setValue: setSelectedNode };

                        //child_props.property = this.props.propertySelectedNode;

                        return React.cloneElement(child, child_props);
                    })}
                </canvas>
            </div>
        );
    }
}

export default NodeManager;