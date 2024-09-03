import React from "react";
import "./ListView.css";

import { LEFT_MOUSE_BUTTON } from "../header";

class ListView extends React.Component {
    static Element = class Element extends React.Component {
        render() {
            return null;
        }
    }

    static defaultProps = {
        cutOff: 2,
        onRender: (params, index) => { return params; }
    };

    constructor(props) {
        super(props);

        this.state = {
            cutOff: null
        };

        this.mouseIsDragging = false;
    }

    static getDerivedStateFromProps(props, state) {
        let cutOff = state.cutOff;
        switch (typeof props.cutOff) {
            case "number":
                cutOff = props.cutOff;
                break;
            case "string":
                cutOff = (isNaN(Number(props.cutOff)) === false) ? Number(props.cutOff) : state.cutOff;
                break;
            case "function":
                cutOff = props.cutOff();
                break;
            default:
                break;
        }

        if (cutOff < 1) {
            cutOff = 1;
        }

        return { cutOff: cutOff };
    }

    componentDidMount() {
        window.addEventListener("mousedown", (event) => {
            if (event.button === LEFT_MOUSE_BUTTON) {
                this.mouseIsDragging = true;
            }
        });

        window.addEventListener("mouseup", (event) => {
            if (event.button === LEFT_MOUSE_BUTTON) {
                this.mouseIsDragging = false;

                if (this.props.draggedElement) {
                    if (this.props.draggedElement.value !== null) {
                        this.props.draggedElement.setValue(null);
                    }
                }
            }
        });
    }

    render() {
        const props = this.props;
        const state = this.state;

        const onRender = props.onRender;
        const onDragging = (params) => {
            if (props.draggedElement) {
                if (this.mouseIsDragging === true && props.draggedElement.value === null) {
                    props.draggedElement.setValue(params);
                }
            }
        }

        let line = [];

        return (
            <div className="list_view">
                <table>
                    <tbody>
                        {React.Children.map(props.children, (element, index) => {
                            line.push(element.props.children);

                            //На основании данного условия происходит формирование полос элементов заданной длины, происходит разбиение
                            if (onRender && (index % state.cutOff === state.cutOff - 1 || React.Children.count(this.props.children) - 1 === index)) {
                                const result = onRender(line, index, onDragging);
                                line = [];
                                return <tr key={index}>{result}</tr>;
                            } else return null;
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ListView;