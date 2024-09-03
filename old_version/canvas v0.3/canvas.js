import React from "react";

/*
                                    <Canvas width={400} height={300}>
                                        <Layer x={50} y={100}>
                                            <Rect drageble x={100} width={100} height={100} color={"#00FF00"} border={{ width: 1, color: "#FF0000" }} />
                                            <Circle drageble radius={10} color={"#00FF00"} />
                                            <Line points={[0, 0, 50, 0, 50, 10]} y={50} color={"#0000FF"} />
                                        </Layer>
                                    </Canvas>
                                */

class Component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            x: props.x ? props.x : 0,
            y: props.y ? props.y : 0,
            width: props.width ? props.width : 0,
            height: props.height ? props.height : 0,
            is_drag: false,
            dx: 0,
            dy: 0
        };
    }

    isContain(x, y) { return false; }
    render() {
        return null;
    }
}

export class Rect extends Component {
    isContain(x, y) {
        const rect_x = 0;
        const rect_y = 0;

        return (x >= rect_x && x <= rect_x + this.props.width) &&
               (y >= rect_y && y <= rect_y + this.props.height);
    }

    static getDerivedStateFromProps(props, state) {
        const isContain = (x, y) => {
            const rect_x = state.x - props.x;
            const rect_y = state.y - props.y;

            return (x >= rect_x && x <= rect_x + props.width) &&
                   (y >= rect_y && y <= rect_y + props.height);
        }

        const clear = () => {
            if (props.ctx) {
                props.ctx.clearRect(state.x - props.border.width, state.y - props.border.width, props.width + props.border.width * 2, props.height + props.border.width * 2);
            }
        }

        if (props.drageble) {
            if (state.is_drag === true) {
                if (props.is_drag === false) {
                    return { is_drag: false };
                } else {
                    clear();
                    return {
                        x: props.mouse_x + props.x - state.dx,
                        y: props.mouse_y + props.y - state.dy
                    };
                }
            } else {
                if (props.is_drag === true && isContain(props.mouse_x, props.mouse_y) === true) {
                    clear();
                    return {
                        is_drag: true,
                        dx: props.mouse_x - (state.x - props.x),
                        dy: props.mouse_y - (state.y - props.y),
                        x: state.x,
                        y: state.y
                    };
                }
            }
        }
        return null; // No change to state
    }

    render() {
        const ctx = this.props.ctx;
        if (ctx) {
            const state = this.state;
            const border = this.props.border;

            if (border) {
                ctx.lineWidth = border.width ? border.width : 0;
                ctx.strokeStyle = border.color ? border.color : 0;
                ctx.strokeRect(state.x, state.y, state.width, state.height);
            }

            ctx.fillStyle = this.props.color;
            ctx.fillRect(state.x, state.y, state.width, state.height);
        }

        return null;
    }
}

export class Circle extends Component {
    isContain(x, y) {
        const position_x = this.props.x ? this.props.x : 0;
        const position_y = this.props.y ? this.props.y : 0;
        const radius = this.props.radius ? this.props.radius : 0;

        return (Math.pow(x - position_x, 2) + Math.pow(y - position_y, 2)) <= Math.pow(radius, 2);
    }
    static getDerivedStateFromProps(props, state) {
        const isContain = (x, y) => {
            const position_x = state.x - props.x;
            const position_y = state.y - props.y;
            const radius = props.radius ? props.radius : 0;

            return (Math.pow(x - position_x, 2) + Math.pow(y - position_y, 2)) <= Math.pow(radius, 2);
        }

        const clear = () => {
            if (props.ctx) {
                props.ctx.clearRect(state.x - props.radius, state.y - props.radius, props.radius * 2, props.radius * 2);
            }
        }

        if (props.drageble) {
            if (state.is_drag === true) {
                if (props.is_drag === false) {
                    return { is_drag: false };
                } else {
                    clear();
                    return {
                        x: props.mouse_x + props.x - state.dx,
                        y: props.mouse_y + props.y - state.dy
                    };
                }
            } else {
                if (props.is_drag === true && isContain(props.mouse_x, props.mouse_y) === true) {
                    clear();
                    return {
                        is_drag: true,
                        dx: props.mouse_x - (state.x - props.x),
                        dy: props.mouse_y - (state.y - props.y),
                        x: state.x,
                        y: state.y
                    };
                }
            }
        }
        return null; // No change to state
    }

