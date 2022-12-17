import Log from "../Util";
import * as JSZip from "jszip";
import * as parse5 from "parse5";
import * as http from "http";

// return a dictionary that contains all sections loaded from the course dataset
export default class AddDatasetController {

    public static addCourseDataset(content: string): Promise<any> {
        let datasetDict: {[id: string]: {[key: string]: any}} = {};
        let promiseArray: any = [];
        return new Promise(function (resolve, reject) {
            let zip = new JSZip();
            zip.loadAsync(content, {base64: true}).then(function (addedZip) {
                addedZip.folder("courses").forEach(function (relativePath, file) {
                    let promise = file.async("string").then().catch();
                    promiseArray.push(promise);
                });
                Promise.all(promiseArray).then(function (files: any) {
                    for (let file of files) {
                        try {
                            let course = JSON.parse(file);
                            for (let section of course["result"]) {
                                let sectionID: string = section["id"].toString();
                                let year: number = ((section["Section"] === "overall") ?
                                    1900 : parseInt(section["Year"], 10));
                                let department: string = section["Subject"];
                                let cid: string = section["Course"];
                                let average: string = section["Avg"];
                                let professor: string = section["Professor"];
                                let title: string = section["Title"];
                                let pass: string = section["Pass"];
                                let fail: string = section["Fail"];
                                let audit: string = section["Audit"];
                                if (sectionID === undefined || department === undefined || cid === undefined ||
                                    average === undefined || professor === undefined || title === undefined || pass
                                    === undefined || fail === undefined || audit === undefined || year === undefined) {
                                    continue;
                                }
                                datasetDict[sectionID] = {
                                    dept: department, id: cid, avg: average, instructor: professor, title: title,
                                    pass: pass, fail: fail, audit: audit, uuid: sectionID, year: year
                                };
                            }
                        } catch (err) {
                            Log.trace("Invalid JSON file!");
                        }
                    }
                    return resolve(datasetDict);
                }).catch(function (err) {
                    return reject(err);
                });
            }).catch(function (err) {
                return reject(err);
            });
        });
    }

    public static addRoomDataset(content: string): Promise<any> {
        let datasetDict: { [id: string]: { [key: string]: any } } = {};
        let promiseArray: any = [];
        return new Promise((function (resolve, reject) {
            AddDatasetController.parseZip(content).then(function (array) {
                promiseArray = array;
                Promise.all(promiseArray).then(function (buildingDicts) {
                    if (buildingDicts.length > 0) {
                        for (let room of buildingDicts) {
                            datasetDict = Object.assign(room, datasetDict);
                        }
                    }
                    return resolve(datasetDict);
                }).catch(function (error) {
                    return reject(error);
                });
            }).catch(function (error) {
                return reject(error);
            });
        }));
    }

    private static parseZip(content: string): Promise<any[]> {
        let promiseArray: any = [];
        return new Promise( (function (resolve, reject) {
            let zip = new JSZip();
            zip.loadAsync(content, {base64: true}).then(function (addedZip) {
                addedZip.folder("rooms").file("index.htm").async("string").then(function (file) {
                    let index: any = parse5.parse(file);
                    let buildings = AddDatasetController.getTableContents(index);
                    if (buildings === null) {
                        return reject(new Error("invalid html"));
                    }
                    for (let building of buildings) {
                        let buildingPromise = AddDatasetController.getRoomDictionary(building, addedZip);
                        promiseArray.push(buildingPromise);
                    }
                    return resolve(promiseArray);
                }).catch(function (error) {
                    return reject(error);
                });
            }).catch(function (error) {
                return reject(error);
            });
        }));
    }


    private static getRoomDictionary(building: any, addedZip: JSZip): any {
        return new Promise((resolve) => {
            let datasetDict: { [id: string]: { [key: string]: any } } = {};
            let bldMap = AddDatasetController.getBuildingInfo(building);
            addedZip.file(bldMap.get("path").replace(".", "rooms")).async("string").then(function (htmlFile) {
                    let parsedHtml: any = parse5.parse(htmlFile);
                    let rooms = AddDatasetController.getTableContents(parsedHtml);
                    if (rooms !== null) {
                        AddDatasetController.getGeolocation(bldMap.get("address")).then(function (geoLocation) {
                            if (geoLocation["error"] === undefined) {
                                let [lat, lon] = [geoLocation["lat"], geoLocation["lon"]];
                                // let lat: number = geoLocation["lat"];
                                // let lon: number = geoLocation["lon"];
                                for (let room of rooms) {
                                    let roomInfo = AddDatasetController.getRoomInfo(room);
                                    let seats: string = roomInfo.get("seats");
                                    if (bldMap.get("fullname") === undefined || bldMap.get("shortname") === undefined ||
                                        roomInfo.get("num") === undefined || bldMap.get("address") === undefined ||
                                        lat === undefined || lon === undefined || roomInfo.get("type") === undefined ||
                                        roomInfo.get("furniture") === undefined || roomInfo.get("href") === undefined) {
                                        continue;
                                    }
                                    datasetDict[bldMap.get("shortname") + "_" + roomInfo.get("num")] = {
                                        fullname: bldMap.get("fullname"),
                                        shortname: bldMap.get("shortname"),
                                        number: roomInfo.get("num"),
                                        name: bldMap.get("shortname") + "_" + roomInfo.get("num"),
                                        address: bldMap.get("address"),
                                        lat: lat,
                                        lon: lon,
                                        seats: (seats ? parseInt(seats, 10) : 0),
                                        type: roomInfo.get("type"),
                                        furniture: roomInfo.get("furniture"),
                                        href: roomInfo.get("href")
                                    };
                                }
                                return resolve(datasetDict);
                            } else {
                                return resolve(datasetDict);
                            }
                        }).catch(function () {
                            return resolve(datasetDict);
                        });
                    } else {
                        return resolve(datasetDict);
                    }
                }).catch(function () {
                    return resolve(datasetDict);
            });
        });
    }

