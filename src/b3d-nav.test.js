import assert from "node:assert/strict";
import test from "node:test";
import { attachBlenderNav, orbitOffset } from "./b3d-nav.js";

test("órbita no polo fica em cima do alvo", () => {
    const offset = orbitOffset(0, 0, 5);
    assert.ok(Math.abs(offset.x) < 1e-9);
    assert.ok(Math.abs(offset.z) < 1e-9);
    assert.equal(offset.y, 5);
});

function fakeDom() {
    const listeners = new Map();
    return {
        addEventListener(type, fn) {
            const list = listeners.get(type) ?? [];
            list.push(fn);
            listeners.set(type, list);
        },
        removeEventListener() {},
        setPointerCapture() {},
        fire(type, event) {
            for (const fn of listeners.get(type) ?? []) fn(event);
        },
    };
}

function fakeCamera() {
    return {
        position: {
            x: 0,
            y: 2,
            z: 6,
            set(x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            },
        },
        up: { x: 0, y: 1, z: 0 },
        lookAt() {},
    };
}

test("soltar um dedo do pinça não pula a câmera", () => {
    const dom = fakeDom();
    const camera = fakeCamera();
    attachBlenderNav(camera, dom, { target: { x: 0, y: 0, z: 0 } });
    const before = { ...camera.position };
    dom.fire("pointerdown", { pointerId: 1, button: 0, clientX: 0, clientY: 0, shiftKey: false });
    dom.fire("pointerdown", { pointerId: 2, button: 0, clientX: 80, clientY: 0, shiftKey: false });
    dom.fire("pointerup", { pointerId: 2 });
    dom.fire("pointermove", { pointerId: 1, clientX: 2, clientY: 1, shiftKey: false });
    const jumped = Math.hypot(camera.position.x - before.x, camera.position.y - before.y, camera.position.z - before.z);
    assert.ok(jumped < 1.5, `câmera pulou ${jumped}`);
});
