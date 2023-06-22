import { DriveCMS } from "./drive-cms";

describe("DriveCMS", () => {
    it("should be instantiatable", () => {
        const driveCMS = new DriveCMS({});
        expect(driveCMS).toBeDefined();
    });
});