    private static getBuildingInfo(building: any): Map<string, any> {
        let map: Map<string, any> = new Map<any, any>();
        let fullNameNode = AddDatasetController.getElementByAttr(building,
            "views-field views-field-title");
        map.set("fullname", fullNameNode.childNodes[1].childNodes[0].value);
        let shortNameNode = AddDatasetController.getElementByAttr(building,
            "views-field views-field-field-building-code");
        map.set("shortname", shortNameNode.childNodes[0].value.trim());
        let addressNode = AddDatasetController.getElementByAttr(building,
            "views-field views-field-field-building-address");
        map.set("address", addressNode.childNodes[0].value.trim());
        let pathNode = AddDatasetController.getElementByAttr(building, "views-field views-field-title");
        map.set("path", pathNode.childNodes[1].attrs[0].value);
        return map;
    }

    private static getRoomInfo(room: any): Map<string, any> {
        let map: Map<string, any> = new Map<any, any>();
        let numberNode = AddDatasetController.getElementByAttr(room,
            "views-field views-field-field-room-number");
        map.set("num", numberNode.childNodes[1].childNodes[0].value);
        map.set("href", numberNode.childNodes[1].attrs[0].value);
        let seatsNode = AddDatasetController.getElementByAttr(room,
            "views-field views-field-field-room-capacity");
        map.set("seats", seatsNode.childNodes[0].value.trim());
        let typeNode = AddDatasetController.getElementByAttr(room,
            "views-field views-field-field-room-type");
        map.set("type", typeNode.childNodes[0].value.trim());
        let furnitureNode = AddDatasetController.getElementByAttr(room,
            "views-field views-field-field-room-furniture");
        map.set("furniture", furnitureNode.childNodes[0].value.trim());
        return map;
    }

    private static getTableContents(html: Document): any[] {
        let nodes = AddDatasetController.getElementByName(html, "table");
        let table = AddDatasetController.findRightTable(nodes);
        if (table === null) {
            return table;
        }
        let tbody = AddDatasetController.getElementByName(table, "tbody")[0];
        return AddDatasetController.getElementByName(tbody, "tr");
    }

    private static findRightTable(nodes: any[]): any {
        // find the right table that contains valid building data
        if (nodes.length !== 0) {
            if (nodes.length === 1) {
                return nodes[0];
            } else {
                for (let node of nodes) {
                    if (node.attrs[0].value === "views-table cols-5 table") {
                        return node;
                    }
                }
            }
        }
        return null;
    }

    private static getElementByName(node: any, name: string): any[] {
        let nodesReturn = [];
        if (node.childNodes !== undefined) {
            for (let childNode of node.childNodes) {
                if (childNode.nodeName === name) {
                    nodesReturn.push(childNode);
                }
                let subNodes = this.getElementByName(childNode, name);
                if (subNodes.length !== 0) {
                    for (let subNode of subNodes) {
                        nodesReturn.push(subNode);
                    }
                }
            }
        }
        return nodesReturn;
    }

    private static getElementByAttr(node: any, value: string): any {
        let nodeReturn = null;
        if (node.childNodes !== undefined) {
            for (let childNode of node.childNodes) {
                if (childNode.attrs !== undefined && childNode.attrs.length !== 0) {
                    if (childNode.attrs[0].value === value) {
                        return childNode;
                    }
                }
                let temp = this.getElementByAttr(childNode, value);
                if (temp !== null) {
                    nodeReturn = temp;
                }
            }
        }
        return nodeReturn;
    }

    private static getGeolocation(address: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let encodedAddress = address.replace(/\s/g, "%20");
            let url = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team055/${encodedAddress}`;
            http.get(url,  (res) => {
                let statusCode = res.statusCode;
                if (statusCode !== 200) {
                    let error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
                    Log.trace(error);
                    return reject(error);
                }
                res.setEncoding("utf8");
                let rawData = "";
                res.on("data", function (geo: any) {
                    rawData += geo;
                }).on("end",  function () {
                    try {
                        let parsedData =  JSON.parse(rawData);
                        return resolve(parsedData);
                    } catch (e) {
                        return reject(e);
                    }
                }).on("error", (err) => {
                    return reject(err);
                });
            });
        });
    }

}
