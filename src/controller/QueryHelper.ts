import {IInsightFacade, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";
import BasicCheck from "./BasicCheck";
let courseFiled: string[] = ["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];
let roomField: string[] = ["lat", "lon", "seats", "fullname", "shortname", "number", "name"
    , "address", "type", "furniture", "href"];

export default class QueryHelper {

    public static validWhere(body: any[], qID: string, possibleId: string[]): boolean {
        let Self = this;
        let mFiled: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        let sField: string[] = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name"
            , "address", "type", "furniture", "href"];
        if (!(typeof body === "object")) {
            return false;
        }
        let keys: any[] = Object.keys(body);
        if (keys.length === 0) {
            return true;
        }
        let thisFilter = keys[0];
        let inside = body[thisFilter];
        let res: boolean;
        if (thisFilter === "AND" || thisFilter === "OR" || thisFilter === "NOT") {
            res = Self.logicCheck(body, possibleId, qID);
            if (!res) {
                return false;
            }
        } else if (thisFilter === "GT" || thisFilter === "LT" || thisFilter === "EQ") {
            res = Self.mcompCheck(body, qID, mFiled);
            if (!res) {
                return false;
            }
        } else if (thisFilter === "IS") {
            res = Self.scompCheck(inside, qID, sField);
            if (!res) {
                return false;
            }
        } else {
            return false;
        }
        return res;
    }

    public static scompCheck( ins: any, qID: string, sField: string[]): boolean {
        if (ins === null || ins === undefined) {
            return false;
        }
        if (!(typeof ins === "object")) {
            return false;
        }
        let pmKey: any[] = Object.keys(ins);
        if (pmKey.length !== 1) {
            return false;
        }
        let sKey: string = pmKey[0];
        let strField: string = sKey.split("_")[1];
        let strID: string = sKey.split("_")[0];
        let isStirng: string = "";
        if (typeof ins[sKey] !== "string") {
            return false;
        }
        isStirng = ins[sKey];
        if (isStirng === "*" || isStirng === "**") {
            return true;
        }
        if (Object.keys(ins).length === 0) {
            return false;
        }
        if (!(isStirng.indexOf("*") === -1)) {
            let str: string = isStirng.substring(1, isStirng.length - 1);
            if (str.includes("*")) {
                return false;
            }
        }
        if (!sField.includes(strField)) {
            return false;
        }
        if ((qID === "rooms" && !(roomField.includes(strField))) ||
            (qID === "courses" && !(courseFiled.includes(strField)))) {
            return false;
        }
        return strID === qID;
    }

    public static logicCheck(logicBody: any[], possibleId: string[], qID: string): boolean {
        let fKeys: any[] = Object.keys(logicBody);
        let thisF: any = fKeys[0];
        let ins = logicBody[thisF];
        if (ins === null || ins === undefined) {
            return false;
        }
        if (!(typeof ins === "object")) {
            return false;
        }
        if (thisF === "AND" || thisF === "OR") {
            if (Object.keys(ins).length === 0) {
                return false;
            }

            if (!Array.isArray(ins)) {
                return false;
            }
            for (let f of ins) {
                if (!(typeof f === "object")) {
                    return false;
                } else if (f === null || f === undefined) {
                    return false;
                }
                if (!(Object.keys(f).length === 1)) {
                    return false;
                }
                if (!QueryHelper.validWhere(f, qID, possibleId)) {
                    return false;
                }
            }
        } else if (thisF === "NOT") {
            if (Object.keys(ins).length === 0 || Object.keys(ins).length > 1) {
                return false;
            }
            if (!QueryHelper.validWhere(ins, qID, possibleId)) {
                return false;
            }
        }
        return true;
    }

    public static mcompCheck(mathBody: any[], qID: string, mFiled: string[]): boolean {
        let fKeys: any[] = Object.keys(mathBody);
        let thisF: any = fKeys[0];
        let ins = mathBody[thisF];
        if (ins === null || ins === undefined) {
            return false;
        } else if (!(typeof ins === "object")) {
            return false;
        }
        let pmKey: any[] = Object.keys(mathBody[thisF]);
        if (pmKey.length !== 1) {
            return false;
        }
        let mKey: string = "";
        mKey = pmKey[0];
        let mNum = ins[mKey];
        if (typeof mNum !== "number") {
            return false;
        }
        let mathField: string = mKey.split("_")[1];
        let mathID: string = mKey.split("_")[0];
        if (thisF === "GT" || thisF === "LT" || thisF === "EQ") {
            if (mathID !== qID) {
                return false;
            }
            if (Object.keys(ins).length === 0) {
                return false;
            }
            if (!(typeof ins === "object")) {
                return false;
            }
            if (!mFiled.includes(mathField)) {
                return false;
            }
            if ((qID === "rooms" && !(roomField.includes(mathField))) ||
                (qID === "courses" && !(courseFiled.includes(mathField)))) {
                return false;
            }
            return true;
        }
    }

    public static validQuery(queryChecked: any): boolean {
        if (!BasicCheck.basicCheckQWCO(queryChecked)) {
            return false;
        }
        if (queryChecked["OPTIONS"]["COLUMNS"].length < 1 || queryChecked["OPTIONS"]["COLUMNS"].includes(null)) {
            return false;
        } else if (Object.keys(queryChecked["WHERE"]).length > 1) {
            return false;
        } else if (Object.keys(queryChecked["WHERE"]).length === 1) {
            if (!("AND" in queryChecked["WHERE"]) && !("OR" in queryChecked["WHERE"])
                && !("GT" in queryChecked["WHERE"]) && !("LT" in queryChecked["WHERE"])
                && !("NOT" in queryChecked["WHERE"]) && !("EQ" in queryChecked["WHERE"])
                && !("IS" in queryChecked["WHERE"])) {
                return false;
            }
        }
        if ("TRANSFORMATIONS" in queryChecked) {
            if (typeof queryChecked["TRANSFORMATIONS"] !== "object" || Array.isArray(queryChecked["TRANSFORMATIONS"])
                || queryChecked["TRANSFORMATIONS"] === null) {
                return false;
            }
            let transformations: any = queryChecked["TRANSFORMATIONS"];
            if (!QueryHelper.validTrans(transformations)) {
                return false;
            }
        }
        return true;
    }

    public static someOptCheck(col: string[], qID: string, ord: any, trans: any, possibleId: string []): boolean {
        let mFiled: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        let sField: string[] = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name"
            , "address", "type", "furniture", "href"];
        if (!BasicCheck.bascicColCheck(col, trans, qID)) {
            return false;
        }
        if (qID === " " || qID.includes("_")) {
            return false;
        } else if (!(ord === null) && typeof ord === "string") {
                if (!(col.includes(ord))) {
                    return false;
                }
        }
        if (ord !== null && typeof ord === "object") {
            let sortKey: any[] = Object.keys(ord);
            if (!(sortKey.length === 2)) {
                return false;
            }
            for (let SK of sortKey) {
                if (SK !== "dir" && SK !== "keys") {
                    return false;
                }
            }
            if (ord["dir"] !== "UP" && ord["dir"] !== "DOWN") {
                return false;
            }
            let ordKeys: any = ord["keys"];
            if (!Array.isArray(ordKeys)) {
                return false;
            }
            if (ordKeys.length < 1) {
                return false;
            }
            for (let k of ordKeys) {
                if (!(col.includes(k))) {
                    return false;
                }
            }
        }
        return true;
    }

    public static validTrans(trans: any[]): boolean {
        let mFiled: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        let sField: string[] = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name"
            , "address", "type", "furniture", "href"];
        if (!BasicCheck.basicTransGroupCheck(trans)) {
            return false;
        }
        if (!("GROUP" in trans) || !(Array.isArray(trans["GROUP"] || trans["GROUP"] === null))) {
            return false;
        }
        let group: any[] = trans["GROUP"];
        for (let groupKey of group) {
            if (groupKey === null || !groupKey.includes("_")) {
                return false;
            }
            let groupKeyField: any = groupKey.split("_")[1];
            let keyID = group[0].split("_")[0];
            if ((!mFiled.includes(groupKeyField)) && !(sField.includes(groupKeyField))) {
                return false;
            }
            if ((keyID === "rooms" && !(roomField.includes(groupKeyField))) ||
                (keyID === "courses" && !(courseFiled.includes(groupKeyField)))) {
                return false;
            }
        }
        if (!("APPLY" in trans) || !(Array.isArray(trans["APPLY"]))) {
            return false;
        }
        let apply: any[] = trans["APPLY"];
        if (apply.length === 0) {
            return true;
        } else {
            let applyKeys: any[] = [];
            for (let applyRule of apply) {
                let appKeys: any[] = Object.keys(applyRule);
                let aKey: any = appKeys[0];
                if (!BasicCheck.basicCheckAppleRule(applyRule, applyKeys)) {
                    return false;
                }
                applyKeys.push(aKey);
                let aToken: any = applyRule[aKey];
                let apToken: any[] = Object.keys(aToken);
                let token: any = apToken[0];
                if (!BasicCheck.checktoken(token, aToken)) {
                    return false;
                }
            }
            return true;
        }
    }
}


