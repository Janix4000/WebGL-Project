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