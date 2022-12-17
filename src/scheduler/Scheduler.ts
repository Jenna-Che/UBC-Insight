import {IScheduler, SchedRoom, SchedSection, TimeSlot} from "./IScheduler";
import TimeSlotObj from "./TimeSlotObj";
import Log from "../Util";

export default class Scheduler implements IScheduler {

    public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
        let timeTable: Array<[SchedRoom, SchedSection, TimeSlot]> = [];
        // let courseDictoinary: { [roomname: string]: { [time: string]: { [key: string]: any } } } = {};
        let courseSizeDecreasing = this.CourseDecendingEnroll(sections);
        let allTimeSlots = TimeSlotObj.allTimeSlots();

        for (let section of courseSizeDecreasing) {
            let courseSize = (section.courses_pass + section.courses_fail + section.courses_audit);
            let largeEnoughRooms: SchedRoom[] = [];
            for (let room of rooms) {
                if (courseSize < room.rooms_seats || courseSize === room.rooms_seats) {
                    largeEnoughRooms.push(room);
                }
            }
            // the time slot for same section
            let recordedSectionTimeSlots = this.recordedSectionTimeSlots(section, timeTable);
            let tableElement: [SchedRoom, SchedSection, TimeSlot];
            let roomSizeDistDecreasing: SchedRoom[] = [];

            if (largeEnoughRooms.length !== 0) {
                let largestRoom = this.largestRoom(rooms);
                roomSizeDistDecreasing = this.roomDecendingEnrollDist(largeEnoughRooms, largestRoom);
                // Log.trace(roomSizeDistDecreasing);
                // let roomDistanceDecreasing = this.roomDistanceDecreasing(roomSizeDecreasing);
            }
            while (roomSizeDistDecreasing.length !== 0) {
                let bestRoom = roomSizeDistDecreasing[0];
                // the time slot assigned for the room?
                let recordedRoomTimeSlots = this.recordedRoomTimeSlots(bestRoom, timeTable);
                let validTimeSlot = this.validTimeSlot(allTimeSlots, recordedRoomTimeSlots, recordedSectionTimeSlots);
                if (validTimeSlot.length > 0) {
                    // this.remove(validTimeSlot, bestRoom.availableTimeSlots);
                    let theTimeSlot = validTimeSlot[0];
                    tableElement = [bestRoom, section, theTimeSlot];
                    timeTable.push(tableElement);
                    break;
                } else {
                    this.arrayRemove(bestRoom, roomSizeDistDecreasing);
                }
            }
        }
        return timeTable;
    }

    public recordedSectionTimeSlots(section: SchedSection, timeTable: Array<[SchedRoom, SchedSection, TimeSlot]>):
        TimeSlot[] {
        let res: TimeSlot[] = [];
        for (let tb of timeTable) {
            if (section.courses_dept === tb[1].courses_dept &&
                section.courses_id === tb[1].courses_id) {
                res.push(tb[2]);
            }
        }
        return res;
    }

    public recordedRoomTimeSlots(room: SchedRoom, timeTable: Array<[SchedRoom, SchedSection, TimeSlot]>):
        TimeSlot[] {
        let res: TimeSlot[] = [];
        for (let tb of timeTable) {
            if (room.rooms_shortname === tb[0].rooms_shortname &&
                room.rooms_number === tb[0].rooms_number) {
                res.push(tb[2]);
            }
        }
        return res;
    }

    public largestRoom(rooms: SchedRoom[]): SchedRoom {
        let result: SchedRoom;
        let size: number = 0;
        for (let room of rooms) {
            let roomSize = room.rooms_seats;
            if (size < roomSize) {
                result = room;
                size = roomSize;
            }
        }
        return result;
    }

    public validTimeSlot(allTimeSlots: TimeSlot[], assignedRoomTimeSlots: TimeSlot[],
                         assignedSectionTimeSlots: TimeSlot[]): TimeSlot[] {
        let avaliableRoomTimeSlots: TimeSlot[] = [];
        for (let time of allTimeSlots) {
            if ((!assignedRoomTimeSlots.includes(time)) && (!assignedSectionTimeSlots.includes(time))) {
                avaliableRoomTimeSlots.push(time);
            }
        }
        // if (avaliableRoomTimeSlots.length > 0) {
        return avaliableRoomTimeSlots;
        // }
    }

    // from https://stackoverflow.com/questions/15292278/how-do-i-remove-an-array-item-in-typescript
    public arrayRemove(element: any, array: any[]) {
        let index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
    }

    public CourseDecendingEnroll(sections: SchedSection[]): SchedSection[] {
        return sections.sort((a, b) => {
            let aSize = (a.courses_pass + a.courses_fail + a.courses_audit);
            let bSize = (b.courses_pass + b.courses_fail + b.courses_audit);
            if (aSize < bSize) {
                return 1;
            } else if (aSize > bSize) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    public roomDecendingEnrollDist(rooms: SchedRoom[], theFirstRoom: SchedRoom): SchedRoom[] {
        return rooms.sort((a, b) => {
            let adist = this.findDistance(a, theFirstRoom);
            let bdist = this.findDistance(b, theFirstRoom);
            // if (aSize < bSize) {
            //     return 1;
            // } else if (aSize > bSize) {
            //     return -1;
            // } else if (aSize === bSize) {
                // let adist = this.findDistance(a, theFirstRoom);
                // let bdist = this.findDistance(b, theFirstRoom);
                // Log.trace("a " + adist + a.rooms_shortname + a.rooms_number);
                // Log.trace("b " + bdist + b.rooms_shortname + b.rooms_number);
            if (adist < bdist) {
                return -1;
            } else if (adist > bdist) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    public findDistance(theFirstRoom: SchedRoom, theSecRoom: SchedRoom): number {

        let lon1 = theFirstRoom.rooms_lon;
        let lat1 = theFirstRoom.rooms_lat;

        let lon2 = theSecRoom.rooms_lon;
        let lat2 = theSecRoom.rooms_lat;

        let R = 6371000;

        let x1 = lat2 - lat1;
        let dLatPhy = toRad(x1);
        let x2 = lon2 - lon1;
        let dLonPhy = toRad(x2);
        let a = Math.sin(dLatPhy / 2) * Math.sin(dLatPhy / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLonPhy / 2) * Math.sin(dLonPhy / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
        return d;

        function toRad(x: number) {
            return x * Math.PI / 180;
        }
    }
    // public validRooms(section: SchedSection, rooms: SchedRoom[]): SchedRoom[] {
    //     let courseSize = (section.courses_pass + section.courses_fail + section.courses_audit);
    //     let validRoom: SchedRoom[] = [];
    //     for (let room of rooms) {
    //         if (courseSize < room.rooms_seats || courseSize === room.rooms_seats) {
    //             validRoom.push(room);
    //         }
    //     }
    //     return validRoom;
    // }
}
