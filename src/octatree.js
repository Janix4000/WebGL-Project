class OctaTree {
    constructor(region, nMaxPoints, nMaxLevels) {
        this.root = OctaTreeSegment(region, nMaxPoints, nMaxLevels);
        this.helperBorder = new THREE.Group();
        this.helperBorder.position.set(
            region.x,
            region.y,
            region.z
        );
    }

    insert(point) {
        const res = this.root.insert(point);
        if (res === false) {
            return false;
        }
        if (res !== null) {
            this._addSubPartitions(res);
        }
        return true;
    }

    clear() {
        this.root.clear();
        this.helperBorder.clear();
    }

    query(range, points) {
        return this.root.query(range, points);
    }

    _addSubPartitions(partitions) {
        for (const partition of partitions) {
            this._addSubRegion(partition.region);
        }
    }

    _addSubRegion(region) {
        const geometry = new THREE.BoxGeometry(region.w, region.h, region.d);
        const material = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
        const cuboid = new THREE.Mesh(geometry, material);

        cuboid.position.set(region.x, region.y, region.z);

        const geo = new THREE.EdgesGeometry(geometry);
        const mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 4 });
        const wireFrame = new THREE.LineSegments(geo, mat);
        wireFrame.renderOrder = 1;
        cuboid.add(wireFrame);

        this.helperBorder.add(cuboid);
    }
}


class OctaTreeSegment {
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

        let res = null;
        if (this.splitted) {
            res = this._insertToSubTrees(point);
        } else {
            this.points.push(point);
            if (this.points.length > this.nMaxPoints && this._canBeSplitted()) {
                res = this._split();
            }
        }
        this.size++;
        return res;
    }

    _canBeSplitted() {
        return this.nMaxLevels > 0;
    }

    _insertToSubTrees(point) {
        for (const subTree of this.subTrees) {
            const res = subTree.insert(point);
            if (res !== false) {
                return res;
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

        for (const [ws, hs, ds] of shifts) {
            const partitionCube = new Cuboid(x + ws, y + hs, z + ds);
            this.subTrees.push(new OctaTreeSegment(partitionCube, this.nMaxPoints, this.nMaxLevels - 1));
        }
    }

    _split() {
        this._createSubTrees();

        while (this.points.length > 0) {
            const point = this.points.pop();
            this._insertToSubTrees(point);
        }

        this.splitted = true;
        return this.subTrees;
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