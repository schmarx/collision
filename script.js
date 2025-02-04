function rad_to_deg(rad) {
    return rad * 180 / Math.PI;
}

class vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class obj {
    /** @type {vec} */
    pos;

    /** @type {vec} */
    vel;

    /** @type {vec} */
    acc;
    constructor(pos, vel, acc, size) {
        this.pos = pos;
        this.vel = vel;
        this.acc = acc;
        this.vel_next = new vec(0, 0);

        this.size = size;
        this.m = Math.PI * (size ** 2);
    }

    dist2(p2) {
        return (this.pos.x - p2.pos.x) ** 2 + (this.pos.y - p2.pos.y) ** 2;
    }
    dist(p2) {
        return Math.sqrt((this.pos.x - p2.pos.x) ** 2 + (this.pos.y - p2.pos.y) ** 2);
    }

    get_vel() {
        return Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2)
    }

    /** implemented from equations found on Wikipedia (https://en.wikipedia.org/wiki/Elastic_collision) */
    collide(p2, p2_vel) {
        let mass = 2 * p2.m / (p2.m + this.m);
        let inner = (this.vel.x - p2_vel.x) * (this.pos.x - p2.pos.x) + (this.vel.y - p2_vel.y) * (this.pos.y - p2.pos.y);
        let norm = (this.pos.x - p2.pos.x) * (this.pos.x - p2.pos.x) + (this.pos.y - p2.pos.y) * (this.pos.y - p2.pos.y);
        let inner_norm = inner / norm;
        let scale = mass * inner_norm;

        this.vel_next.x += scale * (p2.pos.x - this.pos.x);
        this.vel_next.y += scale * (p2.pos.y - this.pos.y);
    }

    collide_vel_broken(v1, t1, m1, v2, t2, m2, phi) {
        let mag_a = v1 * Math.cos(t1 - phi) * (m1 - m2);
        let mag_b = 2 * m2 * v2 * Math.cos(t2 - phi);
        let mag_c = v1 * Math.sin(t1 - phi);

        // console.log(mag_a, mag_b, mag_c, v1, v2, rad_to_deg(t1), rad_to_deg(t2), rad_to_deg(phi));

        this.vel.x = (mag_a + mag_b) * Math.cos(phi) / (m1 + m2) + mag_c * Math.cos(phi + Math.PI / 2);
        this.vel.y = (mag_a + mag_b) * Math.sin(phi) / (m1 + m2) + mag_c * Math.sin(phi + Math.PI / 2);
    }
}

