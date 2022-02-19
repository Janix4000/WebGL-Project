class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Cuboid {
    constructor(x, y, z, w, h, d) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.h = h;
        this.d = d;
    }

    contains(point) {
        return (
            (point.x <= this.x + this.w) &&
            (point.x >= this.x) &&
            (point.y <= this.y + this.h) &&
            (point.y >= this.y) &&
            (point.z <= this.z + this.d) &&
            (point.z >= this.z)
        );
    }

    intersectCuboid(other) {
        return !(
            this.x > other.x + other.w ||
            this.x + this.w < other.x ||
            this.y > other.y + other.h ||
            this.y + this.h < other.y ||
            this.z > other.z + other.d ||
            this.z + this.h < other.z
        );
    }
}

class Sphere {
    constructor(x, y, z, r) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
    }

    contains(point) {
        const dx = this.x - point.x;
        const dy = this.y - point.y;
        const dz = this.z - point.z;
        return (dx * dx + dy * dy + dz * dz) < (this.r * this.r);
    }

    intersectCircle(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        const sumR = this.r + other.r;
        return (dx * dx + dy * dy + dz * dz) < (sumR * sumR);
    }
    intersectRect(cuboid) {
        if (cuboid.contains({
            x: this.x,
            y: this.y,
            z: this.z
        })) {
            return true;
        }
        const dx = this.x - max(cuboid.x, min(this.x, cuboid.x + cuboid.w));
        const dy = this.y - max(cuboid.y, min(this.y, cuboid.y + cuboid.h));
        const dz = this.z - max(cuboid.z, min(this.z, cuboid.z + cuboid.d));
        return (dx * dx + dy * dy + dz * dz) < (this.r * this.r);
    }
}

class OctaTree {
    constructor(region, nMaxPoints, nMaxLevels) {
        this.region = region;
        if (nMaxPoints) {
            this.nMaxPoints = nMaxPoints;
        } else {
            this.nMaxPoints = 4;
        }
        if (nMaxLevels) {
            this.nMaxLevels = nMaxLevels;
        } else {
            this.nMaxLevels = 10;
        }

        this.points = [];
        this.subTrees = [];

        this.splitted = false;
        this.size = 0;
    }

    insert(point) {
        if (!this.region.contains(point)) {
            return false;
        }

        if (this.splitted) {
            this._insertToSubTrees(point);
        } else {
            this.points.push(point);
            if (this.points.length > this.nMaxPoints && this._canBeSplitted()) {
                this._split();
            }
        }
        this.size++;
        return true;
    }

    _canBeSplitted() {
        return this.nMaxLevels > 0;
    }

    _insertToSubTrees(point) {
        for (const subTree of this.subTrees) {
            if (subTree.insert(point)) {
                return true;
            }
        }
        return false;
    }

    _createSubTrees() {
        const x = this.region.x;
        const y = this.region.y;
        const z = this.region.z;
        const w = this.region.w / 2;
        const h = this.region.h / 2;
        const d = this.region.d / 2;

        const shifts = [
            (0, 0, 0),
            (0, h, 0),
            (0, h, d),
            (0, 0, d),

            (w, 0, 0),
            (w, h, 0),
            (w, h, d),
            (w, 0, d)
        ];

        for (const [ws, hs, ds] in shifts) {
            const partitionCube = new Cuboid(x + ws, y + hs, z + ds);
            this.subTrees.push(new OctaTree(partitionCube, this.nMaxPoints, this.nMaxLevels - 1));
        }
    }

    _split() {
        this._createSubTrees();

        while (this.points.length > 0) {
            const point = this.points.pop();
            this._insertToSubTrees(point);
        }

        this.splitted = true;
    }

    clear() {
        this.points = [];
        this.subTrees = [];

        this.splitted = false;
        this.size = 0;
    }

    query(range, points) {
        if (!points) {
            points = [];
        }
        if (range.intersectRect(this.region)) {
            if (this.splitted) {
                for (const subTree of this.subTrees) {
                    subTree.query(range, points);
                }
            } else {
                for (const point of this.points) {
                    if (range.contains(point)) {
                        points.push(point);
                    }
                }
            }
        }
        return points;
    }
}