import Log from "../Util";
import {InsightError} from "./IInsightFacade";


export default class MakeQueryResult {

    public static bodyHandler(data: { [id: string]: { [key: string]: any } }, body: any[]):
        { [id: string]: { [key: string]: any } } {
        let selectedData: { [id: string]: { [key: string]: any } } = {};
        let keys: any[] = Object.keys(body);
        let thisFilter = keys[0];
        let inside = body[thisFilter];
        if (keys.length === 0) {
            return data;
        } else if (thisFilter === "AND" || thisFilter === "OR" || thisFilter === "NOT") {
            selectedData = MakeQueryResult.logicHelper(data, body);
        } else if (thisFilter === "GT" || thisFilter === "LT" || thisFilter === "EQ") {
            selectedData = MakeQueryResult.mcompHelper(data, body);
        } else if (thisFilter === "IS") {
            selectedData = MakeQueryResult.scompHelper(data, inside);
        }
        return selectedData;
    }

    public static scompHelper(data: { [id: string]: { [key: string]: any } }, inside: any):
        { [id: string]: { [key: string]: any } } {
        let result: { [id: string]: { [key: string]: any } } = {};
        let pmKey: any[] = Object.keys(inside);
        let sKey: string = pmKey[0];
        let sField: string = sKey.split("_")[1];
        let isStirng: string = "";
        isStirng = inside[sKey];
        if (!isStirng.includes("*")) {
            for (let id in data) {
                if (data[id][sField] === isStirng) {
                    result[id] = data[id];
                }
            }
            return result;
        } else if ((isStirng === "*") || (isStirng === "**")) {
            for (let id in data) {
                if (!(id in result)) {
                    result[id] = data[id];
                }
            }
            return result;
        } else if ((!(isStirng.charAt(0) === "*")) && (isStirng.charAt(isStirng.length - 1) === "*")) {
            isStirng = isStirng.substring(0, isStirng.length - 1);
            for (let id in data) {
                let sInData: string = data[id][sField];
                if (sInData.substring(0, isStirng.length) === isStirng) {
                    if (!(id in result)) {
                        result[id] = data[id];
                    }
                }
            }
            return result;
        } else if ((isStirng.charAt(0) === "*") && (!(isStirng.charAt(isStirng.length - 1) === "*"))) {
            isStirng = isStirng.substring(1);
            for (let id in data) {
                let sInData: string = data[id][sField];
                if (sInData.substring((sInData.length - isStirng.length), sInData.length) === isStirng) {
                    if (!(id in result)) {
                        result[id] = data[id];
                    }
                }
            }
            return result;
        // } else if ((isStirng.charAt(0) === "*") && (!(isStirng.charAt(isStirng.length - 1) === "*"))) {
        //     isStirng = isStirng.substring(1);
        //     for (let id in data) {
        //         let sInData: string = data[id][sField];
        //         if (sInData.substring((sInData.length - isStirng.length), sInData.length) === isStirng) {
        //             if (!(id in result)) {
        //                 result[id] = data[id];
        //             }
        //         }
        //     }
        //     return result;
        } else if ((isStirng.charAt(0) === "*") && (isStirng.charAt(isStirng.length - 1) === "*")) {

            return MakeQueryResult.scompHelperStrSandEnd(result, isStirng, data, sField);
        }
        return result;
    }

    public static mcompHelper(datam: { [id: string]: { [key: string]: any } }, mathBody: any[]):
        { [id: string]: { [key: string]: any } } {
        let result: { [id: string]: { [key: string]: any } } = {};
        let fKeys: any[] = Object.keys(mathBody);
        let thisF: any = fKeys[0];
        let insi = mathBody[thisF];
        let pmKey: any[] = Object.keys(mathBody[thisF]);
        let mKey: string = pmKey[0];
        let mField: string = mKey.split("_")[1];
        let mNum: number = insi[mKey];
        if (thisF === "GT") {
            for (let id in datam) {
                if (datam[id][mField] > mNum) {
                    result[id] = datam[id];
                }
            }
            return result;
        } else if (thisF === "LT") {
            for (let id in datam) {
                if (datam[id][mField] < mNum) {
                    result[id] = datam[id];
                }
            }
            return result;

        } else if (thisF === "EQ") {
            for (let id in datam) {
                if (datam[id][mField] === mNum) {
                    result[id] = datam[id];
                }
            }
            return result;
        }
    }