window.onload = e => {
    /** @type {HTMLCanvasElement} */
    let canvas = document.getElementById("canvas");
    let parent = canvas.parentElement;

    let ctx = canvas.getContext("2d");

    // let yWindow = Math.min(parent.clientHeight, parent.clientWidth);
    // let xWindow = yWindow;
    let yWindow = parent.clientHeight;
    let xWindow = parent.clientWidth;

    let fontHeight = 16;
    let fontWidth = fontHeight * 11 / 20;

    canvas.width = xWindow;
    canvas.height = yWindow;

    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.font = "24px sans-serif"

    // ctx.scale(1.75, 1.75);

    // ----- params -----
    let obj_count = 20;
    ctx.fillStyle = "#000000";
    let damping = 1;

    /** @type {obj[]} */
    let objs = [];

    for (let index = 0; index < obj_count; index++) {
        let pos = new vec(Math.random() * xWindow, Math.random() * yWindow);
        let vel = new vec(Math.random() * 1000 - 500, Math.random() * 1000 - 500);
        let acc = new vec(0, 500);

        let size = 80 * (Math.random() + 0.1);
        objs.push(new obj(pos, vel, acc, size));
    }

    let prev_update = 0;
    function run_sim(time) {
        let dt_actual = (time - prev_update) / 1000; // seconds
        let dt = 0.01;

        ctx.clearRect(0, 0, xWindow, yWindow);

        for (let i = 0; i < objs.length; i++) {
            let p = objs[i];

            let vel2 = p.vel.x ** 2 + p.vel.y ** 2;
            vel2 = 500000;
            ctx.fillStyle = `rgba(0, 100, 200, ${vel2 / 500000})`;

            // ----- update -----
            p.pos.x += p.vel.x * dt;
            p.pos.y += p.vel.y * dt;

            p.vel.x += p.acc.x * dt;
            p.vel.y += p.acc.y * dt;

            if (p.pos.x > xWindow - p.size) {
                p.pos.x = xWindow - p.size;
                p.vel.x *= -damping;
            } else if (p.pos.x < p.size) {
                p.pos.x = p.size;
                p.vel.x *= -damping;
            }

            if (p.pos.y > yWindow - p.size) {
                p.pos.y = yWindow - p.size;
                p.vel.y *= -damping;
            } else if (p.pos.y < p.size) {
                p.pos.y = p.size;
                p.vel.y *= -damping;
            }


            p.vel_next.x = p.vel.x;
            p.vel_next.y = p.vel.y;

            // if (Math.abs(p.vel.x) < 0.2) p.vel.x = 0;
            // if (Math.abs(p.vel.y) < 0.2) p.vel.y = 0;

            // ----- draw -----
            ctx.beginPath();
            ctx.ellipse(p.pos.x, p.pos.y, p.size, p.size, 0, 0, 2 * Math.PI);
            // ctx.rect(p.pos.x - p.size, p.pos.y - p.size, p.size * 2, p.size * 2);
            ctx.fill();
        }


        for (let i = 0; i < objs.length; i++) {
            let p1 = objs[i];
            for (let j = i + 1; j < objs.length; j++) {
                let p2 = objs[j];

                let dx = p1.pos.x - p2.pos.x;
                let dy = p1.pos.y - p2.pos.y;

                let d = Math.sqrt(dx ** 2 + dy ** 2);

                let closeness = (p1.size + p2.size) - d;
                if (closeness >= 0) {

                    /* 1D
                    let p1_next_x = (p1.vel.x * (p1.size - p2.size) + p2.vel.x * 2 * p2.size) / (p1.size + p2.size);
                    p2.vel.x = (p2.vel.x * (p2.size - p1.size) + p1.vel.x * 2 * p1.size) / (p1.size + p2.size);

                    p1.vel.x = p1_next_x;
                    */

                    let phi = Math.atan((p1.pos.y - p2.pos.y) / (p1.pos.x - p2.pos.x)) - Math.PI / 2;

                    let v1 = p1.get_vel();
                    let v2 = p2.get_vel();

                    let t1 = 0;
                    let t2 = 0;
                    if (v1 != 0) t1 = Math.acos(p1.vel.x / v1);
                    if (v2 != 0) t2 = Math.acos(p2.vel.x / v2);


                    let p2_vel = new vec(p2.vel.x, p2.vel.y);
                    p2.collide(p1, p1.vel);
                    p1.collide(p2, p2_vel);

                    p1.pos.x += dx * closeness / (2 * d);
                    p2.pos.x -= dx * closeness / (2 * d);

                    p1.pos.y += dy * closeness / (2 * d);
                    p2.pos.y -= dy * closeness / (2 * d);




                    // move the objects away from eachother
                    // if (p2.pos.y > p1.pos.y) p2.pos.y -= closeness;
                    // else p1.pos.y -= closeness;
                    // p2.pos.y += closeness;
                }
            }

            p1.vel.x = p1.vel_next.x;
            p1.vel.y = p1.vel_next.y;
        }

        let ke = 0;
        let mv = 0;
        for (let i = 0; i < objs.length; i++) {
            let p = objs[i];

            ke += 0.5 * p.m * (p.vel.x ** 2 + p.vel.y ** 2);
            mv += p.m * Math.sqrt(p.vel.x ** 2 + p.vel.y ** 2);
        }

        console.log(ke, mv)

        ctx.fillStyle = `#000000`;
        ctx.fillText(`${Math.round(1 / dt_actual)} fps`, xWindow, 0);

        prev_update = time;

        requestAnimationFrame(run_sim);
    }

    requestAnimationFrame(run_sim);
}