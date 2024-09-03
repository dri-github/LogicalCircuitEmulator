import React from "react";
import "./TabsController.css";

//���������� ��������
const CN_SELECTED_TAB = "selected_tab"; //�������� ������ ��� ��������� ����� ��������� �������
const CN_SELECTED_TAB_CONTENT = "selected_tab_content"; //�������� ������ ��� ��������� ����� ����������� ��������� �������

/*
 *   TabsController - ��������� ������� ����� ������������� �������, ������������ � ���������� � Tab, ���� ���������� ����������� ������ TabsController
 *   ��� ��������� ���� ����� ��������������
 */
class TabsController extends React.Component {
    constructor(props) {
        super(props);
        //last_tab - ������ ������ ��������� �������� �������
        //���� ��� �������� TabControl �� ��� ������ ������ �������� ������� startTab �� �� ����� ��������� 0
        this.state = { last_tab: props.startTab !== undefined ? Number(props.startTab) : 0 };
        this.tab_control_ref = React.createRef();
    }

    //����� ������� �������� � ��������� ���������� ������� ��������������� ��������� (��������� ���������� ������������ ��������� ������� 
    //� ������� ��� � �������� ��� ������� �� ����������)
    componentDidMount() {
        const state = this.state;
        const tab_control = this.tab_control_ref.current;
        //������ ���������� ������� ������� � �������� ��� ������� �� ����������
        tab_control.children[state.last_tab + 1].classList.add(CN_SELECTED_TAB_CONTENT);
        tab_control.firstChild.children[state.last_tab].classList.add(CN_SELECTED_TAB);
    }

    render() {
        return (
            <div className="tabs_contoller" ref={this.tab_control_ref}>
                <div className="tab_list">
                    {
                        React.Children.map(this.props.children, (element, index) => (
                            <div className="tab" key={index} onMouseDown={(event) => {
                                const tab_control = this.tab_control_ref.current;
                                //������ ��������� �������� �������
                                //� ������� ���������� �������� ����������� +1 ��� ��� ������ ����� ������ ����� ������ �������
                                tab_control.children[this.state.last_tab + 1].classList.remove(CN_SELECTED_TAB_CONTENT);
                                event.currentTarget.parentElement.children[this.state.last_tab].classList.remove(CN_SELECTED_TAB);
                                //������ ������� ����� ��������� �������
                                tab_control.children[index + 1].classList.add(CN_SELECTED_TAB_CONTENT);
                                event.currentTarget.classList.add(CN_SELECTED_TAB);
                                //������ ����� ������� ��������� ��������
                                this.setState((state) => { state.last_tab = index });
                            }}>
                                {element.props.name !== undefined ? element.props.name : null}
                            </div>
                        ))
                    }
                </div>
                {this.props.children}
            </div>
        );
    }
}

export default TabsController;