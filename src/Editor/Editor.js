import React from "react";
import TabsController from "../TabControl/TabsController";
import Tab from "../TabControl/Tab";
import Tools from "./Tools/Tools";
import PrefabsList from "./PrefabsList/PrefabsList";
import PropertyList from "./PropertyList/PropertyList";
import "./Editor.css";

import { CENTER_MOUSE_BUTTON, LEFT_MOUSE_BUTTON, createVariable } from "../header";

import Scene from "./SceneSystem/Scene";
import Grid from "./SceneSystem/Components/Grid";
import Chip, { Block, Pin } from "./SceneSystem/Components/Chip";
import Wire from "./SceneSystem/Components/Wire";

class CanvasMover {
    static name = "CANVAS_MOVING";
    getName() { return CanvasMover.name; }

    onMouseDown(propa, state, event) {
        if (event.button === CENTER_MOUSE_BUTTON)
            return { toolName: CanvasMover.name };

        return null;
    }

    onMouseMove(props, state, event) {
        const rect = event.currentTarget.getBoundingClientRect();

        if (state.toolName === CanvasMover.name) {
            const currentMousePosition = { x: event.clientX - rect.x, y: event.clientY - rect.y };
            const stateMousePosition = state.mousePosition;

            return {
                worldPosition: {
                    x: state.worldPosition.x - (stateMousePosition.x - currentMousePosition.x) / state.scale,
                    y: state.worldPosition.y - (stateMousePosition.y - currentMousePosition.y) / state.scale
                },
                mousePosition: currentMousePosition
            };
        } else return null;
    }

    updateElement(props, state) {
        return state;
    }
}

class Selecter {
    static name = "SELECTING";
    getName() { return Selecter.name; }
    constructor(selectedElements) {
        this.toDragging = false;
        this.currentSelectedElements = [];
        this.selectedElements = selectedElements;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.updateElement = this.updateElement.bind(this);
    }

    indexOf(array, element) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].id === element.id)
                return i;
        }

        return -1;
    }

    onMouseDown(props, state, event) {
        if (event.button === LEFT_MOUSE_BUTTON)
            return { toolName: Selecter.name };

        return null;
    }

    onMouseMove(props, state, event) {
        if (state.toolName === Selecter.name) {
            return { toolName: this.toDragging === true ? Dragger.name : Selecter.name };
        }

        return null;
    }

    onMouseUp(props, state, event) {
        this.toDragging = false;
        return null;
    }

    updateElement(props, state) {
        const event = props.event; if (!event) { return null; }
        const mouse = event.mouse; if (!mouse) { return null; }
        const mousePosition = mouse.position; if (!mousePosition) { return null; }

        const isOnPoint = () => {
            const mouseOldPosition = mouse.oldPosition;
            return mousePosition.x === mouseOldPosition.x && mousePosition.y === mouseOldPosition.y;
        }

        let newState = Object.assign({}, state);
        let isSelected = false;
        if (props.isCollision)
            isSelected = props.isCollision(props, state);

        if (props.getPropertys) {
            const propertys = props.getPropertys(props, newState);
            let _index = this.indexOf(this.currentSelectedElements, propertys);

            if (state.isSelected === true || isSelected) {
                if (_index === -1 && this.currentSelectedElements !== null) {
                    this.currentSelectedElements.push(propertys);
                }
            }

            if (isOnPoint()) {
                if (this.toDragging === false) {
                    if (isSelected === true) {
                        props.forceUpdate(() => {
                            if (state.isSelected === false) {
                                this.currentSelectedElements = [];
                            }
                            this.toDragging = true;
                        });
                    }
                } else {
                    if (isSelected === true) {
                        if (_index === -1) {
                            this.currentSelectedElements.push();
                        }
                    }

                    isSelected = (_index !== -1);
                }
            } else {
                if (isSelected === false && _index !== -1) {
                    this.currentSelectedElements.splice(_index, 1);
                    _index = -1;
                }

                isSelected = (_index !== -1);
            }
        }
        newState.is_drag = false;
        newState.isSelected = isSelected;

        return newState;
    }
}

