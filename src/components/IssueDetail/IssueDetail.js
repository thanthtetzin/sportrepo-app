import React from "react";
import {
  useParams
} from "react-router-dom";

function IssueDetail(props){
  let { name, reponame, number } = useParams();
  return <h1>Hello, {name},  {reponame}, {number}</h1>;
}

export default IssueDetail;