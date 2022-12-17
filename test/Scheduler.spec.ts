import TestUtil from "./TestUtil";
import { expect } from "chai";
import { equal, fail, doesNotReject } from "assert";
const { PerformanceObserver, performance } = require("perf_hooks");
import Scheduler from "../src/scheduler/Scheduler";
import {IScheduler, SchedRoom, SchedSection, TimeSlot} from "../src/scheduler/IScheduler";
import Log from "../src/Util";

describe("Timetable Scheduler", function () {
    let sections1: SchedSection[] = [
        {
            courses_dept: "cpsc",
            courses_id: "340",
            courses_uuid: "1319",
            courses_pass: 101,
            courses_fail: 7,
            courses_audit: 2
        },
        {
            courses_dept: "cpsc",
            courses_id: "340",
            courses_uuid: "3397",
            courses_pass: 171,
            courses_fail: 3,
            courses_audit: 1
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "62413",
            courses_pass: 93,
            courses_fail: 2,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "72385",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "72389",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "71345",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "72345",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "73345",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "74345",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "75345",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "76345",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "77345",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "78345",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "79345",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "72945",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "72955",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "72985",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        }
    ];

    let rooms1: SchedRoom[] = [
        {
            rooms_shortname: "AERL",
            rooms_number: "120",
            rooms_seats: 260,
            rooms_lat: 49.26372,
            rooms_lon: -123.25099
        },
        {
            rooms_shortname: "ALRD",
            rooms_number: "105",
            rooms_seats: 94,
            rooms_lat: 49.2699,
            rooms_lon: -123.25318
        },
        {
            rooms_shortname: "ANGU",
            rooms_number: "098",
            rooms_seats: 260,
            rooms_lat: 49.26486,
            rooms_lon: -123.25364
        },
        {
            rooms_shortname: "BUCH",
            rooms_number: "A101",
            rooms_seats: 275,
            rooms_lat: 49.26826,
            rooms_lon: -123.25468
        }
    ];

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    it("Test scheduling short arrays", function () {
        Log.trace("running");
        let scheduler: Scheduler = new Scheduler();
        let t0 = performance.now();
        let result = scheduler.schedule(sections1, rooms1);
        let t1 = performance.now();
        Log.trace("Call to doSomething took " + (t1 - t0) + " milliseconds.");
        Log.trace(result.length, sections1.length);
        Log.trace(result);
    });
});
