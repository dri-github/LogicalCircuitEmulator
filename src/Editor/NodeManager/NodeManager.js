import React from "react";
import Node, { Pin, Block, Line } from "./Node";
import Menu, { SEPARATOR_CHARACTER } from "../../Menu/Menu";
import "./NodeManager.css";

/* 
 * ������� ��������������� ����������� ��� ����������� ���� ����������� �������� �������������� �� 3 �����:
 * 1. ���������� ��� ������������ ���������� ���������� �������� ������������� div � ��������� canvas, ������������ canvasRef ��� ��������� �
 * parentDivRef ��� ��������� ������� ������� �������, � ����� ������������ � ������ componentDidMount ���������� ����������� ������� ������� �������
 * � ���������� ��������� �����������
 * 2. ��� ��������� ����������� �� ����� ���������� componentDidUpdate ���������� ��������� ctx (context) ��� ��������� � ���������� ������ ���������
 * 3. ������ ��������� �������� ��������� ����������� ��������������� ����������, ��� ����� ����������� ��� ���� ��������� ����������� ����������,
 * ���������� ��������� ����� � ���� ��������� ����������� � canvas
 */

//����������� ���� ������ ����
const LEFT_MOUSE_BUTTON = 0;
const CENTER_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON = 2;

//���������� ��������
const MOUSE_SENSITIVITY = 0.001; //���������������� ����
const CANVAS_MOVE_BUTTON = CENTER_MOUSE_BUTTON; //������ ����������� ������
const SELECT_BUTTON = LEFT_MOUSE_BUTTON; //������ ���������

//�������
const MS_NONE = "";
const MS_MOVING_THE_CANVAS = "moving_the_canvas";
const MS_NODE_DRAGGING = "node_dragging";
const MS_SELECTING_NODES = "selecting_nodes";

export const TL_MOVING_THE_CANVAS = MS_MOVING_THE_CANVAS;
export const TL_NODE_DRAGGING = MS_NODE_DRAGGING;
export const TL_SELECTING_NODES = MS_SELECTING_NODES;
export const TL_LINE = "line";

