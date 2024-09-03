import React from "react";
import "./Menu.css";

//Постоянные значения
const CN_LINE_MENU = "line_menu"; //Название класса для изменения стиля линейного меню
const CN_POPUP_MENU = "popup_menu"; //Название класса для изменения стиля выпадающего меню
const CN_ACTIVE = "_active"; //Название приставки в имени класса для изменения стилей меню на активные
const CN_DISABLED = "_disabled"; //Название приставки в имени класса для изменения стиля меню на отключено <-- доделать
export const SEPARATOR_CHARACTER = "/"; //Разделяющий символ в пути к выбранному пункту меню

/*
 * Menu - класс реализующий возможность создания универсального меню (линейного и выпадающего). Создание происходит из спициальной конструкции
 */
export default class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.className = props.buttons.line ? CN_LINE_MENU : CN_POPUP_MENU;
        this.processedResult = props.buttons.line ? props.buttons.line : props.buttons.popup;
        this.isSelect = false;
    }

    render() {
        const props = this.props;

        if (props.buttons) {
            const onSelect = props.onSelect;

            //Если не удалось определить к какому типу принадлежит элемент меню
            if (!this.processedResult) {
                return null;
            }

            //Активным классом для меню = имя класса + CN_ACTIVE
            //Активный класс должен быть прописан в css файле

            //Открывает меню
            const open = (event, className) => {
                event.currentTarget.lastElementChild.classList.add(className + CN_ACTIVE);
            }
            //Закрывает меню
            const close = (event, className) => {
                event.currentTarget.lastElementChild.classList.remove(className + CN_ACTIVE);
            }

            //Возвращает имя класса исходя из содержимого элемента
            const generateClassName = (element) => {
                return element ? (element.popup ? CN_POPUP_MENU : (element.line ? CN_LINE_MENU : null)) : null;
            }

            return (
                <ul className={this.className}>
                    {
                        this.processedResult.map((element, index) => (
                            <li key={index}
                                onMouseDown={(event) => {
                                    const elementClassName = generateClassName(element);
                                    //Если у элемента меню отсутсвуют дочерние элементы, то он должен закрывать иерархию
                                    if (!element.popup && !element.line) {
                                        close(event, elementClassName);
                                        //Если до этого момента onSelect не был отправлен, то следовательно данный элемент был нажат, а следовательно он должен отправить onSelect
                                        if (this.isSelect === false) {
                                            //Так как элемент первый в иерархии, то он отправляет событие
                                            if (onSelect) {
                                                onSelect(element.name);
                                            }
                                        }
                                    } else {
                                        //Если нажатие произошло уже по нажатому элементу (позволяет заблокировать закрытие меню при нажатии на элемент с дочерними элементами)
                                        if (event.currentTarget.lastElementChild.classList.contains(elementClassName + CN_ACTIVE)) {
                                            //Если элемент не первый в иерархии
                                            if (this.isSelect === true) {
                                                close(event, elementClassName);
                                                //Если элемент не является линейным меню (без данного условия невозможно открыть дочерний элементы дочернего линейного меню)
                                                if (this.className !== CN_LINE_MENU) {
                                                    //Так как элемент первый в иерархии, то он отправляет событие
                                                    if (onSelect) {
                                                        onSelect(element.name);
                                                    }
                                                }
                                            }
                                        } else {
                                            //Если нажатие было произведено по элементу имеещему дочерние и оно было произведено впервые, то производим открытие пункра меню
                                            open(event, elementClassName);
                                        }
                                    }
                                    
                                    this.isSelect = false;
                                }}
                                onMouseLeave={(event) => { close(event, generateClassName(element)); }}>
                                <div>{element.name}</div>
                                <Menu buttons={element} onSelect={(name) => {  //Событие возвращающее нажатый элемент (происходит последовательная сборка исходя из иерархии)
                                    this.isSelect = true; //Помечаем, что корневой элемент уже существует
                                    return onSelect ? onSelect(element.name + SEPARATOR_CHARACTER + name) : null; //Формируем последовательную запись пути к выбранному элементу (пример: ../Save as/SVG/...)
                                }} />
                            </li>
                        ))
                    }
                </ul>
            );
        } else return null;
    }
}