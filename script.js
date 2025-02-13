function rad_to_deg(rad) {
    return rad * 180 / Math.PI;
}

class vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

let params = {
    // 0 for perfectly inelastic, 1 for perfectly elastic
    C: 1,
    damping: 0.8,
    obj_count: 1000,
    acc: true
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

    /** 
     * implemented from equations found on Wikipedia (https://en.wikipedia.org/wiki/Inelastic_collision)
     * 
     * @param {obj} p2 
     * @param {vec} p2_vel 
     */
    collide(p2) {
        let dx = this.pos.x - p2.pos.x;
        let dy = this.pos.y - p2.pos.y;
        let d = Math.sqrt(dx ** 2 + dy ** 2);

        let nx = dx / d;
        let ny = dy / d;

        let pre = (1 + params.C) * this.m * p2.m / (this.m + p2.m);

        let Jn = pre * ((p2.vel.x - this.vel.x) * nx + (p2.vel.y - this.vel.y) * ny);

        if (Jn / this.m < 2) return;
        this.vel_next.x += Jn * nx / this.m;
        this.vel_next.y += Jn * ny / this.m;

        p2.vel_next.x -= Jn * nx / p2.m;
        p2.vel_next.y -= Jn * ny / p2.m;
    }
}

function create_range(value, min, max, name, params) {
    let controls = document.getElementById("controls");

    let control = document.createElement("input");
    let label = document.createElement("label");

    control.type = "range";

    control.min = min;
    control.max = max;
    control.step = 0.01;
    control.value = value;

    control.id = name;
    control.name = name;

    label.htmlFor = name;
    label.innerText = name + ` (${value})`;
    params[name] = Number(value);

    control.onchange = e => {
        label.innerText = name + ` (${e.currentTarget.value})`;
        params[name] = Number(e.currentTarget.value);
    }

    controls.appendChild(label);
    controls.appendChild(control);
}

function create_check(value, name, params) {
    let controls = document.getElementById("controls");

    let control = document.createElement("input");
    let label = document.createElement("label");

    control.type = "checkbox";
    control.checked = value;
    control.id = name;
    control.name = name;

    label.htmlFor = name;
    label.innerText = name + ` (${value})`;

    control.onchange = e => {
        label.innerText = name + ` (${e.currentTarget.checked})`;
        params[name] = e.currentTarget.checked;
    }

    controls.appendChild(label);
    controls.appendChild(control);
}

let ctx;
let yWindow;
let xWindow;

let prev_update = 0;

function draw(dt) {
    for (let i = 0; i < objs.length; i++) {
        let p1 = objs[i];

        // ctx.fillStyle = `rgba(0, 100, 200, ${vel2 / 500000})`;
        ctx.fillStyle = `rgba(0, 100, 200, 1)`;

        // ----- update -----
        p1.pos.x += p1.vel.x * dt;
        p1.pos.y += p1.vel.y * dt;

        if (p1.pos.x > xWindow - p1.size) {
            p1.pos.x = xWindow - p1.size;
            p1.vel.x *= -params.damping;
        } else if (p1.pos.x < p1.size) {
            p1.pos.x = p1.size;
            p1.vel.x *= -params.damping;
        } else if (params.acc) p1.vel.x += p1.acc.x * dt;

        if (p1.pos.y > yWindow - p1.size) {
            p1.pos.y = yWindow - p1.size;
            p1.vel.y *= -params.damping;
        } else if (p1.pos.y < p1.size) {
            p1.pos.y = p1.size;
            p1.vel.y *= -params.damping;
        } if (params.acc) p1.vel.y += p1.acc.y * dt;

        // if (Math.abs(p1.vel.x) < 5) p1.vel.x = 0;
        // if (Math.abs(p1.vel.y) < 5) p1.vel.y = 0;


        p1.vel_next.x = p1.vel.x;
        p1.vel_next.y = p1.vel.y;

        // if (Math.abs(p1.vel.x) < 0.2) p1.vel.x = 0;
        // if (Math.abs(p1.vel.y) < 0.2) p1.vel.y = 0;

        // ----- draw -----
        ctx.beginPath();
        ctx.ellipse(p1.pos.x, p1.pos.y, p1.size, p1.size, 0, 0, 2 * Math.PI);
        // ctx.rect(p1.pos.x - p1.size, p1.pos.y - p1.size, p1.size * 2, p1.size * 2);
        ctx.fill();
    }
}

