import React from "react";
import { LEFT_MOUSE_BUTTON, CENTER_MOUSE_BUTTON } from "../../header";

/*
 * Алгоритм работы
 * - Компонент сцена ориентирован под отрисовку всех компонентов находящихся в ней (всех компонентам внутри передаётся ctx для отрисовки, index для идентификации и event для изменяемых значений таких как мировые координаты и тд.),
 *   также они получают два метода setSelected и getSelected, компоненты внутри сцены способны их вызывать и тем самым указывать на свою выделенность и участвовать в выделении и перетаскивании.
 */

/*
 * NONE - отсутствие каких либо значимых действий
 *   [ если была нажата клавиша перетаскивания сцены ]
 *   CANVAS_DRAGING - перетаскивание сцены
 *   [ если была нажата клавиша выделения/перетаскивания ]
 *   SELECTING_NODES - выделение компонентов
 *     [ если нажатие было произведено по компоненту ]
 *     NODE_DRAGGING - перетаскивание компонентов
 */

// mode:
//  static - onRemove не используется
//  dinamic - onRemove используется по изменению координат мышью
//  fixed - onRemove используется по изменению положения сцены

/*
<Scene width={800} height={600}>
    <Grid cellSize={{ x: 10, y: 10 }} width={100%} height={100%} mode="fixed" onRemove={(position) => { return position % 10; }} tolls={[]}/>
    <Node width={80} height={120} mode="dinamic"></Node>
    <Node width={80} height={120} mode="dinamic"></Node>
    <Node width={80} height={120} mode="dinamic"></Node>
    <Node width={80} height={120} mode="dinamic"></Node>
</Scene>
*/

//бЛИН, ОПЯТЬ ВСЁ ПЕРЕПИСЫВАТЬ!!!
/*
<Scene width={800} height={600}>
    <Layer onRemove={(newPosition, props, state) => { return newPosition; }}>
    </Layer>
</Scene>
*/

/* 
 * Система предварительной перерисовки для определения всех необходимых значений ориентированна на 3 этапа:
 * 1. Вызывается при монтировании компонента происходит создание родительского div и дочернего canvas, определяются canvasRef для рисования и
 * parentDivRef для получения размера рабочей области, в конце монтирования в методе componentDidMount происходит определение размера рабочей области
 * и просиходит повторная перерисовка
 * 2. При повторной перерисовке на этапе обновления componentDidUpdate происходит получения ctx (context) для рисования и вызывается третья отрисовка
 * 3. Данная отрисовка является финальным результатом предварительных подготовок, она будет вызываеться при всех следующих обновлениях компонента,
 * происходит отрисовка сетки и всех возможных перерисовок в canvas
 */

//Постоянные значения
const MOUSE_SENSITIVITY = 0.001; //Чувствительность мыши
const CANVAS_MOVE_BUTTON = CENTER_MOUSE_BUTTON; //Кнопка перемещения холста
const SELECT_BUTTON = LEFT_MOUSE_BUTTON; //Кнопка выделения

//События
export const MS_NONE = "";
export const MS_ENTER = "enter";
export const MS_MOVING_THE_CANVAS = "moving_the_canvas";
export const MS_NODE_DRAGGING = "node_dragging";
export const MS_SELECTING_NODES = "selecting_nodes";

