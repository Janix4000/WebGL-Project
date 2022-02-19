class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point) {
        return (
            (point.x <= this.x + this.w) &&
            (point.x >= this.x) &&
            (point.y <= this.y + this.h) &&
            (point.y >= this.y)
        );
    }

    intersectRect(other) {
        return !(
            this.x > other.x + other.w ||
            this.x + this.w < other.x ||
            this.y > other.y + other.h ||
            this.y + this.h < other.y
        );
    }
}

class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    contains(point) {
        const dx = this.x - point.x;
        const dy = this.y - point.y;
        return (dx * dx + dy * dy) < (this.r * this.r);
    }

    intersectCircle(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const sumR = this.r + other.r;
        return (dx * dx + dy * dy) < (sumR * sumR);
    }
    intersectRect(rect) {
        if (rect.contains({
            x: this.x,
            y: this.y
        })) {
            return true;
        }
        const dx = this.x - max(rect.x, min(this.x, rect.x + rect.w));
        const dy = this.y - max(rect.y, min(this.y, rect.y + rect.h));
        return (dx * dx + dy * dy) < (this.r * this.r);
    }
}

class QuadTree {
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

        this.splited = false;
        this.size = 0;
    }

    insert(point) {
        if (!this.region.contains(point)) {
            return false;
        }

        if (this.splited) {
            this._insertToSubTrees(point);
        } else {
            this.points.push(point);
            if (this.points.length > this.nMaxPoints && this._canBeSplited()) {
                this._split();
            }
        }
        this.size++;
        return true;
    }

    _canBeSplited() {
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
        const w = this.region.w / 2;
        const h = this.region.h / 2;

        let nw = new Rectangle(x, y, w, h);
        let ne = new Rectangle(x + w, y, w, h);
        let sw = new Rectangle(x, y + h, w, h);
        let se = new Rectangle(x + w, y + h, w, h);

        this.subTrees.push(new QuadTree(nw, this.nMaxPoints, this.nMaxLevels - 1));
        this.subTrees.push(new QuadTree(ne, this.nMaxPoints, this.nMaxLevels - 1));
        this.subTrees.push(new QuadTree(sw, this.nMaxPoints, this.nMaxLevels - 1));
        this.subTrees.push(new QuadTree(se, this.nMaxPoints, this.nMaxLevels - 1));
    }

    _split() {
        this._createSubTrees();

        while (this.points.length > 0) {
            const point = this.points.pop();
            this._insertToSubTrees(point);
        }

        this.splited = true;
    }

    clear() {
        this.points = [];
        this.subTrees = [];

        this.splited = false;
        this.size = 0;
    }

    queery(range, points) {
        if (!points) {
            points = [];
        }
        if (range.intersectRect(this.region)) {
            if (this.splited) {
                for (const subTree of this.subTrees) {
                    subTree.queery(range, points);
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