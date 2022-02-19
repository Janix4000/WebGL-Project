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
            (point.position.x <= this.x + this.w) &&
            (point.position.x >= this.x) &&
            (point.position.y <= this.y + this.h) &&
            (point.position.y >= this.y) &&
            (point.position.z <= this.z + this.d) &&
            (point.position.z >= this.z)
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
        if (z === undefined) {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            this.r = y;
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
            this.r = r;
        }
    }

    contains(point) {
        const dx = this.x - point.position.x;
        const dy = this.y - point.position.y;
        const dz = this.z - point.position.z;
        return (dx * dx + dy * dy + dz * dz) < (this.r * this.r);
    }

    intersectCircle(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        const sumR = this.r + other.r;
        return (dx * dx + dy * dy + dz * dz) < (sumR * sumR);
    }
    intersectCuboid(cuboid) {
        if (cuboid.contains({
            position: {
                x: this.x,
                y: this.y,
                z: this.z
            }
        })) {
            return true;
        }
        const dx = this.x - Math.max(cuboid.x, Math.min(this.x, cuboid.x + cuboid.w));
        const dy = this.y - Math.max(cuboid.y, Math.min(this.y, cuboid.y + cuboid.h));
        const dz = this.z - Math.max(cuboid.z, Math.min(this.z, cuboid.z + cuboid.d));
        return (dx * dx + dy * dy + dz * dz) < (this.r * this.r);
    }
}

export { Cuboid, Sphere };