function interactions() {
    for (let i = 0; i < objs.length; i++) {
        let p1 = objs[i];

        for (let j = i + 1; j < objs.length; j++) {
            let p2 = objs[j];

            let dx = p1.pos.x - p2.pos.x;
            let dy = p1.pos.y - p2.pos.y;

            let d = Math.sqrt(dx ** 2 + dy ** 2);

            let closeness = (p1.size + p2.size) - d;
            if (closeness >= 0) {
                p1.collide(p2);

                // move the objects away from eachother

                p1.pos.x += dx * closeness / (2 * d);
                p2.pos.x -= dx * closeness / (2 * d);

                p1.pos.y += dy * closeness / (2 * d);
                p2.pos.y -= dy * closeness / (2 * d);
            }
        }

        p1.vel.x = p1.vel_next.x;
        p1.vel.y = p1.vel_next.y;
    }
}

function run_sim(time) {
    let dt_actual = (time - prev_update) / 1000; // seconds
    let dt = 0.01;

    ctx.clearRect(0, 0, xWindow, yWindow);

    let t0 = Date.now();
    draw(dt);
    let t1 = Date.now();
    interactions();
    let t2 = Date.now();

    console.log(`draw: ${t1 - t0}ms\tcollide: ${t2 - t1}ms`);

    // let ke = 0;
    // let mv = 0;
    // for (let i = 0; i < objs.length; i++) {
    //     let p = objs[i];

    //     ke += 0.5 * p.m * (p.vel.x ** 2 + p.vel.y ** 2);
    //     mv += p.m * Math.sqrt(p.vel.x ** 2 + p.vel.y ** 2);
    // }

    // console.log(ke, mv)

    ctx.fillStyle = `#000000`;
    ctx.fillText(`${Math.round(1 / dt_actual)} fps`, xWindow, 0);

    prev_update = time;

    requestAnimationFrame(run_sim);
}

function init() {
    /** @type {HTMLCanvasElement} */
    let canvas = document.getElementById("canvas");
    let parent = canvas.parentElement;

    ctx = canvas.getContext("2d");

    // let yWindow = Math.min(parent.clientHeight, parent.clientWidth);
    // let xWindow = yWindow;
    yWindow = parent.clientHeight;
    xWindow = parent.clientWidth - 300;

    let fontHeight = 16;
    let fontWidth = fontHeight * 11 / 20;

    canvas.width = xWindow;
    canvas.height = yWindow;

    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.font = "24px sans-serif"

    // ----- params -----
    ctx.fillStyle = "#000000";

    let lookup_size = params.obj_count * (params.obj_count - 1) / 2;

    for (let index = 0; index < params.obj_count; index++) {
        let pos = new vec(Math.random() * xWindow, Math.random() * yWindow);
        let vel = new vec(Math.random() * 1000 - 500, Math.random() * 1000 - 500);
        let acc = new vec(0, 500);

        let size = 80 * (Math.random() + 0.1);
        size = 2;
        objs.push(new obj(pos, vel, acc, size));
    }

    canvas.onclick = e => {
        let pos = new vec(e.clientX, e.clientY);
        let vel = new vec(Math.random() * 1000 - 500, Math.random() * 1000 - 500);
        let acc = new vec(0, 500);

        let size = 80 * (Math.random() + 0.1);
        objs.push(new obj(pos, vel, acc, size));
    }

    // ----- inputs -----
    create_range(0.5, 0, 1, "C", params);
    create_check(true, "acc", params);
}

/** @type {obj[]} */
let objs = [];

window.onload = e => {
    init();
    requestAnimationFrame(run_sim);
}