import * as chai from "chai";
import {expect} from "chai";
import * as fs from "fs-extra";
import * as chaiAsPromised from "chai-as-promised";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any; // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string; // This is injected when reading the file
}

describe("InsightFacade Add/Remove/List Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        chai.use(chaiAsPromised);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs
                .readFileSync(datasetsToLoad[id])
                .toString("base64");
        }
        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs after each test, which should make each test independent from the previous one
        Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            // fs.removeSync(cacheDir);
            // fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    // This is a unit test. You should create more like this!
    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses);
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Should add more valid dataset", function () {
        const id1: string = "courses";
        const id2: string = "another";
        const expected: string[] = [id1, id2];
        return insightFacade.addDataset(id1,
            datasets[id1],
            InsightDatasetKind.Courses,
        ).then((result) => {
            const futRes: Promise<string[]> = insightFacade.addDataset(
                id2, datasets[id2], InsightDatasetKind.Courses, );
            return expect(futRes).to.eventually.equal(expected);
        });
    });


    it("Should not add a invalid dataset with no course", function () {
        const id: string = "empty";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });


    it("Should not add a invalid dataset with course section with missing req", function () {
        const id: string = "missingRequirment";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not add a zip with invalid course section", function () {
        const id: string = "invalidCourseSection";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not add a invalid dataset with not zip", function () {
        const id: string = "notzip";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not add a invalid dataset with not Json", function () {
        const id: string = "notJson";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not add a invalid dataset with empty id", function () {
        const id: string = "";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not add a invalid dataset with null id", function () {
        const id: string = null;
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not add a invalid dataset with undefined id", function () {
        const id: string = undefined;
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should reject dataset with roomkind", function () {
        const id: string = "courses";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });


// * If id is the same as the id of an already added dataset, the dataset should be rejected and not saved.
//     instance.asyncMethodA().then((e) => {
//         expect(e).to.equal(expectedA);
//         return expect(instance.asyncMethodB()).to.eventually.equal(expectedB));

    // return instance.asyncMethodA()
    //     .then((e) => {
    //         expect(e).to.equal(expectedA);
    //         return instance.asyncMethodB();
    //     })
    //     .then((resultFromB) => {
    //         expect(resultFromB).to.deep.equal(expectedB);
    //     })
    //     .catch((err: any) => ...));

    it("Should reject a dataset with same id", function () {
        const id1: string = "courses";
        const id2: string = "courses";
        return insightFacade.addDataset(id1,
            datasets[id1],
            InsightDatasetKind.Courses,
        ).then((result) => {
            const futRes: Promise<string[]> = insightFacade.addDataset(
                id2, datasets[id2], InsightDatasetKind.Courses, );
            return expect(futRes).to.be.rejectedWith(InsightError);
        });
    });


    // * An id is invalid if it contains an underscore, or is only whitespace characters.
    // it("Should reject a id with underscore", function () {
    //     const id: string = "courses_";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject a id with underscore without dataset", function () {
    //     const id: string = "course_s";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });

    // it("Should reject to add an id with only whitespace", function () {
    //     const id: string = " ";
    //     // const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should remove a valid dataset", function () {
    //     const id: string = "courses";
    //     const expected: string = id;
    //     return insightFacade.addDataset(id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((result) => {
    //         const futRes: Promise<string> = insightFacade.removeDataset(id);
    //         return expect(futRes).to.eventually.deep.equal(expected);
    //     });

    // });
    //
    // it("Should reject with a NotFoundError", function () {
    //     const id: string = "courses";
    //     const id2: string = "courses2";
    //     // const expectedA: string[] = [id];
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses, )
    //         .then((e) => {
    //             const futRes = insightFacade.removeDataset(id2);
    //             return expect(futRes).to.be.rejectedWith(NotFoundError);
    //         });
    // });

    // it("Should reject remove underscore with a InsightError", function () {
    //     const id: string = "courses_";
    //     const futureResult: Promise<string> = insightFacade.removeDataset(id);
    //
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject remove space with a InsightError", function () {
    //     const id: string = " ";
    //     const futureResult: Promise<string> = insightFacade.removeDataset(id);
    //
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });

    // it("Should reject remove null with a InsightError", function () {
    //     const id: null = null;
    //     const futureResult: Promise<string> = insightFacade.removeDataset(id);
    //
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });

    // it("Should reject remove undrfined with a InsightError", function () {
    //     const id: undefined = undefined;
    //     const futureResult: Promise<string> = insightFacade.removeDataset(id);
    //
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });

    // it("Should produce a list of dataset", function () {
    //     const id: string = "courses";
    //     const insightDataset: InsightDataset = {id: id, kind: InsightDatasetKind.Courses, numRows: 64612};
    //     const expected: InsightDataset[] = [insightDataset];
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses).then((result) => {
    //         const futRes: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //         return expect(futRes).to.eventually.deep.equal(expected);
    //     });
    //
    // });
    //
    // it("Should produce empty list of dataset", function () {
    //     const expected: InsightDataset[] = [];
    //
    //     const futRes: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //     return expect(futRes).to.eventually.deep.equal(expected);
    //
    //
    // });


});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: {
        [id: string]: { path: string; kind: InsightDatasetKind };
    } = {
        courses: {
            path: "./test/data/courses.zip",
            kind: InsightDatasetKind.Courses,
        }, rooms: {
            path: "./test/data/rooms.zip",
            kind: InsightDatasetKind.Rooms,
        }
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail(
                "",
                "",
                `Failed to read one or more test queries. ${err}`,
            );
        }
        Log.trace("Statrt to load");
        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        Log.trace("Statrt near to load");
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(
                insightFacade.addDataset(id, data, ds.kind),
            );
        }
        Log.trace("finish to load");
        return Promise.all(loadDatasetPromises);
            // .catch((err) => {
            //     /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
            //      * for the purposes of seeing all your tests run.
            //      * TODO For C1, remove this catch block (but keep the Promise.all)
            //      */
            //     return Promise.resolve("HACK TO LET QUERIES RUN");
            // });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    const futureResult: Promise<any[]> = insightFacade.performQuery(test.query);
                    return TestUtil.verifyQueryResult(futureResult, test);
                });
            }
        });
    });
});