    render() {
        const ctx = this.props.ctx;
        if (ctx) {

            const state = this.state;
            const color = this.props.color;
            if (color !== undefined)
                ctx.fillStyle = color;

            ctx.beginPath();
            ctx.arc(state.x !== undefined ? state.x : 0,
                state.y !== undefined ? state.y : 0,
                this.props.radius !== undefined ? this.props.radius : 0,
                this.props.startAngle !== undefined ? this.props.startAngle : 0,
                this.props.endAngle !== undefined ? this.props.endAngle : 360);
            ctx.fill();

            const border = this.props.border;
            if (border) {
                ctx.lineWidth = border.width !== undefined ? border.width : 0;
                ctx.strokeStyle = border.color !== undefined ? border.color : 0;

                ctx.arc(state.x !== undefined ? state.x : 0,
                    state.y !== undefined ? state.y : 0,
                    state.radius !== undefined ? state.radius : 0,
                    border.startAngle !== undefined ? border.startAngle : 0,
                    border.endAngle !== undefined ? border.endAngle : 360);
                ctx.stroke();
            }
        }
        return null;
    }
}

export class Line extends Component {
    render() {
        const ctx = this.props.ctx;
        if (!ctx)
            return null;

        const props = this.props;
        const width = props.width;
        if (width !== undefined)
            ctx.lineWidth = width;

        const color = props.color;
        if (color !== undefined) {
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
        }
        if (props.points !== undefined) {
            ctx.beginPath();
            for (let i = 0; i < props.points.length; i += 2) {
                ctx.lineTo(props.points[i] + (props.x !== undefined ? props.x : 0), props.points[i + 1] + (props.y !== undefined ? props.y : 0));
            }
        }

        if (width !== undefined)
            ctx.stroke();
        else
            ctx.fill();

        return null;
    }
}

export class Layer extends Component {
    getDragableElementByPosition(x, y) {
        const props = this.props;
        const children = React.Children.toArray(props.children);
        for (let i = 0; i < children.length; i++) {
            let element = children[i];
            const base_element = element.type.prototype;
            base_element.props = Object.assign({}, element.props);
            base_element.state = element.state;

            let _x = x;
            let _y = y;
            _x -= props.x !== undefined ? props.x : 0;
            _y -= props.y !== undefined ? props.y : 0;

            if (base_element.getDragableElementByPosition !== undefined) {
                return base_element.getDragableElementByPosition(_x, _y);
            } else if (base_element.isContain(_x, _y) === true) {
                return base_element;
            }
        };

        return undefined;
    }

    render() {
        const convertProps = (props) => {
            let element_props = Object.assign({}, { ctx: this.props.ctx, mouse_x: this.props.mouse_x, mouse_y: this.props.mouse_y }, props);
            if (element_props.x) element_props.x += this.state.x; else element_props.x = this.state.x;
            if (element_props.y) element_props.y += this.state.y; else element_props.y = this.state.y;

            element_props.mouse_x -= element_props.x;
            element_props.mouse_y -= element_props.y;
            element_props.is_drag = this.props.is_drag;

            return element_props;
        }

        return React.Children.map(this.props.children, (element) => (
            React.createElement(element.type, convertProps(element.props), element.props.children)
        ));
    }
}

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.canvas_ref = React.createRef();
        this.state = { ctx: undefined, is_drag: false, mouse_x: 0, mouse_y: 0 };
    }

    componentDidMount() {
        this.setState((state) => { return { ctx: this.canvas_ref.current.getContext("2d") } });
    }

    getDragableElementByPosition(x, y) {
        const children = React.Children.toArray(this.props.children);
        for (let i = 0; i < children.length; i++) {
            let element = children[i];

            const base_element = element.type.prototype;
            base_element.props = Object.assign({}, element.props);
            base_element.state = element.state;
            if (base_element.getDragableElementByPosition !== undefined) {
                return base_element.getDragableElementByPosition(x, y);
            } else if (base_element.isContain(x, y) === true)
                return base_element;
        }

        return undefined;
    }

    render() {
        const onMouseDown = (event) => {
            this.canvas_ref.current.focus();
            this.setState((state) => {
                return {
                    is_drag: true,
                    mouse_x: event.clientX - this.canvas_ref.current.getBoundingClientRect().x,
                    mouse_y: event.clientY - this.canvas_ref.current.getBoundingClientRect().y
                }
            });
        }
        const onMouseMove = (event) => {
            if (this.state.is_drag === true) {
                this.setState((state) => {
                    return {
                        mouse_x: event.clientX - this.canvas_ref.current.getBoundingClientRect().x,
                        mouse_y: event.clientY - this.canvas_ref.current.getBoundingClientRect().y
                    }
                });
            }
        }
        const onMouseUp = (event) => {
            this.setState((state) => {
                return {
                    is_drag: false
                }
            });
        }

        return (
            <canvas ref={this.canvas_ref} width={this.props.width} height={this.props.height} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
                {React.Children.map(this.props.children, (element) => (React.createElement(element.type, Object.assign({}, this.state, element.props), element.props.children)))}
            </canvas>
        );
    }
}

export default Canvas;