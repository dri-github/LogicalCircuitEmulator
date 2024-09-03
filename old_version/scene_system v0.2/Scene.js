import React from "react";
import { LEFT_MOUSE_BUTTON, CENTER_MOUSE_BUTTON } from "../../header";

/*
 * �������� ������
 * - ��������� ����� ������������ ��� ��������� ���� ����������� ����������� � ��� (���� ����������� ������ ��������� ctx ��� ���������, index ��� ������������� � event ��� ���������� �������� ����� ��� ������� ���������� � ��.),
 *   ����� ��� �������� ��� ������ setSelected � getSelected, ���������� ������ ����� �������� �� �������� � ��� ����� ��������� �� ���� ������������ � ����������� � ��������� � ��������������.
 */

/*
 * NONE - ���������� ����� ���� �������� ��������
 *   [ ���� ���� ������ ������� �������������� ����� ]
 *   CANVAS_DRAGING - �������������� �����
 *   [ ���� ���� ������ ������� ���������/�������������� ]
 *   SELECTING_NODES - ��������� �����������
 *     [ ���� ������� ���� ����������� �� ���������� ]
 *     NODE_DRAGGING - �������������� �����������
 */

// mode:
//  static - onRemove �� ������������
//  dinamic - onRemove ������������ �� ��������� ��������� �����
//  fixed - onRemove ������������ �� ��������� ��������� �����

/*
<Scene width={800} height={600}>
    <Grid cellSize={{ x: 10, y: 10 }} width={100%} height={100%} mode="fixed" onRemove={(position) => { return position % 10; }} tolls={[]}/>
    <Node width={80} height={120} mode="dinamic"></Node>
    <Node width={80} height={120} mode="dinamic"></Node>
    <Node width={80} height={120} mode="dinamic"></Node>
    <Node width={80} height={120} mode="dinamic"></Node>
</Scene>
*/

//����, ����� �Ѩ ������������!!!
/*
<Scene width={800} height={600}>
    <Layer onRemove={(newPosition, props, state) => { return newPosition; }}>
    </Layer>
</Scene>
*/

/* 
 * ������� ��������������� ����������� ��� ����������� ���� ����������� �������� �������������� �� 3 �����:
 * 1. ���������� ��� ������������ ���������� ���������� �������� ������������� div � ��������� canvas, ������������ canvasRef ��� ��������� �
 * parentDivRef ��� ��������� ������� ������� �������, � ����� ������������ � ������ componentDidMount ���������� ����������� ������� ������� �������
 * � ���������� ��������� �����������
 * 2. ��� ��������� ����������� �� ����� ���������� componentDidUpdate ���������� ��������� ctx (context) ��� ��������� � ���������� ������ ���������
 * 3. ������ ��������� �������� ��������� ����������� ��������������� ����������, ��� ����� ����������� ��� ���� ��������� ����������� ����������,
 * ���������� ��������� ����� � ���� ��������� ����������� � canvas
 */

//���������� ��������
const MOUSE_SENSITIVITY = 0.001; //���������������� ����
const CANVAS_MOVE_BUTTON = CENTER_MOUSE_BUTTON; //������ ����������� ������
const SELECT_BUTTON = LEFT_MOUSE_BUTTON; //������ ���������

//�������
export const MS_NONE = "";
export const MS_ENTER = "enter";
export const MS_MOVING_THE_CANVAS = "moving_the_canvas";
export const MS_NODE_DRAGGING = "node_dragging";
export const MS_SELECTING_NODES = "selecting_nodes";

export default class Scene extends React.Component {
    static defaultProps = {
        identificationValue: ""
    }
    constructor(props) {
        super(props);

        this.state = {
            ctx: null,
            scale: 1,
            worldPosition: { x: 0, y: 0 }, //������� ���������� (���������� �������� ��� ����� ����������� ������)
            rect: { x: 0, y: 0, width: 0, height: 0 }, //���������� � ������ ������� ������
            mouseState: MS_NONE,
            mousePosition: { x: 0, y: 0 },
            mouseOldPosition: { x: 0, y: 0 }
        };

        this.selectedNodes = [];
        this.currentSelectedNodes = [];

        this.canvasRef = React.createRef();
        this.parentDivRef = React.createRef();
    }

    isOnPoint() { return this.state.mousePosition.x === this.state.mouseOldPosition.x && this.state.mousePosition.y === this.state.mouseOldPosition.y }

