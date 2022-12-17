/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
CampusExplorer.buildQuery = () => {
    let dataset = document.getElementsByClassName("nav-item tab active")[0].getAttribute("data-type");
    let query = {};
    query["WHERE"] = getCondition(dataset);
    let optionClause = {};
    optionClause["COLUMNS"] = getColumns(dataset);
    if (Object.keys(getOrder(dataset)).length !== 0) {
        optionClause["ORDER"] = getOrder(dataset);
    }
    query["OPTIONS"] = optionClause;
    if (getGroup(dataset).length > 0) {
        let transClause = {};
        transClause["GROUP"] = getGroup(dataset);
        transClause["APPLY"] = getApply(dataset);
        query["TRANSFORMATIONS"] = transClause;
    }
    return query;
};

// returns the WHERE clause
function getCondition(dataset) {
    let clause = {};
    let typeAll;
    let typeAny;
    let typeNone;
    let conditions;
    if (dataset === "courses") {
        typeAll = document.getElementById("courses-conditiontype-all").checked;
        typeAny = document.getElementById("courses-conditiontype-any").checked;
        typeNone = document.getElementById("courses-conditiontype-none").checked;
        conditions = document.getElementById("tab-courses").getElementsByClassName("control-group condition");
    } else if (dataset === "rooms") {
        typeAll = document.getElementById("rooms-conditiontype-all").checked;
        typeAny = document.getElementById("rooms-conditiontype-any").checked;
        typeNone = document.getElementById("rooms-conditiontype-none").checked;
        conditions = document.getElementById("tab-rooms").getElementsByClassName("control-group condition");
    }

    if (conditions.length !== 0) {
        if (conditions.length === 1){
            if (typeNone) { clause["NOT"] = processCondition(conditions[0], dataset);}
            else { clause = processCondition(conditions[0], dataset); }
        } else {
            let conditionArray = [];
            for (let condition of conditions) {
                let processed = processCondition(condition, dataset);
                conditionArray.push(processed);
            }
            if (typeAll) {
                clause["AND"] = conditionArray;
            } else if (typeAny) {
                clause["OR"] = conditionArray;
            } else if (typeNone) {
                let orClause = {};
                orClause["OR"] = conditionArray;
                clause["NOT"] = orClause;
            }
        }
    }
    return clause;
}

function processCondition(condition, dataset) {
    let returnVal = {};
    let notBoxChecked = condition.getElementsByClassName("control not")[0].getElementsByTagName("input")[0].checked;
    let fieldOptions = condition.getElementsByClassName("control fields")[0].getElementsByTagName("option");
    let field = processSelected(fieldOptions);
    let operatorOptions = condition.getElementsByClassName("control operators")[0].getElementsByTagName("option");
    let operator = processSelected(operatorOptions);
    let term = condition.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value;
    // non-empty, non-space, is not Nah, and operator is not IS
    if (/\S/.test(term) && !isNaN(term) && operator!=="IS") {
        term = Number(term);
    }
    if(/\S/.test(term) && !isNaN(term) && operator ==="IS"){
        term = String(term);
    }

    let operatorPair = {};
    let keyPair = {};
    let key = dataset.concat("_",field);
    keyPair[key] = term;
    operatorPair[operator] = keyPair;

    if (notBoxChecked) {
        returnVal["NOT"] = operatorPair;
    } else {
        returnVal = operatorPair;
    }

    return returnVal;
}

function processSelected(options) {
    for (let option of options) {
        if(option.selected) {
            return option.value;
        }
    }
    return "";
}

function getColumns(dataset) {
    let columnsReturn = [];
    let columnOptions;
    if (dataset === "courses") {
        columnOptions = document.getElementById("tab-courses").getElementsByClassName("form-group columns")[0];
    } else if (dataset === "rooms") {
        columnOptions = document.getElementById("tab-rooms").getElementsByClassName("form-group columns")[0];
    }
    let columnFields = columnOptions.getElementsByClassName("control field");
    let transFields = columnOptions.getElementsByClassName("control transformation");
    for (let columnField of columnFields) {
        if (columnField.getElementsByTagName("input")[0].checked) {
            let column = dataset.concat("_", columnField.getElementsByTagName("input")[0].value);
            columnsReturn.push(column);
        }
    }
    if (transFields.length > 0) {
        for (let transField of transFields) {
            if (transField.getElementsByTagName("input")[0].checked) {
                columnsReturn.push(transField.getElementsByTagName("input")[0].value);
            }
        }
    }
    return columnsReturn;
}