class Dragger {
    static name = "DRAGGING";
    getName() { return Dragger.name; }
    constructor(selectedElements) {
        this.selectedElements = selectedElements;

        //this.onMouseMove = this.onMouseMove.bind(this);
        this.updateElement = this.updateElement.bind(this);
    }

    indexOf(array, element) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].id === element.id)
                return i;
        }

        return -1;
    }

    updateElement(props, state) {
        const event = props.event; if (!event) { return null; }
        const mouse = event.mouse; if (!mouse) { return null; }
        const mousePosition = mouse.position; if (!mousePosition) { return null; }

        let newState = Object.assign({}, state);
        //console.log(this.selectedElements);
        const index = this.indexOf(this.selectedElements.value, props.getPropertys(props, newState));

        if (state.isSelected === true) {
            if (state.is_drag === true) {
                if (state.isFixed === false) {
                    const newPosition = {
                        x: mousePosition.x - state.deltaPosition.x,
                        y: mousePosition.y - state.deltaPosition.y
                    };

                    newState.position = props.onRemove ? props.onRemove(newPosition, props, state) : newPosition;
                }
            } else {
                newState.is_drag = true;
                newState.deltaPosition = {
                    x: mousePosition.x - state.position.x,
                    y: mousePosition.y - state.position.y
                };
            }

            this.selectedElements.value[index] = props.getPropertys(props, newState);
            this.selectedElements.setValue(this.selectedElements.value);
        }

        //                   !!! ВАЖНО !!!
        //Если поперетаскивать объект, а после попробовать изменить фиксацию, то объект изменить значене после повторного нажатия
        //Данная проблема не проявляется при первом взятии, только после повторного
        //Фикс написанный ниже исходя из ранее написанного выполняет свою функцию не идеально

        //if (state.isFixed === false) {  //Если при зафиксированном ноде пользователь попробует произвести перетаскивание, то по завершению при попытке отключения
        //    //фиксации необходимо дважды нажать на кнопку чтобы изменилось значение (исправляет данный нюанс)
        //
        //    //Происходит сохранение изменений в массив выбраных нодов
        //    props.getSelected(props.getPropertys(props, newState), true);
        //}
        return newState;
    }
}

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: [],
            selectedNodes: []
        };
    }

    render() {
        const selectedNodes = createVariable(this, "selectedNodes");
        const tool = createVariable(this, "tool");
        const selectedElement = createVariable(this, "selectedElement");

        const addNode = () => {
            this.state.nodes.push(
                <Chip key={this.state.nodes.length} width={200} height={480} blockWidth={75} onRemove={(newPosition, props, state) => { return { x: newPosition.x - newPosition.x % 20, y: newPosition.y - newPosition.y % 20 }; }}>
                    <Block side="left" pinSize={20}>
                        <Pin name="D0" />
                        <Pin name="D1" />
                        <Pin name="D2" />
                        <Pin name="D3" />
                        <Pin name="D4" />
                        <Pin name="D5" />
                        <Pin name="D6" />
                        <Pin name="D7" />
                    </Block>
                    <Block side="left" pinSize={20}>
                        <Pin name="WAIT" negative />
                        <Pin name="INT" negative />
                        <Pin name="NMI" negative />
                        <Pin name="RESET" negative />
                    </Block>
                    <Block side="left" pinSize={20}>
                        <Pin name="WAIT" negative />
                        <Pin name="INT" negative />
                        <Pin name="NMI" negative />
                        <Pin />
                        <Pin name="RESET" negative />
                    </Block>
                    <Block side="left" pinSize={20}>
                        <Pin name="BUSRQ" negative />
                    </Block>
                    <Block side="right" pinSize={20}>
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
                    <Block side="right" pinSize={20}>
                        <Pin name="M1" />
                        <Pin name="MREQ" />
                        <Pin name="IORQ" />
                        <Pin name="RD" />
                        <Pin name="WR" />
                        <Pin name="RFSH" />
                    </Block>
                </Chip>
            );
            this.forceUpdate();
        }

        const addChip = (id, positionX, positionY) => {
            switch (id) {
                case 1: {
                    this.state.nodes.push(<Chip key={this.state.nodes.length} isSelected={true} width={200} height={40} position={{ x: positionX - 100, y: positionY - 40 }} blockWidth={70}
                        onRemove={(newPosition, props, state) => {
                            return { x: newPosition.x - newPosition.x % 20, y: newPosition.y - newPosition.y % 20 };
                        }}>
                        <Block side="left" pinSize={20}>
                            <Pin name="L1" />
                        </Block>
                        <Block side="right" pinSize={20}>
                            <Pin name="R1" />
                        </Block>
                    </Chip>);
                    break;
                }
                case 2: {
                    this.state.nodes.push(<Chip key={this.state.nodes.length} isSelected={true} width={200} height={60} position={{ x: positionX - 100, y: positionY - 30 }} blockWidth={70}
                        onRemove={(newPosition, props, state) => {
                            return { x: newPosition.x - newPosition.x % 20, y: newPosition.y - newPosition.y % 20 };
                        }}>
                        <Block side="left" pinSize={20}>
                            <Pin name="L2" />
                        </Block>
                        <Block side="right" pinSize={20}>
                            <Pin name="R1" />
                            <Pin name="R2" />
                        </Block>
                    </Chip>);
                    break;
                }
                default:
                    break;
            }

            this.forceUpdate();
        }

        return (
            <div className="editor">
                <div className="controls">
                    <Tools nameActiveToggle={tool} />
                    <div className="controls_buttons">
                        <button onClick={() => { addNode() } }>Pause</button>
                        <button>Play</button>
                        <button>Stop</button>
                    </div>
                </div>
                <div className="work_zone">
                    <PrefabsList selectedElement={selectedElement} />
                    <div className="editor_area">
                        <TabsController>
                            <Tab name="first">
                                <div className="content">
                                    <Scene tools={[new CanvasMover(), new Selecter(selectedNodes), new Dragger(selectedNodes)]} onMouseEnter={(event, position) => {
                                        if (selectedElement) {
                                            if (selectedElement.value !== null) {
                                                addChip(selectedElement.value, position.x, position.y);
                                                selectedElement.setValue(null);
                                                return true;
                                            }
                                        }

                                        return false;
                                    }}>
                                        <Grid width="100%" height="100%" />
                                        {this.state.nodes}
                                        <Chip width={200} height={100} position={{ x: -220, y: 0 }} blockWidth={70}
                                            onRemove={(newPosition, props, state) => {
                                                return { x: newPosition.x - newPosition.x % 20, y: newPosition.y - newPosition.y % 20 };
                                            }}>
                                            <Block side="left" pinSize={20}>
                                                <Pin name="D0" />
                                                <Pin name="D1" />
                                                <Pin name="D2" />
                                                <Pin name="D3" />
                                            </Block>
                                            <Block side="right" pinSize={20}>
                                                <Pin name="A0" negative />
                                                <Pin name="A1" />
                                                <Pin name="A2" negative />
                                                <Pin name="A3" />
                                            </Block>
                                        </Chip>
                                        <Wire onRemove={(newPosition, props, state) => {
                                            return { x: newPosition.x - newPosition.x % 20, y: newPosition.y - newPosition.y % 20 };
                                        }}></Wire>
                                    </Scene>
                                </div>
                            </Tab>
                            <Tab name="second">
                                <div className="content">
                                    qwertyuio
                                </div>
                            </Tab>
                        </TabsController>
                    </div>
                    <PropertyList property={selectedNodes} />
                </div>
            </div>
        );
    }
}

export default Editor;