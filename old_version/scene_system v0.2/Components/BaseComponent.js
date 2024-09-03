import React from "react";

export default class BaseComponent extends React.Component {
    static defaultProps = {
        position: { x: 0, y: 0 },
        width: 0,
        height: 0,
        ctx: null,
        event: null,

        isCollision: (props, state) => {
            const event = props.event; if (!event) { return null; }
            const mouse = event.mouse; if (!mouse) { return null; }
            const mousePosition = mouse.position; if (!mousePosition) { return null; }
            const mouseOldPosition = mouse.oldPosition; if (!mouseOldPosition) { return null; }
            const worldPosition = event.worldPosition; if (!worldPosition) { return null; }

            const nodePosition = { x: state.position.x + worldPosition.x, y: state.position.y + worldPosition.y };
            const nodeSize = { width: props.width ? props.width : 0, height: props.height ? props.height : 0 };

            //Проверка столкновения Node с точькой
            const isCollisionWithPoint = (pointPosition) => {
                if (!pointPosition || !pointPosition.x || !pointPosition.y) {
                    return false;
                }

                return (pointPosition.x >= nodePosition.x && pointPosition.x <= nodePosition.x + nodeSize.width) &&
                    (pointPosition.y >= nodePosition.y && pointPosition.y <= nodePosition.y + nodeSize.height);
            }
            //Проверка столкновения Node с прямоугольником
            const isCollisionWithRect = (rect) => {
                if (!rect || !rect.left || !rect.top || !rect.right || !rect.bottom) {
                    return false;
                }

                if (rect.left > rect.right) rect.left = [rect.right, rect.right = rect.left][0];
                if (rect.top > rect.bottom) rect.top = [rect.bottom, rect.bottom = rect.top][0];

                return (rect.right >= nodePosition.x) && (rect.left <= nodePosition.x + nodeSize.width) &&
                    (rect.bottom >= nodePosition.y) && (rect.top <= nodePosition.y + nodeSize.height);
            }

            return (mousePosition.x === mouseOldPosition.x && mousePosition.y === mouseOldPosition.y) ?
                isCollisionWithPoint(mousePosition) :
                isCollisionWithRect({ left: mouseOldPosition.x, top: mouseOldPosition.y, right: mousePosition.x, bottom: mousePosition.y });
        },
        getPropertys: (props, state) => {
            return {
                id: props.index,
                transform: {
                    position: state.position,
                    isFixed: state.isFixed
                }
            }
        },
        setPropertys: (propertys, state) => {
            state.position = propertys.transform.position;
            state.isFixed = propertys.transform.isFixed;
        }
    }
    constructor(props) {
        super(props);

        this.state = {
            is_drag: false,
            position: props.position ? props.position : { x: 0, y: 0 },
            isFixed: false,
            deltaPosition: { x: 0, y: 0 },
            isSelected: props.isSelected ? props.isSelected : false
        };
    }

    static getDerivedStateFromProps(props, state) {
        const event = props.event; if (!event) { return null; }
        const mouse = event.mouse; if (!mouse) { return null; }
        const mousePosition = mouse.position; if (!mousePosition) { return null; }

        const mouseState = mouse.state;

        let newState = Object.assign({}, state);

        if (props.selectable || props.draggable) {
            switch (mouseState) {
                case "enter": {
                    let isSelected = false;
                    if (props.isCollision)
                        isSelected = props.isCollision(props, state);
                    console.log("isSelected: " + isSelected + " --- " + state.position.x + " " + props.event.mouse.position.x + " --- " + state.position.y + " " + props.event.mouse.position.y);
                    if (props.setSelected && props.getPropertys)
                        props.setSelected(props.getPropertys(props, newState), isSelected);
                    newState.is_drag = false;
                    //newState.isSelected = isSelected;
                    break;
                }
                case "selecting_nodes":         // <-- !!! НАДО ИСПРАВИТЬ !!!
                    let isSelected = false;
                    if (props.isCollision)
                        isSelected = props.isCollision(props, state);
                    if (props.setSelected && props.getPropertys)
                        props.setSelected(props.getPropertys(props, newState), isSelected);
                    newState.is_drag = false;
                    newState.isSelected = isSelected;
                    break;
                case "node_dragging":           // <-- !!! НАДО ИСПРАВИТЬ !!!
                    if (props.draggable) {
                        if ((newState.isSelected = props.getSelected(props.getPropertys(props, newState)))) {
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
                        }

                        //                   !!! ВАЖНО !!!
                        //Если поперетаскивать объект, а после попробовать изменить фиксацию, то объект изменить значене после повторного нажатия
                        //Данная проблема не проявляется при первом взятии, только после повторного
                        //Фикс написанный ниже исходя из ранее написанного выполняет свою функцию не идеально

                        if (state.isFixed === false) {  //Если при зафиксированном ноде пользователь попробует произвести перетаскивание, то по завершению при попытке отключения
                                                        //фиксации необходимо дважды нажать на кнопку чтобы изменилось значение (исправляет данный нюанс)

                            //Происходит сохранение изменений в массив выбраных нодов
                            props.getSelected(props.getPropertys(props, newState), true);
                        }
                    }
                    break;
                default:
                    if (event.propertys) {
                        props.setPropertys(event.propertys, newState);
                    }
                    break;
            }
        }

        return newState;
    }
}