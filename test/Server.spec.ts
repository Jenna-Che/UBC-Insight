import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import * as fs from "fs-extra";
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";
import {InsightDatasetKind} from "../src/controller/IInsightFacade";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;
    let SERVER_URL: string = "http://localhost:4321";
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip",
    };
    let datasets: { [id: string]: Buffer } = {};
    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        // TODO: start server here once and handle errors properly
        try {
            for (const id of Object.keys(datasetsToLoad)) {
                datasets[id] = fs.readFileSync(datasetsToLoad[id]);
            }
            server.start();
        } catch (error) {
            Log.trace(error);
        }
    });

    after(function () {
        // TODO: stop server here once!
        try {
            server.stop().then(function () {
                Log.trace("The server is stopped successfully.");
            });
        } catch (error) {
            Log.trace("The server could not be stopped due to", error);
        }
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Sample on how to format PUT requests
    it("PUT test for courses dataset", function () {
        try {
            let ENDPOINT_URL = "/dataset/courses/courses";
            let id: string = "courses";
            let ZIP_FILE_DATA = datasets[id]; // buffered zip file
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("putting dataset courses");
                    Log.trace("Response status: ", res.status);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("fail to put dataset courses");
                    expect.fail(err);
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("test fail");
        }
    });

    it("POST test for courses 200", function () {
        let ENDPOINT_URL = "/query";
        let content: Buffer = fs.readFileSync(__dirname + "/queries/simple.json");
        let testQuery = JSON.parse(content.toString()).query;
        try {
            return chai.request(SERVER_URL)
                .post(ENDPOINT_URL)
                .send(testQuery)
                .set("Content-Type", "application/json")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("querying dataset courses");
                    Log.trace("Response status: ", res.status);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("fail to get query results", err);
                    expect.fail(err);
                });
        } catch (err) {
            Log.trace("test fail");
        }
    });

    // it("POST test for courses 400", function () {
    //     try {
    //         let ENDPOINT_URL = "/query";
    //         let content: Buffer = fs.readFileSync(__dirname + "/queries/invalid.json");
    //         let testQuery = JSON.parse(content.toString()).query;
    //         return chai.request(SERVER_URL)
    //             .post(ENDPOINT_URL)
    //             .send(testQuery)
    //             .set("Content-Type", "application/json")
    //             .then(function (res: Response) {
    //                 Log.trace("querying dataset courses");
    //                 Log.trace("Response status: ", res.status);
    //                 expect(res.status).to.be.equal(400);
    //             })
    //             .catch(function (err) {
    //                 Log.trace("fail to get query results", err);
    //                 expect.fail(err);
    //             });
    //     } catch (err) {
    //         Log.trace("test fail");
    //     }
    // });

    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
    // it("DELETE test for courses dataset", function () {
    //     try {
    //         let ENDPOINT_URL = "/dataset/courses";
    //         return chai.request(SERVER_URL)
    //             .del(ENDPOINT_URL)
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 Log.trace("removing dataset courses");
    //                 Log.trace("Response status: ", res.status);
    //                 expect(res.status).to.be.equal(200);
    //             })
    //             .catch(function (err) {
    //                 // some logging here please!
    //                 Log.trace("fail to remove dataset courses");
    //                 expect.fail(err);
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //         Log.trace("test fail");
    //     }
    // });

    it("GET test for datasets", function () {
        try {
            let ENDPOINT_URL = "/datasets";
            return chai.request(SERVER_URL)
                .get(ENDPOINT_URL)
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("listing datasets");
                    Log.trace("Response status: ", res.status);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("fail to get datasets");
                    expect.fail(err);
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("test fail");
        }
    });
});


// describe("Facade D3 Queries", function () {
//
//     let facade: InsightFacade = null;
//     let server: Server = null;
//     const cacheDir = __dirname + "/../data";
//     let SERVER_URL: string = "http://localhost:4321";
//     const datasetsToLoad: { [id: string]: string } = {
//         courses: "./test/data/courses.zip",
//         rooms: "./test/data/rooms.zip",
//     };
//     let datasets: { [id: string]: string } = {};
//     chai.use(chaiHttp);
//
//     before(function () {
//         facade = new InsightFacade();
//         server = new Server(4321);
//         // TODO: start server here once and handle errors properly
//         if (!fs.existsSync(cacheDir)) {
//             fs.mkdirSync(cacheDir);
//         }
//         try {
//             for (const id of Object.keys(datasetsToLoad)) {
//                 datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
//             }
//             let id1: string = "courses";
//             let id2: string = "rooms";
//             facade.addDataset(id1, datasets[id1], InsightDatasetKind.Courses).then(function () {
//                 facade.addDataset(id2, datasets[id2], InsightDatasetKind.Rooms).then(function () {
//                         server.start().catch(function (err) {
//                             Log.trace(err);
//                         });
//                 });
//             });
//         } catch (error) {
//             Log.trace(error);
//         }
//     });
//
//     after(function () {
//         try {
//             fs.removeSync(cacheDir);
//             fs.mkdirSync(cacheDir);
//         } catch (err) {
//             Log.trace(err);
//         }
//         // TODO: stop server here once!
//         try {
//             server.stop().then(function () {
//                 Log.trace("The server is stopped successfully.");
//             });
//         } catch (error) {
//             Log.trace("The server could not be stopped due to", error);
//         }
//     });
//
//     beforeEach(function () {
//         // might want to add some process logging here to keep track of what"s going on
//         Log.test(`BeforeTest: ${this.currentTest.title}`);
//     });
//
//     afterEach(function () {
//         // might want to add some process logging here to keep track of what"s going on
//         Log.test(`AfterTest: ${this.currentTest.title}`);
//     });
//
//     it("POST test for courses 200", function () {
//         let ENDPOINT_URL = "/query";
//         let content: Buffer = fs.readFileSync(__dirname + "/queries/simple.json");
//         let testQuery = JSON.parse(content.toString()).query;
//         try {
//             return chai.request(SERVER_URL)
//                 .post(ENDPOINT_URL)
//                 .send(testQuery)
//                 .set("Content-Type", "application/json")
//                 .then(function (res: Response) {
//                     // some logging here please!
//                     Log.trace("querying dataset courses");
//                     Log.trace("Response status: ", res.status);
//                     expect(res.status).to.be.equal(200);
//                 })
//                 .catch(function (err) {
//                     // some logging here please!
//                     Log.trace(err);
//                     Log.trace("fail to get query results");
//                     expect.fail(err);
//                 });
//         } catch (err) {
//             // and some more logging here!
//             Log.trace("test fail");
//         }
//     });
//
//     it("POST test for courses 400", function () {
//         try {
//             let ENDPOINT_URL = "/query";
//             let content: Buffer = fs.readFileSync(__dirname + "/queries/invalid.json");
//             let testQuery = JSON.parse(content.toString()).query;
//             return chai.request(SERVER_URL)
//                 .post(ENDPOINT_URL)
//                 .send(testQuery)
//                 .set("Content-Type", "application/json")
//                 .then(function (res: Response) {
//                     // some logging here please!
//                     Log.trace("querying dataset courses");
//                     Log.trace("Response status: ", res.status);
//                     expect(res.status).to.be.equal(400);
//                 })
//                 .catch(function (err) {
//                     // some logging here please!
//                     Log.trace("fail to get query results");
//                     expect.fail(err);
//                 });
//         } catch (err) {
//             // and some more logging here!
//             Log.trace("test fail");
//         }
//     });
// });

