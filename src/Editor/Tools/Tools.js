import React from "react";
import GroupToggles from "../../GroupToggles/GroupToggles";
import Toggle from "../../GroupToggles/Toggle/Toggle";
import { TL_MOVING_THE_CANVAS, TL_NODE_DRAGGING, TL_SELECTING_NODES, TL_LINE } from "../NodeManager/NodeManager";
import "./Tools.css";

export default class Tools extends React.Component {
    render() {
        return (
            <div className="tools">
                <GroupToggles nameActiveToggle={this.props.nameActiveToggle}>
                    <Toggle name={TL_MOVING_THE_CANVAS}>MC</Toggle>
                    <Toggle name={TL_NODE_DRAGGING}>ND</Toggle>
                    <Toggle name={TL_SELECTING_NODES}>SN</Toggle>
                    <Toggle name={TL_LINE}>LN</Toggle>
                </GroupToggles>
            </div>
        );
    }
}