// TODO: direction of order
function getOrder(dataset) {
    // let returnVal = {};
    // let orderGroup;
    // if (dataset === "courses") {
    //     orderGroup = document.getElementById("tab-courses").getElementsByClassName("form-group order")[0];
    // } else if (dataset === "rooms") {
    //     orderGroup = document.getElementById("tab-rooms").getElementsByClassName("form-group order")[0];
    // }
    // let dir = "DOWN";
    // let desc = orderGroup.getElementsByClassName("control descending")[0].getElementsByTagName("input")[0].checked;
    // if (desc === true) { dir = "UP";}
    //
    // let orderFields = orderGroup.getElementsByClassName("control order fields")[0].getElementsByTagName("option");
    // let order = processSelected(orderFields);
    // if (order === "") {
    //     return returnVal;
    // }
    // if(order.length === 1 && desen !== true){
    //     OPTIONSobj.ORDER = orderSelected[0];
    // }
    // else if (orderSelected.length !== 0 || desen === true) {
    //     if (!desen) {
    //         ORDERobj.dir = "UP";
    //     } else {
    //         ORDERobj.dir = "DOWN"
    //     }
    //     ORDERobj.keys = orderSelected;
    //     OPTIONSobj.ORDER = ORDERobj;
    // }
    // const coursesFieldList = ["audit","avg","dept","fail","id","instructor","pass","title","uuid","year"];
    // const roomsFieldList = ["address","fullname","furniture","href","lat","lon","name","number","seats","shortname","type"];
    // if (coursesFieldList.includes(order) || roomsFieldList.includes(order)) {
    //     order = dataset.concat("_",order);
    // }
    // returnVal["dir"] = dir;
    // returnVal["keys"] = order; // can only select one order field? no!!!! 'ORDER: ' ('{ dir:'  DIRECTION ', keys: [ ' ANYKEY (',' ANYKEY)* ']}') | ANYKEY
    //
    // return returnVal;

    let returnVal = {};
    let orderGroup;
    if (dataset === "courses") {
        orderGroup = document.getElementById("tab-courses").getElementsByClassName("form-group order")[0];
    } else if (dataset === "rooms") {
        orderGroup = document.getElementById("tab-rooms").getElementsByClassName("form-group order")[0];
    }
    const select = orderGroup.getElementsByClassName("control-group")[0].getElementsByTagName("select")[0];
    let selected = select.selectedOptions;
    const coursesFieldList = ["audit","avg","dept","fail","id","instructor","pass","title","uuid","year"];
    const roomsFieldList = ["address","fullname","furniture","href","lat","lon","name","number","seats","shortname","type"];
    selected = Array.from(selected).map((sele) => {
        if (coursesFieldList.includes(sele.value) || roomsFieldList.includes(sele.value)) {
            return dataset + "_" + sele.value;
        } else {
            return sele.value
        }
    });
    if(selected.length === 0){
        return {};
    }
    let dir = "UP";
    let desc = orderGroup.getElementsByClassName("control descending")[0].getElementsByTagName("input")[0].checked;
    if (desc === true) { dir = "DOWN";}
    returnVal["dir"] = dir;
    returnVal["keys"] = selected;
    return returnVal;



}

function getGroup(dataset) {
    let groupArray = [];
    let data;
    if (dataset === "courses") {
        data = document.getElementById("tab-courses");
    } else if (dataset === "rooms") {
        data = document.getElementById("tab-rooms");
    }
    let groupFields = data.getElementsByClassName("form-group groups")[0].getElementsByClassName("control field");
    for (let groupField of groupFields) {
        if (groupField.getElementsByTagName("input")[0].checked) {
            let group = dataset.concat("_", groupField.getElementsByTagName("input")[0].value);
            groupArray.push(group);
        }
    }
    return groupArray;
}

// TODO: will skip for loop if empty array? No!!!!
function getApply(dataset) {
    let applyArray = [];
    let trans;
    if (dataset === "courses") {
        trans = document.getElementById("tab-courses").getElementsByClassName("control-group transformation");
    } else if (dataset === "rooms") {
        trans = document.getElementById("tab-rooms").getElementsByClassName("control-group transformation");
    }
    for (let tran of trans) {
        let processed = processTransformation(tran, dataset);
        applyArray.push(processed);
    }
    return applyArray;
}

function processTransformation(tran, dataset) {
    let returnVal = {};
    let term = tran.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value; // do i need to check this? yes!
    term = String(term);
    let operatorOptions = tran.getElementsByClassName("control operators")[0].getElementsByTagName("option");
    let operator = processSelected(operatorOptions);
    let fieldOptions = tran.getElementsByClassName("control fields")[0].getElementsByTagName("option");
    let field = processSelected(fieldOptions);

    let keyPair = {};
    keyPair[operator] = dataset.concat("_",field);
    returnVal[term] = keyPair;

    return returnVal;
}
