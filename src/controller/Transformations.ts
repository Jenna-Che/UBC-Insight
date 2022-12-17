
import Log from "../Util";
import {Decimal} from "decimal.js";


export default class Transformations {

    public static groupApply(data: { [id: string]: { [key: string]: any } }, query: any):
        { [groupid: string]: { [key: string]: any} } {
        let group: any = query["TRANSFORMATIONS"]["GROUP"];
        let applyrule: any = query["TRANSFORMATIONS"]["APPLY"];
        let groupData: { [groupid: string]: { [id: string]: { [key: string]: any } } } = {};
        let groupresult: { [groupid: string]: { [key: string]: any} } = {};
        for (let id in data) {
            let groupid: string = "";
            for (let key of group) {
                let realKey = key.split("_")[1];
                let content: string = data[id][realKey];
                groupid = groupid + "," + content;
            }
            if (!(groupid in groupData)) {
                groupData[groupid]  = {};
                groupData[groupid][id] = data[id];
                groupresult[groupid] = {};
                for (let key of group) {
                    let realKey = key.split("_")[1];
                    groupresult[groupid][realKey] = data[id][realKey];
                }
            } else {
                groupData[groupid][id] = data[id];
            }
        }
        for (let groupid in groupData) {
            for (let rule of applyrule) {
                let applyKey: string = Object.keys(rule)[0];
                groupresult[groupid][applyKey] = Transformations.applyHelper(groupData[groupid], rule);

            }
        }
        return groupresult;
    }

    public static applyHelper(grp: { [id: string]: { [key: string]: any } } , rule: any): any {
        let result: number = 0;
        let applyKey: string = Object.keys(rule)[0];
        let applyr: any = rule[applyKey];
        let applyToken: string = Object.keys(applyr)[0];
        let applyObj: string = applyr[applyToken];
        let applyObjreal: string = applyObj.split("_")[1];
        if (applyToken === "MAX") {
            let max: number = 0;
            for (let id in grp) {
                if (grp[id][applyObjreal] > max) {
                    max = grp[id][applyObjreal];
                }
            }
            result = max;
        } else if (applyToken === "MIN") {
            let min: number = Infinity;
            for (let id in grp) {
                if (grp[id][applyObjreal] < min) {
                    min = grp[id][applyObjreal];
                }
            }
            result = min;
        } else if (applyToken === "AVG") {
            let total = new Decimal(0);
            for (let id in grp) {
                let val = new Decimal(grp[id][applyObjreal]);
                total = Decimal.add(total, val);
            }
            let avg = total.toNumber() / Object.keys(grp).length;
            let res = Number(avg.toFixed(2));
            result = res;
        } else if (applyToken === "COUNT") {
            let occ: any[] = [];
            for (let id in grp) {
                if (!(occ.includes(grp[id][applyObjreal]))) {
                    occ.push(grp[id][applyObjreal]);
                }
            }
            result = occ.length;
        } else if (applyToken === "SUM") {
            let total = new Decimal(0);
            for (let id in grp) {
                total = Decimal.add(total, grp[id][applyObjreal]);
            }
            let res = Number(total.toFixed(2));
            result = res;
        }
        return result;
    }

}
