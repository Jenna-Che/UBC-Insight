import Log from "../Util";
import QueryHelper from "./QueryHelper";
import MakeQueryResult from "./MakeQueryResult";
let courseFiled: string[] = ["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];
let roomField: string[] = ["lat", "lon", "seats", "fullname", "shortname", "number", "name"
    , "address", "type", "furniture", "href"];

export default class BasicCheck {
    public static basicTransGroupCheck(trans: any): boolean {
        for (let y in trans) {
            if (y !== "GROUP" && y !== "APPLY") {
                return false;
            }
        }
        if (typeof trans !== "object") {
            return false;
        }
        if (trans["APPLY"] === null || !Array.isArray(trans["APPLY"])) {
            return false;
        }
        if (trans["APPLY"].includes(null)) {
            return false;
        }
        let tKeys: any[] = Object.keys(trans);
        if ((tKeys.length > 2) || (tKeys.length === 0)) {
            return false;
        }
        if (!("GROUP" in trans) || !(Array.isArray(trans["GROUP"])) || trans["GROUP"] === null) {
            return false;
        }
        let group: any[] = trans["GROUP"];
        if (group.length === 0) {
            return false;
        }
        if (group[0] === null || typeof group[0] !== "string") {
            return false;
        }
        let keyID = group[0].split("_")[0];
        for (let key of group) {
            if (key === null || typeof key !== "string") {
                return false;
            }
            let thisID = key.split("_")[0];
            if (thisID !== keyID) {
                return false;
            }

        }
        let applyrule: any = trans["APPLY"];
        if (!BasicCheck.appCheck(applyrule, keyID)) {
            return false;
        }
        return true;
    }

     public static appCheck (applyrule: any, keyID: string): boolean {
         for (let rule of applyrule) {
             let applyKey: string = Object.keys(rule)[0];
             let applyr: any = rule[applyKey];
             if (applyr === null || typeof applyr !== "object") {
                 return false;
             }
             if (Object.keys(applyr).length === 0) {
                 return false;
             }
             let applyToken: string = Object.keys(applyr)[0];
             let applyObj: any = applyr[applyToken];
             if (applyObj === null || typeof applyObj !== "string") {
                 return false;
             }
             let appID = applyObj.split("_")[0];
             if (keyID !== appID) {
                 return false;
             }
         }
         return true;
     }

    public static checktoken(token: any, aToken: any): boolean {
        let mFiled: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        let sField: string[] = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name"
            , "address", "type", "furniture", "href"];
        if (typeof aToken !== "object") {
            return false;
        }
        let apToken: any[] = Object.keys(aToken);
        if (apToken.length !== 1) {
            return false;
        }
        if (token !== "MAX" && token !== "MIN" && token !== "AVG" && token !== "COUNT"
            && token !== "SUM") {
            return false;
        }
        let applyObj: any = aToken[token];
        if (typeof applyObj !== "string" || !(applyObj.includes("_"))) {
            return false;
        }
        let applyObjID = applyObj.split("_")[0];
        let applyObjF = applyObj.split("_")[1];
        if (token === "MIN" || token === "MAX" || token === "AVG" || token === "SUM") {
            if (!(mFiled.includes(applyObjF))) {
                return false;
            }
        }
        if ((!(mFiled.includes(applyObjF))) && (!(sField.includes(applyObjF)))) {
            return false;
        }
        if ((applyObjID === "rooms" && !(roomField.includes(applyObjF))) ||
            (applyObjID === "courses" && !(courseFiled.includes(applyObjF)))) {
            return false;
        }
        return true;
    }

    public static basicCheckAppleRule(applyRule: any, applyKeys: any[]): boolean {
        if (typeof applyRule !== "object") {
            return false;
        }
        let appKeys: any[] = Object.keys(applyRule);
        if (!(appKeys.length === 1)) {
            return false;
        }
        let aKey: any = appKeys[0];
        if (aKey.includes("_")) {
            return false;
        }
        if (applyKeys.includes(aKey)) {
            return false;
        }
        return true;
    }

    public static bascicColCheck (col: string[], trans: any, qID: string):
        boolean {
        let mFiled: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        let sField: string[] = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name"
            , "address", "type", "furniture", "href"];
        let groupKeys: any[] = [];
        for (let k of col) {
            if (typeof k !== "string") {
                return false;
            }
            if (trans === null) {
                let thisqID: string = k.split("_", 1)[0];
                let theKey = k.split("_")[1];
                if (!(thisqID === qID) ||
                    (!(mFiled.includes(theKey)) && !(sField.includes(theKey)))) {
                    return false;
                }
                if ((thisqID === "rooms" && !(roomField.includes(theKey))) ||
                    (thisqID === "courses" && !(courseFiled.includes(theKey)))) {
                    return false;
                }
            } else {
                let applyKeys: any[] = MakeQueryResult.getApplKeys(trans["APPLY"]);
                let group: any[] = trans["GROUP"];
                for (let groupKey of group) {
                    let groupKeyField: any;
                    groupKeyField = groupKey.split("_")[1];
                    groupKeys.push(groupKeyField);
                }
                if (k.includes("_")) {
                    let theKey = k.split("_")[1];
                    let thisqID: string = k.split("_")[0];
                    if (!groupKeys.includes(theKey) || !(thisqID === qID)) {
                        return false;
                    }
                } else {
                    if (!applyKeys.includes(k)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public static basicCheckQWCO (queryChecked: any): boolean {
        if (typeof queryChecked !== "object" || queryChecked === null || Array.isArray(queryChecked)) {
            return false;
        }
        for (let y in queryChecked) {
            if (y !== "WHERE" && y !== "OPTIONS" && y !== "TRANSFORMATIONS") {
                return false;
            }
        }
        if (!("WHERE" in queryChecked)) {
            return false;
        } else if (queryChecked["WHERE"] === null || queryChecked["WHERE"] === undefined) {
            return false;
        } else if (typeof queryChecked["WHERE"] !== "object" || Array.isArray(queryChecked["WHERE"])) {
            return false;
        } else if (!("OPTIONS" in queryChecked)) {
            return false;
        } else if (queryChecked["OPTIONS"] === null || queryChecked["OPTIONS"] === undefined) {
            return false;
        } else if (typeof queryChecked["OPTIONS"] !== "object" || Array.isArray(queryChecked["OPTIONS"])) {
            return false;
        } else if (!("COLUMNS" in queryChecked["OPTIONS"])) {
            return false;
        } else if (queryChecked["OPTIONS"]["COLUMNS"] === null || queryChecked["OPTIONS"]["COLUMNS"] === undefined) {
            return false;
        } else if (! Array.isArray(queryChecked["OPTIONS"]["COLUMNS"])) {
            return false;
        } else if ("ORDER" in queryChecked["OPTIONS"]) {
            if ( queryChecked["OPTIONS"]["ORDER"] === null || queryChecked["OPTIONS"]["ORDER"] === undefined
                || (typeof queryChecked["OPTIONS"]["ORDER"] !== "string"
                    && typeof queryChecked["OPTIONS"]["ORDER"] !== "object")) {
                return false;
            }
        }
        for (let y in queryChecked["OPTIONS"]) {
            if (y !== "COLUMNS" && y !== "ORDER") {
                return false;
            }
        }
        return true;
    }
}