    public static logicHelper(datal: { [id: string]: { [key: string]: any } }, logicBody: any[]):
        { [id: string]: { [key: string]: any } } {
        let result: { [id: string]: { [key: string]: any } } = {};
        let fKeys: any[] = Object.keys(logicBody);
        let thisF: any = fKeys[0];
        let insi = logicBody[thisF];
        if (thisF === "AND") {
            result = datal;
            for (let eachFilter of insi) {
                result = MakeQueryResult.bodyHandler(result, eachFilter);
            }
            return result;

        } else if (thisF === "OR") {
            for (let eachFilter of insi) {
                let temp: { [id: string]: { [key: string]: any } } = MakeQueryResult.bodyHandler(datal, eachFilter);
                for (let id in temp) {
                    if ((id in temp) && !(id in result)) {
                        result[id] = temp[id];

                    }
                }
            }
            return result;

        } else if (thisF === "NOT") {
            let temp: { [id: string]: { [key: string]: any } } = MakeQueryResult.bodyHandler(datal, insi);
            for (let id in datal) {
                if (!(id in temp) && !(id in result)) {
                    result[id] = datal[id];
                }
            }
            return result;
        }
    }


    public static optHandler(dataSelectedBody: { [id: string]: { [key: string]: any } }, col: any, ord: any): any [] {
        let mFiled: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        let sField: string[] = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name"
            , "address", "type", "furniture", "href"];
        let rList: any[] = [];
        for (let id in dataSelectedBody) {
            let added: any = {};
            for (let keys of col) {
                if (keys.includes("_")) {
                    let realKey = keys.split("_")[1];
                    added[keys] = dataSelectedBody[id][realKey];
                } else {
                    added[keys] = dataSelectedBody[id][keys];
                }
            }
            rList.push(added);
        }
        if ((ord !== null && (typeof ord === "string"))) {
            rList.sort((n1, n2) => {
                if (n1[ord] > n2[ord]) {
                    return 1;
                }
                if (n1[ord] < n2[ord]) {
                    return -1;
                }
                return 0;
            });
            return rList;
        } else if ((!(ord === null)) && (typeof ord === "object")) {
            return MakeQueryResult.sortFnObjOrd(ord, rList);
        }
        return rList;
    }

    public static gettransqID(trans: any): string {
        let qID: string = "";
        if (trans !== null) {
            let group: any[] = trans["GROUP"];
            qID = group[0].split("_")[0];
        }
        return qID;
    }

    public static sortFnObjOrd(ord: any, rList: any[]): any[] {
        let dir: any = ord["dir"];
        let ordkeys: any[] = ord["keys"];
        rList.sort(function (n1, n2) {
            for (const key of ordkeys) {
                if (n1[key] !== n2[key]) {
                    if (dir === "UP") {
                        if (n1[key] < n2[key]) {
                            return -1;
                        } else if (n1[key] > n2[key]) {
                            return 1;
                        }
                    } else {
                        if (n1[key] < n2[key]) {
                            return 1;
                        } else if (n1[key] > n2[key]) {
                            return -1;
                        }
                    }
                }
            }
            return 0;
        });
        return rList;
    }

    public static scompHelperStrSandEnd (result:  { [id: string]: { [key: string]: any } }, isStirng: string,
                                         data: { [id: string]: { [key: string]: any } }, sField: string):
        { [id: string]: { [key: string]: any } } {
        isStirng = isStirng.substring(1, isStirng.length - 1);
        for (let id in data) {
            let sInData: string = data[id][sField];
            if (sInData.includes(isStirng)) {
                if (!(id in result)) {
                    result[id] = data[id];
                }
            }
        }
        return result;
    }

    public static getApplKeys (apply: any[]): any[] {
        let applyKeys: any[] = [];
        for (let applyRule of apply) {
            let appKeys: any[] = Object.keys(applyRule);
            let aKey: any = appKeys[0];
            if (!(aKey in applyKeys)) {
                applyKeys.push(aKey);
            }
        }
        return applyKeys;
    }

}
