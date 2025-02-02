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

        this.size = size;
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
    let obj_count = 50;
    ctx.fillStyle = "#000000";
    let damping = 1;

    /** @type {obj[]} */
    let objs = [];

    for (let index = 0; index < obj_count; index++) {
        let pos = new vec(Math.random() * xWindow, Math.random() * yWindow);
        let vel = new vec(Math.random() * 1000 - 500, Math.random() * 1000 - 500);
        let acc = new vec(0, 500);
        // let acc = new vec((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);

        let size = 30 * (Math.random() + 0.1);
        objs.push(new obj(pos, vel, acc, size));
    }


    let prev_update = 0;
    function run_sim(time) {
        requestAnimationFrame(run_sim);

        let dt_actual = (time - prev_update) / 1000; // seconds
        let dt = 0.01;

        ctx.clearRect(0, 0, xWindow, yWindow);

        for (let i = 0; i < objs.length; i++) {
            let p = objs[i];

            vel2 = p.vel.x ** 2 + p.vel.y ** 2;
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

            // if (Math.abs(p.vel.x) < 0.2) p.vel.x = 0;
            // if (Math.abs(p.vel.y) < 0.2) p.vel.y = 0;

            // ----- draw -----
            ctx.beginPath();
            ctx.ellipse(p.pos.x, p.pos.y, p.size, p.size, 0, 0, 2 * Math.PI);
            // ctx.rect(p.pos.x - p.size, p.pos.y - p.size, p.size * 2, p.size * 2);
            ctx.fill();
        }

        ctx.fillStyle = `#000000`;
        ctx.fillText(`${Math.round(1 / dt_actual)} fps`, xWindow, 0);

        prev_update = time;

    }

    requestAnimationFrame(run_sim);
}