export default class NodeManager extends React.Component {
    static defaultProps = {
        propertySelectedNode: { value: null, setValue: null }, //�������� ����������� Node, ���������� ��� �������� ��������� � ������������ ���������
        tool: { value: null, setValue: null } //������ ������������ ��� ��������������, ���������� ��� �������� ��������� � ������������ ���������
    };
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            scale: 1,
            worldPosition: { x: 0, y: 0 }, //������� ���������� (���������� �������� ��� ����� ����������� ������)
            rect: { x: 0, y: 0, width: 0, height: 0 }, //���������� � ������ ������� ������
            mouseState: MS_NONE,
            tool: null,
            mousePosition: { x: 0, y: 0 },
            mouseOldPosition: { x: 0, y: 0 },
            isVisiblePopupMenu: false
        };

        this.nodes = [<Line key={0} points={[{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 40 }, { x: 60, y: 40 }]} />];

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

        if (this.state !== prevState) {
            if (this.props.tool.value !== prevState.tool) {
                //��������� �� ������� NodeManager
            }
        } else {
            if (prevProps.tool.value !== this.props.tool.value) { // || prevState.tool !== this.props.tool.value
                //��������� ��������� �� ������� ToolBar
                this.setState((state) => { return { tool: this.props.tool.value } });
            }
        }
    }

    render() {
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

            //������ ����� ��������� ������� ������
            const drawGrid = (cellSize) => {
                //������ ������ ����� ������������ ������� ��������� (������ ������ ����������� �����)
                const start_x = (state.worldPosition.x - zero_position.x) % cellSize.x + zero_position.x;
                const start_y = (state.worldPosition.y - zero_position.y) % cellSize.y + zero_position.y;

                //��������� �����
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
            };

            //��������� �����
            ctx.strokeStyle = "#CDCDCD";
            drawGrid({ x: 20, y: 20 });

            if (state.mouseState === MS_SELECTING_NODES) {
                ctx.strokeStyle = "#0000FF66";
                ctx.fillStyle = "#0000FF44";
                
                ctx.fillRect(state.mouseOldPosition.x / state.scale - width / 2, state.mouseOldPosition.y / state.scale - height / 2,
                    (state.mousePosition.x - state.mouseOldPosition.x) / state.scale, (state.mousePosition.y - state.mouseOldPosition.y) / state.scale);
                ctx.strokeRect(state.mouseOldPosition.x / state.scale - width / 2, state.mouseOldPosition.y / state.scale - height / 2,
                    (state.mousePosition.x - state.mouseOldPosition.x) / state.scale, (state.mousePosition.y - state.mouseOldPosition.y) / state.scale);
            }

            if (state.tool === TL_LINE) {
                ctx.beginPath();
                ctx.fillStyle = "#000000FF";
                ctx.arc(state.mouseOldPosition.x / state.scale - width / 2 - (state.mouseOldPosition.x / state.scale - width / 2) % 20,
                    state.mouseOldPosition.y / state.scale - height / 2 - (state.mouseOldPosition.y / state.scale - height / 2) % 20,
                    2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        //������� ���������� ��� ������������� ������� ����
        const onWheel = (event) => {
            //����������� ��������������
            const delta = 1 + (event.deltaY || event.detail || event.wheelDelta) * MOUSE_SENSITIVITY;
            state.ctx.scale(delta, delta);

            this.setState((state) => { return { scale: state.scale * delta } });
        }

        //������� ���������� ��� ������� ������ ����
        const onMouseDown = (event) => {
            const rect = this.parentDivRef.current.getBoundingClientRect();

            //� ����������� �� ������� ������ ������������ �������� ����������� ����
            switch (event.button) {
                case CANVAS_MOVE_BUTTON:
                    this.setState((state) => { return { mouseState: MS_MOVING_THE_CANVAS } });
                    break;
                case SELECT_BUTTON:
                    this.setState((state) => { return { mouseState: MS_SELECTING_NODES } });
                    break;
                default:
                    break;
            }

            switch (state.tool) {
                case TL_MOVING_THE_CANVAS:
                    this.setState((state) => { return { mouseState: MS_MOVING_THE_CANVAS } });
                    break;
                case TL_NODE_DRAGGING:
                    this.setState((state) => { return { mouseState: MS_NODE_DRAGGING } });
                    break;
                case TL_SELECTING_NODES:
                    this.setState((state) => { return { mouseState: MS_SELECTING_NODES } });
                    break;
                default:
                    break;
            }

            //������ ��������� ���� �� ������
            this.setState((state) => {
                const mousePosition = { x: event.clientX - rect.x, y: event.clientY - rect.y };
                return {
                    //��������� ���� ���� ������ ���� ���� ������ �� ��������� ����
                    isVisiblePopupMenu: false,
                    mousePosition: mousePosition,
                    mouseOldPosition: mousePosition
                }
            });

            //��������� ����������� ��������� ������ ���� ���� ����� �� ������� canvas ��� ���� ������ ���� ���� ������
            if (event.preventDefault)
                event.preventDefault();
        }
        //������� ���������� ��� ����������� ����
        const onMouseMove = (event) => {
            const rect = this.parentDivRef.current.getBoundingClientRect();
            if (state.mouseState !== MS_NONE && state.tool === null) {
                this.props.tool.setValue(state.mouseState);
            }

            //������������ �� �������������� �����
            switch (state.mouseState) {
                case MS_NODE_DRAGGING:
                case MS_SELECTING_NODES:
                    this.setState((state) => { return { mousePosition: { x: event.clientX - rect.x, y: event.clientY - rect.y } } });
                    break;
                case MS_MOVING_THE_CANVAS:
                    this.setState((state) => {
                        return {
                            worldPosition: {
                                x: state.worldPosition.x + (event.clientX - rect.x - state.mouseOldPosition.x) / state.scale,
                                y: state.worldPosition.y + (event.clientY - rect.y - state.mouseOldPosition.y) / state.scale
                            },
                            mouseOldPosition: {
                                x: event.clientX - rect.x,
                                y: event.clientY - rect.y
                            }
                        }
                    });
                    break;
                default:
                    break;
            }
        }
        //������� ���������� ��� ���������� ������ ���� ��� ����� ���� �������� canvas
        const onMouseUp = (event) => {
            this.setState((state) => { return { mouseState: MS_NONE } });
        }

        const onContextMenu = (event) => {
            if (state.tool === null)
                this.setState((state) => { return { isVisiblePopupMenu: true } });
            else
                this.setState((state) => { return { tool: null } });
            if (event.preventDefault)
                event.preventDefault();
        }

        const addNode = () => {
            this.props.children[React.Children.count(this.props.children)] = (
                <Node key={this.nodes.length} x={0} y={0} width={200} height={480}>
                    <Block side="left">
                        <Pin name="D0" />
                        <Pin name="D1" />
                        <Pin name="D2" />
                        <Pin name="D3" />
                        <Pin name="D4" />
                        <Pin name="D5" />
                        <Pin name="D6" />
                        <Pin name="D7" />
                    </Block>
                    <Block side="left">
                        <Pin name="WAIT" />
                        <Pin name="INT" />
                        <Pin name="NMI" />
                        <Pin name="RESET" />
                    </Block>
                    <Block side="left">
                        <Pin name="WAIT" />
                        <Pin name="INT" />
                        <Pin name="NMI" />
                        <Pin />
                        <Pin name="RESET" />
                    </Block>
                    <Block side="left">
                        <Pin name="BUSRQ" />
                    </Block>
                    <Block side="right">
                        <Pin name="A0" />
                        <Pin name="A1" />
                        <Pin name="A2" />
                        <Pin name="A3" />
                        <Pin name="A4" />
                        <Pin name="A5" />
                        <Pin name="A6" />
                        <Pin name="A7" />
                        <Pin name="A8" />
                        <Pin name="A9" />
                        <Pin name="A10" />
                        <Pin name="A11" />
                        <Pin name="A12" />
                        <Pin name="A13" />
                        <Pin name="A14" />
                        <Pin name="A15" />
                    </Block>
                    <Block side="right">
                        <Pin name="M1" />
                        <Pin name="MREQ" />
                        <Pin name="IORQ" />
                        <Pin name="RD" />
                        <Pin name="WR" />
                        <Pin name="RFSH" />
                    </Block>
                </Node>
            );
        }

        /*
        const onSlectMenuTip = (name) => {
            this.setState((state) => { return { isVisiblePopupMenu: false } });
        }

        {React.cloneElement(this.props.contextMenu, {
                        onSelect: (name) => {
                            if (this.props.onSlectMenuTip) {
                                this.props.onSlectMenuTip(name);
                            }
                            onSlectMenuTip(name);
                        }
                    })}
        */
        const contextMenu = (<Menu buttons={{
                popup: [
                    { name: "Create Node" },
                    { name: "Clear" },
                    {
                        name: "Copy", popup: [
                            { name: "Test" }
                        ]
                    }
                ]
        }} onSelect={(name) => {
            switch (name) {
                //case "Create Node":
                //    addNode();
                //    break;
                case "Clear":
                    this.nodes = [];
                    break;
                case "Create Node":
                    //React.removeChild(React.Children.toArray(this.props.children)[0]);
                    break;
                default:
                    break;
            }
            this.setState((state) => { return { isVisiblePopupMenu: false } });
        }} />);

        const getIndexById = (array, id) => {
            for (let index = 0; index < array.length; index++) {
                if (array[index].id === id)
                    return index;
            }

            return -1;
        }

        if (this.currentSelectedNodes.length !== 1 || this.selectedNodes.length <= 1 || (this.props.useIdSystem === true ? getIndexById(this.selectedNodes, this.currentSelectedNodes[0].id) : this.selectedNodes.indexOf(this.currentSelectedNodes[0])) === -1 || (state.mouseState === MS_SELECTING_NODES && !this.isOnPoint())) {
            this.selectedNodes = Object.assign([], this.currentSelectedNodes);
        }

        return (
            <div ref={this.parentDivRef} className="canvas">
                {state.isVisiblePopupMenu === true ?
                    <div style={{ position: "absolute", left: state.mousePosition.x + state.rect.left, top: state.mousePosition.y + state.rect.top }}>
                        {contextMenu}
                    </div> : null
                }
                <canvas ref={this.canvasRef}
                    width={state.rect.width}
                    height={state.rect.height}
                    onMouseOver={(event) => { if (this.props.onMouseEnter) this.props.onMouseEnter(event); }}
                    onWheel={onWheel}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onContextMenu={onContextMenu}>
                    {React.Children.map(this.props.children, (node, index) => {
                        let nodeProps = {};
                        //�������� ������� ���������� �������� � ������������ � �����-�� �� ������ �������������
                        nodeProps.index = index;
                        nodeProps.ctx = state.ctx;

                        //event ������������ ����� �������� ������� ���������� �� ���� ���������� ���������
                        nodeProps.event = {
                            worldPosition: state.worldPosition,
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
                            propertys: getIndexById(this.props.selectedNodes.value, index) > -1 ? this.props.selectedNodes.value[getIndexById(this.props.selectedNodes.value, index)] : null
                        };

                        //������� ��� ��������������
                        nodeProps.setSelected = (nodeProperties, value) => {
                            if (value === true) {
                                if ((this.props.useIdSystem === true ? getIndexById(this.currentSelectedNodes, nodeProperties.id) : this.currentSelectedNodes.indexOf(nodeProperties)) === -1) {
                                    this.currentSelectedNodes.push(nodeProperties);
                                }

                                if (this.isOnPoint()) {
                                    this.setState((state) => {
                                        return { mouseState: MS_NODE_DRAGGING }
                                    });
                                }
                            } else {
                                let _index = this.currentSelectedNodes.indexOf(nodeProperties);
                                if (this.props.useIdSystem === true) {
                                    _index = getIndexById(this.currentSelectedNodes, nodeProperties.id);
                                }
                                if (_index !== -1)
                                    this.currentSelectedNodes.splice(_index, 1);
                            }
                        };
                        nodeProps.getSelected = (nodeProperties, reset = false) => {
                            if (this.props.useIdSystem === true) {
                                let _index = getIndexById(this.selectedNodes, nodeProperties.id);
                                if (reset === true) {
                                    if (state.mouseState === MS_NODE_DRAGGING) {
                                        this.selectedNodes[_index] = nodeProperties;
                                    }
                                    this.currentSelectedNodes[getIndexById(this.currentSelectedNodes, nodeProperties.id)] = nodeProperties;
                                }
                                return _index !== -1;
                            }
                            return this.selectedNodes.indexOf(nodeProperties) !== -1;
                        };

                        return React.cloneElement(node, nodeProps);
                    })}
                </canvas>
            </div>
        );
    }
}