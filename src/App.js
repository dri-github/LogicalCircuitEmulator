import React from "react";
import Menu from "./Menu/Menu"
import Editor from "./Editor/Editor";
import "./App.css";

function App() {
    return (
        <div className="App">
            <div className="menu">
                <Menu buttons={{
                    line: [{
                        name: "File", popup: [
                            { name: "Save" },
                            { name: "Save as" },
                            {
                                name: "Export", popup: [
                                    { name: "PNG" },
                                    { name: "SVG" },
                                    { name: "PDF" }]
                            }]
                    }, {
                        name: "Edit", popup: [
                            { name: "Copy" },
                            { name: "Undo" },
                            { name: "Delete" }]
                    }, {
                        name: "View", popup: [
                            {
                                name: "Themes", popup: [
                                    { name: "Dark Theme" },
                                    { name: "Windows 95" },
                                    { name: "Windows 95 Black" },
                                    {
                                        name: "Windows", popup: [
                                            { name: "Windows XP" },
                                            { name: "Windows 7" }
                                    ]},
                                    { name: "Purple" }
                                ]
                            },
                            { name: "Propertys" },
                            { name: "Options" }]
                    }]
                }} onSelect={(name) => { console.log(name); } } />
            </div>
            <Editor />
        </div>
        );
}

export default App;