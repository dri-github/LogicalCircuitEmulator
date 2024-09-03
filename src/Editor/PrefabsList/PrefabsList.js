import React from "react";
import TabsController from "../../TabControl/TabsController";
import Tab from "../../TabControl/Tab";
import ListView from "../../ListView/ListView";
import GroupToggles from "../../GroupToggles/GroupToggles";
import Toggle from "../../GroupToggles/Toggle/Toggle";
import "./PrefabsList.css";
import image from "./no_image.png";
import { createVariable } from "../../header";

class PrefabsList extends React.Component {
    render() {
        const nameActiveToggle = createVariable(this, "activeToggle");

        const search = function (name) {
            return [
                { name: "testName", image: image, description: "description", data: 1 },
                { name: "qwerty", image: image, description: "description", data: 2 },
                { name: "node", image: image, description: "description", data: null },
                { name: "result", image: image, description: "description", data: null },
                { name: "current", image: image, description: "description", data: null }
            ];
        }

        return (
            <div className="prefabs_list">
                <TabsController startTab="1">
                    <Tab name="favorites">
                        <div className="search_text">
                            <input type="text" placeholder="Search.." />
                        </div>
                        <div className="search_result_view">
                            <GroupToggles nameActiveToggle={nameActiveToggle}>
                                <Toggle name="1">1</Toggle>
                                <Toggle name="2">2</Toggle>
                                <Toggle name="4">4</Toggle>
                            </GroupToggles>
                        </div>
                        <div className="search_result">
                            <ListView cutOff={nameActiveToggle.value} draggedElement={this.props.selectedElement} onRender={(elements, index, onDragging) => {
                                return elements.map((params, localIndex) => {
                                    return <td key={localIndex}>
                                        <div className="prefab"
                                            onMouseLeave={(event) => { onDragging(params.data) }}
                                            onMouseDown={(event) => { event.currentTarget.style.cursor = "grabbing"; }}>
                                            <div className="name">{params.name}</div>
                                            <div className="data">
                                                <img src={params.image} width="50%" />
                                                <div className="description">{params.description}</div>
                                            </div>
                                        </div>
                                    </td>;
                                });
                            }}>
                                {search("1234").map((node, index) => {
                                    return <ListView.Element key={index}>{node}</ListView.Element>;
                                })}
                            </ListView>
                        </div>
                    </Tab>
                    <Tab name="Internet">
                        
                    </Tab>
                    <Tab name="my library">
                        <div className="search_text">
                            <input type="text" placeholder="Search.." />
                        </div>
                        <ListView cutOff="1" onRender={(elements, index) => {
                            return elements.map((params, localIndex) => {
                                return [
                                    <td key={localIndex * 2}>
                                        <div>{index}</div>
                                        <div className="name">{params[0]}</div>
                                    </td>,
                                    <td key={localIndex * 2 + 1}>
                                        <div className="description">{params[2]}</div>
                                    </td>
                                ];
                            });
                        }}>
                            {search("1234").map((node, index) => {
                                return <ListView.Element key={index}>{[node.name, node.image, node.description]}</ListView.Element>;
                            })}
                        </ListView>
                    </Tab>
                </TabsController>
            </div>
        );
    }
}

export default PrefabsList;