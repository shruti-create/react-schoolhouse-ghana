import React from "react";
import { Link } from "react-router-dom";
import { getQueries } from "../../utils/misc"

const ClassesForm = (props) => (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <div style={{ margin: "auto" }}>
            Current Query: {props.location.search ? getQueries(props.location.search).id : "None"}
            <br />
            <br />
            Classes Editor
            <br />
            <br />
            <Link to={`${props.match.url}?id=123`}>Update Class ID #123 </Link>

        </div>
    </div>   
);

export default ClassesForm;