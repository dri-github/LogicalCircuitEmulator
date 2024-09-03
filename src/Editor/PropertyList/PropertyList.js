import React from "react";
import "./PropertyList.css";

function underscoreGenerator(text) {
    let result = new Array(0);

    for (let i = 0; i < text.length; i++) {
        const letter = text[i];
        if (letter === letter.toUpperCase()) {
            if (i > 0 && text[i - 1] !== "_" && text[i - 1] === text[i - 1].toLowerCase()) {
                result.push("_");
            }
        }
        result.push(letter);
    }

    return result.join("").toLowerCase();
}

class Property extends React.Component {
    constructor(props) {
        super(props);
        this.state = { is_visible: true };
    }

    render() {
        const onClick = (event) => {
            this.setState((state) => { return { is_visible: !state.is_visible } });
        }

        return (
            <div className={"property " + underscoreGenerator(this.props.name)}>
                <div className="title">
                    <button onClick={onClick}>{this.state.is_visible === true ? "*" : "^"}</button>
                    <div className="name">
                        {this.props.name}
                    </div>
                </div>
                <div className={"content" + (this.state.is_visible === true ? "" : " disablet")}> {this.props.children} </div>
            </div>
        );
    }
}

class PropertyList extends React.Component {
    render() {
        const property = this.props.property.value;
        
        const propertiesCreator = (property) => {
            let component_list = [];

            if (!property) {
                return null;
            }

            if (property.length > 0) {
                for (let propertyName in property[0]) {
                    let component = null;
                    let componentProperty = structuredClone(property[0])[propertyName];

                    const checkProperty = (current, target) => {
                        for (let contentName in current) {
                            if (!current[contentName])
                                continue;
                            if (!target[contentName]) {
                                target[contentName] = current[contentName];
                            }

                            if (Object.keys(current[contentName]).length > 0) {
                                checkProperty(current[contentName], target[contentName]);
                            } else {
                                if (current[contentName] !== target[contentName]) {
                                    target[contentName] = undefined;
                                }
                            }
                        }
                    }

                    for (let element of property) {
                        let current = element[propertyName];
                        checkProperty(current, componentProperty);
                    }

                    const changeProperty = (newProperty) => {
                        for (let i = 0; i < property.length; i++) {
                            newProperty(property[i][propertyName]);
                        }

                        this.props.property.setValue(property);
                    }

                    switch (propertyName) {
                        case underscoreGenerator("Transform"):
                            component = (
                                <Property key={component_list.length} name="Transform">
                                    <div className="position">
                                        <label>x: <input type="number" value={componentProperty.position.x} onInput={(event) => {
                                            changeProperty((current) => { current.position.x = Number(event.currentTarget.value); });
                                        }} /></label>
                                        <label>y: <input type="number" value={componentProperty.position.y} onInput={(event) => {
                                            changeProperty((current) => { current.position.y = Number(event.currentTarget.value); });
                                        }} /></label>
                                    </div>
                                    <label>Fixed <input type="checkbox" checked={componentProperty.isFixed} onChange={(event) => {
                                        changeProperty((current) => { current.isFixed = event.currentTarget.checked; });
                                    }} /></label>
                                </Property>
                            );
                            break;
                        case underscoreGenerator("Code"):
                            component = (
                                <Property name="Code">
                                    <label>Visible for any user <input type="checkbox" /></label>
                                    <label>Code<textarea></textarea></label>
                                </Property>
                            );
                            break;
                        default:
                            break;
                    }

                    component_list.push(component);
                }
            }

            return component_list;
        }

        return (
            <div className="property_list">
                <div className="content">
                    {propertiesCreator(property)}
                </div>
            </div>
        );
    }
}

export default PropertyList;