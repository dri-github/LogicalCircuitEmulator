import React from "react";

export class Pin extends React.Component {
    render() { return null; }
}

export class Block extends React.Component {
    render() { return null; }
}

export default class Node extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_drag: false,
            position: { x: props.x, y: props.y },
            is_fixed: false,
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
        //Проверка на касание мыши и блока
        const is_contain = Node.isContain({ x: state.position.x + props.world_position.x, y: state.position.y + props.world_position.y }, { width: props.width, height: props.height }, props.mouse_position);

        const savePropertys = () => {
            const transform = props.property.value ? props.property.value.transform : null;
            if (transform) {
                if (transform.position.x !== state.position.x || transform.position.y !== state.position.y) {
                    props.property.setValue({
                        index: props.index,
                        transform: {
                            position: state.position,
                            is_fixed: state.is_fixed
                        }
                    });
                } else {
                    return false;
                }
            } else {
                props.property.setValue({
                    index: props.index,
                    transform: {
                        position: state.position,
                        is_fixed: state.is_fixed
                    }
                });
            }

            return true;
        }

        if (is_contain === true) {
            if (props.selectedNode.value < 0) {
                props.selectedNode.setValue(props.index);
                savePropertys();
            }
        }

        if (props.selectedNode.value === props.index) {
            if (!props.property || !props.property.value) {
                console.warn(props.property);
                return null;
            }

            if (state.is_drag && props.selectedNode.is_drag) {
                const is_move = savePropertys();

                return {
                    position: {
                        x: state.is_fixed === false ? (is_move ? props.mouse_position.x - state.delta_position.x : props.property.value.transform.position.x) : state.position.x,
                        y: state.is_fixed === false ? props.mouse_position.y - state.delta_position.y : state.position.y
                    },
                    is_fixed: props.property.value.transform.is_fixed
                };
            } else {
                return {
                    is_drag: true,
                    delta_position: {
                        x: props.mouse_position.x - props.property.value.transform.position.x,
                        y: props.mouse_position.y - props.property.value.transform.position.y
                    },
                    position: props.property.value.transform.position,
                    is_fixed: props.property.value.transform.is_fixed
                };
            }
        } else {
            return {
                is_drag: false
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
        /*const port_height = 20;*/
        const port_width = 70;
        const font = "18px serif";
        const text_color = "#000000";
        const border_color = "#000000";
        const background_color = "#FFFFFF";

        const state = this.state;
        const props = this.props;
        const ctx = props.ctx;
        if (ctx) {
            const position = { x: state.position.x + props.world_position.x, y: state.position.y + props.world_position.y };

            ctx.fillStyle = background_color;
            ctx.fillRect(position.x, position.y, props.width, props.height);

            let delta_position = { left: 0, right: 0 };

            ctx.strokeStyle = "#000000";
            for (let block of React.Children.toArray(props.children)) {
                ctx.strokeRect(block.props.side === "right" ? (position.x + props.width - port_width) : position.x, position.y, port_width, React.Children.toArray(block.props.children).length * 20 + block.props.side === "right" ? delta_position.right : delta_position.left);

                ctx.font = font;
                ctx.fillStyle = "#000000";
                const ports = React.Children.toArray(block.props.children);
                for (let i = 0; i < ports.length; i++) {
                    let metrics = ctx.measureText(ports[i].props.name);
                    ctx.fillText(ports[i].props.name, block.props.side === "right" ? position.x + props.width - (port_width + metrics.width) / 2 : position.x + (port_width - metrics.width) / 2, position.y + 20 * i + 15 + (block.props.side === "right" ? delta_position.right : delta_position.left));
                }

                if (block.props.side === "right") {
                    delta_position.right += React.Children.toArray(block.props.children).length * 20;
                } else {
                    delta_position.left += React.Children.toArray(block.props.children).length * 20;
                }
            }

            ctx.strokeStyle = border_color;
            ctx.strokeRect(position.x, position.y, props.width, props.height);
            ctx.strokeRect(position.x, position.y, port_width, props.height);
            ctx.strokeRect(position.x + props.width - port_width, position.y, port_width, props.height);

            //ctx.font = font;
            //ctx.fillStyle = text_color;
            //for (let i = 0; i < 5; i++) {
            //    ctx.fillText("A" + i, position.x + 15, position.y + 20 * (i + 1));
            //}

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