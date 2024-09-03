import React from "react";

export default class GroupToggles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name_active_toggle: ""
        };
    }

    static getDerivedStateFromProps(props, state) {
        let name_active_toggle = state.name_active_toggle;
        if (React.Children.count(props.children) > 0) {
            const first_child = React.Children.toArray(props.children)[0];
            if (name_active_toggle === "" && first_child.type.name === "Toggle") {
                name_active_toggle = first_child.props.name;
            }
        } else {
            name_active_toggle = "";
        }

        if (props.nameActiveToggle) {
            switch (typeof (props.nameActiveToggle)) {
                case "string":
                    name_active_toggle = props.nameActiveToggle;
                    break;
                case "object":
                    if (props.nameActiveToggle.value) {
                        name_active_toggle = props.nameActiveToggle.value;
                    }
                    break;
                default:
                    break;
            }
        }

        return { name_active_toggle: name_active_toggle };
    }

    render() {
        const props = this.props;

        return (<div className="group_toggles">
            {React.Children.map(props.children, (child, index) => {
                return React.cloneElement(child, {
                    value: this.state.name_active_toggle === child.props.name,
                    onClick: (event) => {
                        if (this.state.name_active_toggle !== event.name) {
                            this.setState((state) => { return { name_active_toggle: event.name } });
                            switch (typeof (props.nameActiveToggle)) {
                                case "function":
                                    props.nameActiveToggle(event.name);
                                    break;
                                case "object":
                                    if (props.nameActiveToggle.setValue) {
                                        props.nameActiveToggle.setValue(event.name);
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                });
            })}
        </div>);
    }
}