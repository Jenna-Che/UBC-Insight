import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError,
    ResultTooLargeError
} from "./IInsightFacade";
import QueryHelper from "./QueryHelper";
import MakeQueryResult from "./MakeQueryResult";
import Transformations from "./Transformations";
import AddDatasetController from "./AddDatasetController";
import * as fs from "fs-extra";
import * as JSZip from "jszip";
let mFiled: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
let sField: string[] = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name"
    , "address", "type", "furniture", "href"];

export class MyDataset implements InsightDataset {
    public constructor(id: string, kind: InsightDatasetKind, numRows: number) {
        this.id = id;
        this.kind = kind;
        this.numRows = numRows;
    }

    public id: string;
    public kind: InsightDatasetKind;
    public numRows: number;
}

export default class InsightFacade implements IInsightFacade {
    private static datasetMap: Map<any, any>;

    constructor() {
        InsightFacade.datasetMap = new Map<any, any>();
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        return new Promise((resolve, reject) => {
            // check if id is invalid (i.e. contains underscore or just whitespace or null/undefined)
            if (!(/^[^_]+$/.test(id)) || (/^\s+$/.test(id)) || (id === null) || (id === undefined)) {
                return reject(new InsightError("invalid id"));
            } else if (InsightFacade.datasetMap.has(id)) {
                return reject(new InsightError("duplicate id"));
            } else if ((kind === null) || (kind === undefined)) {
                return reject(new InsightError("invalid kind"));
            }

            if (kind === InsightDatasetKind.Courses) {
                AddDatasetController.addCourseDataset(content).then(function (dictionary) {
                    let result = InsightFacade.saveToDisk(id, kind, dictionary);
                    return resolve(result);
                }).catch(function () {
                    return reject (new InsightError());
                });
            } else if (kind === InsightDatasetKind.Rooms) {
                AddDatasetController.addRoomDataset(content).then(function (dictionary) {
                    let result = InsightFacade.saveToDisk(id, kind, dictionary);
                    return resolve(result);
                }).catch(function () {
                    return reject(new InsightError());
                });
            }
        });
    }

    private static saveToDisk(id: string, kind: InsightDatasetKind, dictionary: any): Promise<any> {
        return new Promise( (resolve, reject) => {
            const that = this;
            let returnVal: string[] = [];
            if (Object.keys(dictionary).length === 0) {
                return reject(new InsightError("empty zip file!!!"));
            } else {
                let numRows = Object.keys(dictionary).length;
                const myDataset: InsightDataset = new MyDataset(id, kind, numRows);
                that.datasetMap.set(id, myDataset);
                let jsonFile = JSON.stringify(dictionary, null, " ");
                fs.writeFile("./data/" + id + ".json", jsonFile, function (err) {
                    if (err) {
                        return reject(InsightError);
                    } else {
                        for (let key of that.datasetMap.keys()) {
                            returnVal.push(key);
                        }
                        return resolve(returnVal);
                    }
                });
            }
        });
    }

    // public static addRoomDataset(content: string): Promise<any> {
    //     let datasetDict: { [id: string]: { [key: string]: any } } = {};
    //     let promiseArray: any = [];
    //     return new Promise( (function (resolve, reject) {
    //         let zip = new JSZip();
    //         zip.loadAsync(content, {base64: true}).then(function (addedZip) {
    //             let file = addedZip.folder("rooms").file("index.htm").async("string");
    //             let index: any = parse5.parse(file);
    //             let buildings = AddDatasetController.getTableContents(index);
    //             for (let building of buildings) {
    //                     let pathNode = AddDatasetController.getElementByAttr(building,
    //                     "views-field views-field-title");
    //                     let path = pathNode.childNodes[1].attrs[0].value;
    //                     let htmlFile = addedZip.file(path.replace(".", "rooms")).async("string");
    //                     promiseArray.push(htmlFile);
    //             }
    //             Promise.all(promiseArray).then( function (htmlFiles: any) {
    //                     for (let htmlFile of htmlFiles) {
    //                         let parsedHtml: any = parse5.parse(htmlFile);
    //                         let buildingInfo = AddDatasetController.getElementByAttr(parsedHtml, "building-info");
    //                         let buildingNameNode = AddDatasetController.getElementByName(buildingInfo, "h2");
    //                         let buildingName = buildingNameNode[0].childNodes[0].childNodes[0].value;
    //                         let building;
    //                         let fullName: string;
    //                         for (let bld of buildings) {
    //                             let fullNameNode = AddDatasetController.getElementByAttr(bld,
    //                                 "views-field views-field-title");
    //                             fullName = fullNameNode.childNodes[1].childNodes[0].value;
    //                             if (fullName === buildingName) {
    //                                 building = bld;
    //                                 break;
    //                             }
    //                         }
    //                         let shortNameNode = AddDatasetController.getElementByAttr(building,
    //                             "views-field views-field-field-building-code");
    //                         let shortName: string = shortNameNode.childNodes[0].value.trim();
    //                         let addressNode = AddDatasetController.getElementByAttr(building,
    //                             "views-field views-field-field-building-address");
    //                         let address: string = addressNode.childNodes[0].value.trim();
    //                         let rooms = AddDatasetController.getTableContents(parsedHtml);
    //                         if (rooms === null) {
    //                             continue;
    //                         }
    //                         let geoLocation = AddDatasetController.getGeolocation(address);
    //                         let lat: number = geoLocation["lat"];
    //                         let lon: number = geoLocation["lon"];
    //                         for (let room of rooms) {
    //                             let numberNode = AddDatasetController.getElementByAttr(room,
    //                                 "views-field views-field-field-room-number");
    //                             let num: string = numberNode.childNodes[1].childNodes[0].value;
    //                             let name: string = shortName + "_" + num;
    //                             let href: string = numberNode.childNodes[1].attrs[0].value;
    //                             let seatsNode = AddDatasetController.getElementByAttr(room,
    //                                 "views-field views-field-field-room-capacity");
    //                             let seats = seatsNode.childNodes[0].value.trim();
    //                             let typeNode = AddDatasetController.getElementByAttr(room,
    //                                 "views-field views-field-field-room-type");
    //                             let type: string = typeNode.childNodes[0].value.trim();
    //                             let furnitureNode = AddDatasetController.getElementByAttr(room,
    //                                 "views-field views-field-field-room-furniture");
    //                             let furniture: string = furnitureNode.childNodes[0].value.trim();
    //
    //                             if (fullName === undefined || shortName === undefined || num === undefined ||
    //                                 address === undefined || lat === undefined || lon === undefined ||
    //                                 seats === undefined || type === undefined || furniture === undefined) {
    //                                 continue;
    //                             }
    //                             datasetDict[name] = {
    //                                 fullname: fullName, shortname: shortName, num: num, name: name, address: address,
    //                                 lat: lat, lon: lon, seats: parseInt(seats, 10), type: type,
    //                                 furniture: furniture, href: href
    //                             };
    //                         }
    //                     }
    //                     return resolve(datasetDict);
    //                 }).catch(function (err) {
    //                     return reject(err);
    //                 });
    //         }).catch(function (err) {
    //             return reject(err);
    //         });
    //     }));
    // }