export default class Scene extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ctx: null,
            scale: 1,
            worldPosition: { x: 0, y: 0 }, //мировые координаты (определяет смешение для всего содержимого холста)
            rect: { x: 0, y: 0, width: 0, height: 0 }, //координаты и размер области холста
            toolName: MS_NONE,
            mousePosition: { x: 0, y: 0 },
            mouseOldPosition: { x: 0, y: 0 }
        };

        this.canvasRef = React.createRef();
        this.parentDivRef = React.createRef();
    }

    componentDidMount() {
        this.setState((state) => { return { rect: this.parentDivRef.current.getBoundingClientRect() } });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.ctx === null && this.canvasRef.current !== undefined) {
            if (this.canvasRef.current.getContext) {
                this.setState((state) => {
                    const ctx = this.canvasRef.current.getContext("2d");
                    ctx.setTransform(1, 0, 0, 1, state.rect.width / 2, state.rect.height / 2);
                    return { ctx: ctx };
                });
            } else {
                // Canvas unsupported
            }
        }
    }

    render() {
        const props = this.props;
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

            if (state.toolName === "SELECTING") {
                ctx.strokeStyle = "#0000FF66";
                ctx.fillStyle = "#0000FF44";

                ctx.fillRect(state.mouseOldPosition.x / state.scale - width / 2, state.mouseOldPosition.y / state.scale - height / 2,
                    (state.mousePosition.x - state.mouseOldPosition.x) / state.scale, (state.mousePosition.y - state.mouseOldPosition.y) / state.scale);
                ctx.strokeRect(state.mouseOldPosition.x / state.scale - width / 2, state.mouseOldPosition.y / state.scale - height / 2,
                    (state.mousePosition.x - state.mouseOldPosition.x) / state.scale, (state.mousePosition.y - state.mouseOldPosition.y) / state.scale);
            }
        }

        const updateToolsEvent = (eventName, event) => {
            let resultEvents = {};

            for (const tool of props.tools) {
                const onEvent = tool.onEvent;
                if (onEvent) {
                    resultEvents = Object.assign(resultEvents, onEvent(props, state, event));
                }

                const onTargetEvent = tool[eventName];
                if (onTargetEvent) {
                    resultEvents = Object.assign(resultEvents, onTargetEvent(props, state, event));
                }
            }

            this.setState(resultEvents);
        }

        const onWheel = (event) => {
            const wheel = event.deltaY || event.detail || event.wheelDelta;
            if (wheel) {
                const delta = 1 + wheel * MOUSE_SENSITIVITY;
                state.ctx.scale(delta, delta);

                this.setState((state) => { return { scale: state.scale * delta } });
            }
        }

        const onMouseDown = (event) => {
            const newState = updateToolsEvent("onMouseDown", event);
            const rect = this.parentDivRef.current.getBoundingClientRect();

            //Расчёт положения мыши на холсте
            this.setState((state) => {
                const mousePosition = { x: event.clientX - rect.x, y: event.clientY - rect.y };
                return Object.assign({
                    mousePosition: mousePosition,
                    mouseOldPosition: mousePosition
                }, newState);
            });

            //Блокирует возможность выделения текста если мышь вышла за пределы canvas при этом кнопка мыши была зажата
            if (event.preventDefault)
                event.preventDefault();
        }
        
        const onMouseMove = (event) => {
            const newState = updateToolsEvent("onMouseMove", event);
            const rect = this.parentDivRef.current.getBoundingClientRect();
            this.setState(Object.assign({ mousePosition: { x: event.clientX - rect.x, y: event.clientY - rect.y } }, newState));
        }
        
        const onMouseUp = (event) => {
            this.setState(Object.assign({ toolName: "" }, updateToolsEvent("onMouseUp", event)));
        }

        return (
            <div ref={this.parentDivRef} className="canvas">
                <canvas ref={this.canvasRef}
                    width={state.rect.width}
                    height={state.rect.height}
                    onWheel={onWheel}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onMouseEnter={(event) => {
                        if (this.props.onMouseEnter) {
                            const rect = this.parentDivRef.current.getBoundingClientRect();

                            this.setState(() => {
                                return {
                                    mousePosition: { x: event.clientX - rect.x, y: event.clientY - rect.y },
                                    mouseOldPosition: { x: event.clientX - rect.x, y: event.clientY - rect.y },
                                    toolName: "DRAGGING"
                                };
                            });

                            //event.clientX -= rect.x + rect.width / 2 + state.worldPosition.x;
                            //event.clientY -= rect.y + rect.height / 2 + state.worldPosition.y + 10;
                            let position = { x: event.clientX - (rect.x + rect.width / 2 + state.worldPosition.x), y: event.clientY - (rect.y + rect.height / 2 + state.worldPosition.y + 10) };

                            if (this.props.onMouseEnter(event, position)) {

                            }
                        }
                    }}>
                    {React.Children.map(this.props.children, (children, index) => {
                        let nodeProps = {};
                        //Свойства имеющие постоянное значение и определяются в каком-то из циклов инициализации
                        nodeProps.index = index;
                        nodeProps.ctx = state.ctx;

                        //event представляет собой свойства которые изменяются по ходу выполнения программы
                        nodeProps.event = {
                            worldPosition: state.worldPosition,
                            scale: state.scale,
                            width: state.rect.width,
                            height: state.rect.height,
                            mouse: {
                                position: {
                                    x: (state.mousePosition.x - state.rect.width / 2) / state.scale,
                                    y: (state.mousePosition.y - state.rect.height / 2) / state.scale
                                },
                                oldPosition: {
                                    x: (state.mouseOldPosition.x - state.rect.width / 2) / state.scale,
                                    y: (state.mouseOldPosition.y - state.rect.height / 2) / state.scale
                                },
                                toolName: state.toolName
                            }
                        };

                        const getTool = () => {
                            for (const tool of props.tools) {
                                if (tool.getName() === state.toolName)
                                    return tool;
                            }

                            return null;
                        }
                        const tool = getTool();
                        nodeProps.updateElement = tool ? tool.updateElement : null;
                        nodeProps.forceUpdate = (update) => { this.setState((state) => { update(); return state; }); }

                        return React.cloneElement(children, nodeProps);
                    })}
                </canvas>
            </div>
        );
    }
}