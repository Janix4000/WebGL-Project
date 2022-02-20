export class Boid {
    random(l, r) {
        return Math.random() * (r - l) + l;
    }

    constructor(model) {
        this.position = model.position;
        this.model = model;
        const maxSpeed = 1;
        this.vel = new THREE.Vector3(this.random(-maxSpeed, maxSpeed), this.random(-maxSpeed, maxSpeed), this.random(-maxSpeed, maxSpeed));
        this.acc = new THREE.Vector3(0, 0, 0);
    }

    getAlignment(neighbors) {
        const avgVelocity = new THREE.Vector3(0, 0, 0);
        for (const other of neighbors) {
            if (other === this) {
                continue;
            }
            avgVelocity.add(other.vel);
        }
        if (neighbors.length - 1 > 0) {
            avgVelocity.divideScalar(neighbors.length - 1);
        }
        return avgVelocity;
    }

    getCohesion(neighbors) {
        const avgPosition = new THREE.Vector3(0, 0, 0);
        for (const other of neighbors) {
            avgPosition.add(other.position);
        }
        if (neighbors.length > 0) {
            avgPosition.divideScalar(neighbors.length);
        }
        return avgPosition.sub(this.position);
    }

    getSeparation(neighbors) {
        const avgDifference = new THREE.Vector3(0, 0, 0);
        for (const other of neighbors) {
            if (other === this) {
                continue;
            }
            avgDifference.add(this.position.clone().sub(other.position));
        }
        if (neighbors.length - 1 > 0) {
            avgDifference.divideScalar(neighbors.length - 1);
        }
        return avgDifference;
    }

    flock(neighbors, alignmentFactor = 1, cohesionFactor = 1, separationFactor = 1) {
        const alignment = this.getAlignment(neighbors).multiplyScalar(alignmentFactor);
        const cohesion = this.getCohesion(neighbors).multiplyScalar(cohesionFactor);
        const separation = this.getSeparation(neighbors).multiplyScalar(separationFactor);

        this.acc.add(alignment.clone().sub(this.vel));
        this.acc.add(cohesion.clone().sub(this.vel));
        this.acc.add(separation.clone().sub(this.vel));
    }

    update(dt) {
        this.vel.add(this.acc.clone().multiplyScalar(dt)).setLength(0.8);
        this.position.add(this.vel.clone().multiplyScalar(dt));
        this.acc.multiplyScalar(0);
    }
}