import React from "react";
import "./TabsController.css";

//Постоянные значения
const CN_SELECTED_TAB = "selected_tab"; //Название класса для изменения стиля выбранной вкладки
const CN_SELECTED_TAB_CONTENT = "selected_tab_content"; //Название класса для изменение стиля содержимого выбранной вкладки

/*
 *   TabsController - позволяет создать набор переключаемых вкладок, используется в комбинации с Tab, тэги необходимо располагать внутри TabsController
 *   все сторонние тэги будут игнорироваться
 */
class TabsController extends React.Component {
    constructor(props) {
        super(props);
        //last_tab - хранит индекс последней активной вкладки
        //Если при создании TabControl не был указан индекс активной вкладки startTab то он будет считаться 0
        this.state = { last_tab: props.startTab !== undefined ? Number(props.startTab) : 0 };
        this.tab_control_ref = React.createRef();
    }

    //После первого создания и отрисовки необходимо сделать предварительную настройку (перевести содержимое первначально выбранной вкладки 
    //в видимый вид и изменить вид вкладки на выделенную)
    componentDidMount() {
        const state = this.state;
        const tab_control = this.tab_control_ref.current;
        //Делаем содержимое вкладки видимым и изменяем вид вкладки на выделенный
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
                                //Прячем последнюю активную вкладку
                                //К индексу последнего элемента добавляется +1 так как первым тэгом всегда будет список вкладок
                                tab_control.children[this.state.last_tab + 1].classList.remove(CN_SELECTED_TAB_CONTENT);
                                event.currentTarget.parentElement.children[this.state.last_tab].classList.remove(CN_SELECTED_TAB);
                                //Делаем видимой новую выбранную вкладку
                                tab_control.children[index + 1].classList.add(CN_SELECTED_TAB_CONTENT);
                                event.currentTarget.classList.add(CN_SELECTED_TAB);
                                //Делаем новую вкладку последней активной
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