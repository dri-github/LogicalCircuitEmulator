import React from "react";
import "./Menu.css";

//���������� ��������
const CN_LINE_MENU = "line_menu"; //�������� ������ ��� ��������� ����� ��������� ����
const CN_POPUP_MENU = "popup_menu"; //�������� ������ ��� ��������� ����� ����������� ����
const CN_ACTIVE = "_active"; //�������� ��������� � ����� ������ ��� ��������� ������ ���� �� ��������
const CN_DISABLED = "_disabled"; //�������� ��������� � ����� ������ ��� ��������� ����� ���� �� ��������� <-- ��������
export const SEPARATOR_CHARACTER = "/"; //����������� ������ � ���� � ���������� ������ ����

/*
 * Menu - ����� ����������� ����������� �������� �������������� ���� (��������� � �����������). �������� ���������� �� ����������� �����������
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

            //���� �� ������� ���������� � ������ ���� ����������� ������� ����
            if (!this.processedResult) {
                return null;
            }

            //�������� ������� ��� ���� = ��� ������ + CN_ACTIVE
            //�������� ����� ������ ���� �������� � css �����

            //��������� ����
            const open = (event, className) => {
                event.currentTarget.lastElementChild.classList.add(className + CN_ACTIVE);
            }
            //��������� ����
            const close = (event, className) => {
                event.currentTarget.lastElementChild.classList.remove(className + CN_ACTIVE);
            }

            //���������� ��� ������ ������ �� ����������� ��������
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
                                    //���� � �������� ���� ���������� �������� ��������, �� �� ������ ��������� ��������
                                    if (!element.popup && !element.line) {
                                        close(event, elementClassName);
                                        //���� �� ����� ������� onSelect �� ��� ���������, �� ������������� ������ ������� ��� �����, � ������������� �� ������ ��������� onSelect
                                        if (this.isSelect === false) {
                                            //��� ��� ������� ������ � ��������, �� �� ���������� �������
                                            if (onSelect) {
                                                onSelect(element.name);
                                            }
                                        }
                                    } else {
                                        //���� ������� ��������� ��� �� �������� �������� (��������� ������������� �������� ���� ��� ������� �� ������� � ��������� ����������)
                                        if (event.currentTarget.lastElementChild.classList.contains(elementClassName + CN_ACTIVE)) {
                                            //���� ������� �� ������ � ��������
                                            if (this.isSelect === true) {
                                                close(event, elementClassName);
                                                //���� ������� �� �������� �������� ���� (��� ������� ������� ���������� ������� �������� �������� ��������� ��������� ����)
                                                if (this.className !== CN_LINE_MENU) {
                                                    //��� ��� ������� ������ � ��������, �� �� ���������� �������
                                                    if (onSelect) {
                                                        onSelect(element.name);
                                                    }
                                                }
                                            }
                                        } else {
                                            //���� ������� ���� ����������� �� �������� �������� �������� � ��� ���� ����������� �������, �� ���������� �������� ������ ����
                                            open(event, elementClassName);
                                        }
                                    }
                                    
                                    this.isSelect = false;
                                }}
                                onMouseLeave={(event) => { close(event, generateClassName(element)); }}>
                                <div>{element.name}</div>
                                <Menu buttons={element} onSelect={(name) => {  //������� ������������ ������� ������� (���������� ���������������� ������ ������ �� ��������)
                                    this.isSelect = true; //��������, ��� �������� ������� ��� ����������
                                    return onSelect ? onSelect(element.name + SEPARATOR_CHARACTER + name) : null; //��������� ���������������� ������ ���� � ���������� �������� (������: ../Save as/SVG/...)
                                }} />
                            </li>
                        ))
                    }
                </ul>
            );
        } else return null;
    }
}