    public removeDataset(id: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!(/^[^_]+$/.test(id)) || (/^\s+$/.test(id)) || (id === null) || (id === undefined)) {
                return reject(new InsightError("invalid id"));
            } else if (!(InsightFacade.datasetMap.has(id))) {
                return reject(new NotFoundError("dataset not exist"));
            } else {
                try {
                    fs.removeSync("./data/" + id + ".json");
                    InsightFacade.datasetMap.delete(id);
                } catch (err) {
                    return reject(new InsightError("unable to remove"));
                }
                return resolve(id);
            }
        });
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return new Promise<InsightDataset[]>((resolve) => {
            let datasetArray = Array.from(InsightFacade.datasetMap.values());
            resolve(datasetArray);
        });
    }

    public performQuery(query: any): Promise<any[]> {
        let possibleId: string [] = [];
        return new Promise<any[]>(function (fulfill, reject) {
            if (!QueryHelper.validQuery(query)) {
                return reject(new InsightError("invalid Query"));
            }
            // let where: any = query["WHERE"];
            let opt: any = query["OPTIONS"];
            let col: string[] = query["OPTIONS"]["COLUMNS"];
            let ord: any = "";
            let trans: any = {};
            ord = InsightFacade.getOrd(opt, ord);
            trans = InsightFacade.getTrans(query, trans);
            possibleId = InsightFacade.buildPossibleID(possibleId);
            let pqID: string [] = [];
            let qID: string = "";
            if (trans === null) {
                if (!InsightFacade.colCheckNoTrans(col, pqID)) {
                    return reject(new InsightError("invalid"));
                }
                pqID = col[0].split("_");
                qID = pqID[0];
            } else {
                qID = MakeQueryResult.gettransqID(trans);
            }
            if (!possibleId.includes(qID + ".json") || (!QueryHelper.validWhere(query["WHERE"], qID, possibleId))
                || (!QueryHelper.someOptCheck(col, qID, ord, trans, possibleId))) {
                return reject(new InsightError("invalid Query"));
            }
            let allData: { [id: string]: { [key: string]: any } } = {};
            try {
                let content = fs.readFileSync("./data/" + qID + ".json", "utf8");
                allData = JSON.parse(content);
            } catch (err) {
                return reject(new InsightError("file reading error"));
            }
            let dataSelectedBody: { [id: string]: { [key: string]: any } } = {};
            let qResult: any[] = [];
            dataSelectedBody = MakeQueryResult.bodyHandler(allData, query["WHERE"]);
            if ("TRANSFORMATIONS" in query) {
                dataSelectedBody = Transformations.groupApply(dataSelectedBody, query);
            }
            qResult = MakeQueryResult.optHandler(dataSelectedBody, col, ord);
            if (qResult.length > 5000) {
                return reject(new ResultTooLargeError("There are more than 5000 results"));
            } else {
                return fulfill(qResult);
            }
        });
    }

    private static getOrd (opt: any, ord: any): any {
        if ("ORDER" in opt) {
            ord = opt["ORDER"];
        } else {
            ord = null;
        }
        return ord;
    }

    private static getTrans (query: any, trans: any): any {
        if ("TRANSFORMATIONS" in query) {
            trans = query["TRANSFORMATIONS"];
        } else {
            trans = null;
        }
        return trans;
    }

    private static colCheckNoTrans (col: string[], pqID: string []): boolean {
        if (!(col[0].includes("_"))) {
            return false;
        }
        pqID = col[0].split("_");
        if (pqID.length > 2) {
            return false;
        }
        return true;
    }

    private static buildPossibleID (possibleId: string[]): string[] {
        fs.readdirSync("./data/").forEach(function (file: any) {
            possibleId.push(file);
        });
        return possibleId;
    }
}
