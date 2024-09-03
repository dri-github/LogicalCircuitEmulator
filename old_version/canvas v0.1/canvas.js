import React from "react";

class Component extends React.Component {
    constructor(props) {
        super(props);
        this.state = { x: props.x ? props.x : 0, y: props.y ? props.y : 0, width: props.width ? props.width : 0, height: props.height ? props.height : 0 };
    }

    isContain(x, y) { return false; }
    render() {
        return null;
    }
}

export class Rect extends Component {
    isContain(x, y) {
        const rect_x = this.props.x ? this.props.x : 0;
        const rect_y = this.props.y ? this.props.y : 0;

        return (x >= rect_x && x <= rect_x + this.props.width) &&
               (y >= rect_y && y <= rect_y + this.props.height);
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
    render() {
        const ctx = this.props.ctx;
        if (!ctx)
            return null;

        const props = this.props;
        const color = props.color;
        if (color !== undefined)
            ctx.fillStyle = color;

        ctx.beginPath();
        ctx.arc(props.x !== undefined ? props.x : 0,
            props.y !== undefined ? props.y : 0,
            props.radius !== undefined ? props.radius : 0,
            props.startAngle !== undefined ? props.startAngle : 0,
            props.endAngle !== undefined ? props.endAngle : 360);
        ctx.fill();

        const border = props.border;
        if (border !== undefined) {
            ctx.lineWidth = border.width !== undefined ? border.width : 0;
            ctx.strokeStyle = border.color !== undefined ? border.color : 0;

            ctx.arc(props.x !== undefined ? props.x : 0,
                props.y !== undefined ? props.y : 0,
                props.radius !== undefined ? props.radius : 0,
                border.startAngle !== undefined ? border.startAngle : 0,
                border.endAngle !== undefined ? border.endAngle : 360);
            ctx.stroke();
        }
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
            let element_props = Object.assign({}, { ctx: this.props.ctx }, props);
            if (element_props.x) element_props.x += this.state.x; else element_props.x = this.state.x;
            if (element_props.y) element_props.y += this.state.y; else element_props.y = this.state.y;

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
        this.state = { ctx: undefined, is_drag: false };
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
            console.log(this.canvas_ref);
            //let dragable_element = this.getDragableElementByPosition(event.clientX - this.canvas_ref.current.getBoundingClientRect().x, event.clientY - this.canvas_ref.current.getBoundingClientRect().y);
            //console.log(dragable_element);
            const children = React.Children.toArray(this.props.children);
            for (let i = 0; i < children.length; i++) {
                console.log(children[i]);
            }
        }

        return (
            <canvas ref={this.canvas_ref} width={this.props.width} height={this.props.height} onMouseDown={onMouseDown}>
                {React.Children.map(this.props.children, (element) => (React.createElement(element.type, Object.assign({}, { ctx: this.state.ctx }, element.props), element.props.children)))}
            </canvas>
        );
    }
}

export default Canvas;