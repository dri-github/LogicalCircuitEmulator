import React from "react";
import "./Toggle.css";

const CLASS_NAME = "toggle";
const CL_ACTIVE = "_active";

export default class Toggle extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: false };
    }

    static getDerivedStateFromProps(props, state) {
        return { value: props.value !== undefined ? props.value : !state.value };
    }

    render() {
        const props = this.props;

        return (<button className={CLASS_NAME + (this.state.value === true ? CL_ACTIVE : "")} onClick={(event) => {
            event.currentTarget.value = !this.state.value;
            if (props.onClick) {
                event.value = !this.state.value;
                event.name = this.props.name;
                props.onClick(event);
            }
            this.setState((state) => { return { value: !state.value } })
        }}>
            {props.children}
        </button>);
    }
}