    componentDidMount() {
        this.setState((state) => { return { rect: this.parentDivRef.current.getBoundingClientRect() } });
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.ctx && this.canvasRef.current) {
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

        if (prevProps.selectedNodes.value === this.props.selectedNodes.value) {
            if (JSON.stringify(this.selectedNodes) !== JSON.stringify(this.props.selectedNodes.value)) {
                this.props.selectedNodes.setValue(this.selectedNodes);
            }
        } else {
            //��� ������ ��������� ���������� ��� ������ ����� ������ �������� �� ���������� ��������
            this.currentSelectedNodes = Object.assign([], this.selectedNodes = this.props.selectedNodes.value);
        }
    }

    render() {
        console.log("First state: " + this.state.mouseState);
        const props = this.props;
        const state = this.state;

        const ctx = state.ctx;
        if (ctx) {
            //������� ������ � ������ ����������
            const width = state.rect.width / state.scale;
            const height = state.rect.height / state.scale;

            //��� ��� ������ ��������� ��������� � ������ canvas, �� ���������� �������� � ����� ������� ����
            const zero_position = { x: -width / 2, y: -height / 2 };
            //������� ����� ����������
            ctx.clearRect(zero_position.x, zero_position.y, width, height);

            if (state.mouseState === MS_SELECTING_NODES) {
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
                const onEvent = tool[eventName];
                if (onEvent) {
                    resultEvents = Object.assign(resultEvents, onEvent(props, state, event));
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
            updateToolsEvent("onMouseDown", event);
            const rect = this.parentDivRef.current.getBoundingClientRect();

            //� ����������� �� ������� ������ ������������ �������� ����������� ����
            switch (event.button) {
                //case CANVAS_MOVE_BUTTON:
                //    this.setState((state) => { return { mouseState: MS_MOVING_THE_CANVAS } });
                //    break;
                case SELECT_BUTTON:
                    this.setState((state) => { return { mouseState: MS_SELECTING_NODES } });
                    break;
                default:
                    break;
            }

            //������ ��������� ���� �� ������
            this.setState((state) => {
                const mousePosition = { x: event.clientX - rect.x, y: event.clientY - rect.y };
                return {
                    mousePosition: mousePosition,
                    mouseOldPosition: mousePosition
                }
            });

            //��������� ����������� ��������� ������ ���� ���� ����� �� ������� canvas ��� ���� ������ ���� ���� ������
            if (event.preventDefault)
                event.preventDefault();
        }
        
        const onMouseMove = (event) => {
            updateToolsEvent("onMouseMove", event);
            const rect = event.currentTarget.getBoundingClientRect();

            //������������ �� �������������� �����
            switch (state.mouseState) {
                case MS_NODE_DRAGGING:
                case MS_SELECTING_NODES:
                    this.setState((state) => { return { mousePosition: { x: event.clientX - rect.x, y: event.clientY - rect.y } } });
                    break;
                //case MS_MOVING_THE_CANVAS:
                //    this.setState((state) => {
                //        return {
                //            worldPosition: {
                //                x: state.worldPosition.x + (event.clientX - rect.x - state.mouseOldPosition.x) / state.scale,
                //                y: state.worldPosition.y + (event.clientY - rect.y - state.mouseOldPosition.y) / state.scale
                //            },
                //            mouseOldPosition: {
                //                x: event.clientX - rect.x,
                //                y: event.clientY - rect.y
                //            }
                //        }
                //    });
                //    break;
                default:
                    break;
            }
        }
        
        const onMouseUp = (event) => {
            updateToolsEvent("onMouseUp", event);
            console.log("onMouseUp");
            this.setState((state) => { return { mouseState: MS_NONE } });
        }

        const identificationValue = this.props.identificationValue;
        const getIndexById = (array, id) => {
            for (let index = 0; index < array.length; index++) {
                if (array[index][identificationValue] === id)
                    return index;
            }

            return -1;
        }

        //������������ ������� ������� ��������� � ������ ���������
        if (this.currentSelectedNodes.length !== 1 || this.selectedNodes.length <= 1 || ((identificationValue && identificationValue !== "") ? getIndexById(this.selectedNodes, this.currentSelectedNodes[0][identificationValue]) : this.selectedNodes.indexOf(this.currentSelectedNodes[0])) === -1 || (state.mouseState === MS_SELECTING_NODES && !this.isOnPoint())) {
            this.selectedNodes = Object.assign([], this.currentSelectedNodes);
        }

        console.log("Second state: " + this.state.mouseState);

        return (
            <div ref={this.parentDivRef} className="canvas">
                <canvas ref={this.canvasRef}
                    width={state.rect.width}
                    height={state.rect.height}
                    onMouseEnter={(event) => {
                        if (this.props.onMouseEnter) {
                            const rect = this.parentDivRef.current.getBoundingClientRect();

                            this.setState(() => {
                                return {
                                    mousePosition: { x: event.clientX - rect.x, y: event.clientY - rect.y },
                                    mouseOldPosition: { x: event.clientX - rect.x, y: event.clientY - rect.y },
                                    mouseState: "enter"
                                };
                            });

                            //event.clientX -= rect.x + rect.width / 2 + state.worldPosition.x;
                            //event.clientY -= rect.y + rect.height / 2 + state.worldPosition.y + 10;
                            let position = { x: event.clientX - (rect.x + rect.width / 2 + state.worldPosition.x), y: event.clientY - (rect.y + rect.height / 2 + state.worldPosition.y + 10) };

                            if (this.props.onMouseEnter(event, position)) {
                                
                            }
                        }
                    }}
                    onWheel={onWheel}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}>
                    {React.Children.map(this.props.children, (children, index) => {
                        let nodeProps = {};
                        //�������� ������� ���������� �������� � ������������ � �����-�� �� ������ �������������
                        nodeProps.index = index;
                        nodeProps.ctx = state.ctx;

                        const indexProperty = this.props.selectedNodes.value ? getIndexById(this.props.selectedNodes.value, index) : -1;

                        //event ������������ ����� �������� ������� ���������� �� ���� ���������� ���������
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
                                state: state.mouseState
                            },
                            propertys: indexProperty > -1 ? this.props.selectedNodes.value[indexProperty] : null
                        };

                        //������ ��� ��������������

                        //�������� �� �������� ������ �������� �������, ��������� ����������� ��������� ������ ���������� ��������� (selectedNodes)
                        // nodePropertys    - ������, ������� ������� ������� �������� ��� ��������� �������������� �������� �������
                        // value            - �������� �� ������ ������� ����������
                        nodeProps.setSelected = (nodeProperties, value) => {
                            if (value === true) {
                                if (((identificationValue && identificationValue !== "") ? getIndexById(this.currentSelectedNodes, nodeProperties[identificationValue]) : this.currentSelectedNodes.indexOf(nodeProperties)) === -1) {
                                    if (state.mouseState === "enter") {
                                        if (this.currentSelectedNodes.length < 1)
                                            this.currentSelectedNodes.push(nodeProperties);
                                    } else this.currentSelectedNodes.push(nodeProperties);
                                }

                                if (this.isOnPoint()) {
                                    this.setState((state) => {
                                        return { mouseState: MS_NODE_DRAGGING }
                                    });
                                }
                            } else if (state.mouseState !== "enter") {
                                let _index = this.currentSelectedNodes.indexOf(nodeProperties);
                                if (identificationValue && identificationValue !== "") {
                                    _index = getIndexById(this.currentSelectedNodes, nodeProperties[identificationValue]);
                                }
                                if (_index !== -1)
                                    this.currentSelectedNodes.splice(_index, 1);
                            }
                        };
                        //��������� ������ �������� �������, �������� �� �� ����������
                        // nodeProppertys   - ������, ������� ������� ������� �������� ��� ��������� �������������� �������� �������
                        // reload           - ����� �� ����������� ���������� ������ ��������
                        nodeProps.getSelected = (nodeProperties, reload = false) => {
                            if (identificationValue && identificationValue !== "") {
                                let _index = getIndexById(this.selectedNodes, nodeProperties[identificationValue]);
                                if (reload === true) {
                                    if (state.mouseState === MS_NODE_DRAGGING) {
                                        this.selectedNodes[_index] = nodeProperties;
                                    }
                                    this.currentSelectedNodes[getIndexById(this.currentSelectedNodes, nodeProperties[identificationValue])] = nodeProperties;
                                }
                                return _index !== -1;
                            }
                            return this.selectedNodes.indexOf(nodeProperties) !== -1;
                        };

                        return React.cloneElement(children, nodeProps);
                    })}
                </canvas>
            </div>
        );
    }
}