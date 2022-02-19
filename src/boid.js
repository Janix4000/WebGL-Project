export class Boid {
    random(l, r) {
        return Math.random() * (r - l) + l;
    }

    constructor(model) {
        this.position = model.position;
        this.model = model;
        const maxSpeed = 0.2;
        this.vel = new THREE.Vector3(this.random(-maxSpeed, maxSpeed), this.random(-maxSpeed, maxSpeed), this.random(-maxSpeed, maxSpeed));
        this.acc = new THREE.Vector3(0, 0, 0);
    }

    align(neighbors) {
        const avgVelocity = new THREE.Vector(0, 0, 0);
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

    flock(neighbors) {
        const alignment = this.align(neighbors);
        this.acc = alignment;
    }

    update(dt) {
        this.vel.add(this.acc.clone().multiplyScalar(dt));
        this.position.add(this.vel.clone().multiplyScalar(dt));
        this.acc.multiplyScalar(0);
    }
}