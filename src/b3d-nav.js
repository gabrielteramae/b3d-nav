export function orbitOffset(theta, phi, radius) {
    const sinPhi = Math.sin(phi);
    return {
        x: radius * sinPhi * Math.sin(theta),
        y: radius * Math.cos(phi),
        z: radius * sinPhi * Math.cos(theta),
    };
}
export function attachBlenderNav(camera, dom, options) {
    const target = options?.target ?? { x: 0, y: 0.6, z: 0 };
    let theta = 0.8;
    let phi = 1.05;
    let radius = 6;
    const pointers = new Map();
    let mode = "orbit";
    let lastX = 0;
    let lastY = 0;
    let pinchDist = 0;
    function clampRadius(value) {
        return Math.min(40, Math.max(1.15, value));
    }
    function apply() {
        const offset = orbitOffset(theta, phi, radius);
        camera.position.set(target.x + offset.x, target.y + offset.y, target.z + offset.z);
        camera.lookAt(target.x, target.y, target.z);
    }
    function syncFromCamera() {
        const dx = camera.position.x - target.x;
        const dy = camera.position.y - target.y;
        const dz = camera.position.z - target.z;
        radius = clampRadius(Math.hypot(dx, dy, dz));
        theta = Math.atan2(dx, dz);
        phi = Math.acos(Math.min(1, Math.max(-1, dy / radius)));
    }
    function orbit(dx, dy) {
        theta -= dx * 0.008;
        phi = Math.min(Math.PI - 0.08, Math.max(0.08, phi + dy * 0.008));
        apply();
    }
    function pan(dx, dy) {
        const fx = target.x - camera.position.x;
        const fy = target.y - camera.position.y;
        const fz = target.z - camera.position.z;
        const fl = Math.hypot(fx, fy, fz) || 1;
        const fnx = fx / fl;
        const fny = fy / fl;
        const fnz = fz / fl;
        const upx = camera.up?.x ?? 0;
        const upy = camera.up?.y ?? 1;
        const upz = camera.up?.z ?? 0;
        let rx = fny * upz - fnz * upy;
        let ry = fnz * upx - fnx * upz;
        let rz = fnx * upy - fny * upx;
        const rl = Math.hypot(rx, ry, rz) || 1;
        rx /= rl;
        ry /= rl;
        rz /= rl;
        const ux = ry * fnz - rz * fny;
        const uy = rz * fnx - rx * fnz;
        const uz = rx * fny - ry * fnx;
        const scale = radius * 0.0022;
        target.x += (-dx * rx + dy * ux) * scale;
        target.y += (-dx * ry + dy * uy) * scale;
        target.z += (-dx * rz + dy * uz) * scale;
        apply();
    }
    function centroid() {
        let x = 0;
        let y = 0;
        for (const point of pointers.values()) {
            x += point.x;
            y += point.y;
        }
        const count = pointers.size || 1;
        return { x: x / count, y: y / count };
    }
    function onDown(event) {
        if (event.button === 2)
            return;
        dom.setPointerCapture(event.pointerId);
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size >= 2) {
            const [a, b] = [...pointers.values()];
            pinchDist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
            const center = centroid();
            lastX = center.x;
            lastY = center.y;
            return;
        }
        mode = event.shiftKey ? "pan" : "orbit";
        lastX = event.clientX;
        lastY = event.clientY;
    }
    function onMove(event) {
        const current = pointers.get(event.pointerId);
        if (!current)
            return;
        current.x = event.clientX;
        current.y = event.clientY;
        if (pointers.size >= 2) {
            const [a, b] = [...pointers.values()];
            const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
            radius = clampRadius(radius * (pinchDist / dist));
            pinchDist = dist;
            const center = centroid();
            pan(center.x - lastX, center.y - lastY);
            lastX = center.x;
            lastY = center.y;
            return;
        }
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        if (mode === "pan" || event.shiftKey)
            pan(dx, dy);
        else
            orbit(dx, dy);
    }
    function onUp(event) {
        pointers.delete(event.pointerId);
    }
    function onWheel(event) {
        event.preventDefault();
        radius = clampRadius(radius * Math.exp(event.deltaY * 0.0011));
        apply();
    }
    function onContext(event) {
        event.preventDefault();
    }
    function onKey(event) {
        const tag = event.target?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")
            return;
        const views = {
            Digit1: "front",
            Digit3: "right",
            Digit7: "top",
            Digit9: "back",
        };
        const view = views[event.code];
        if (!view)
            return;
        event.preventDefault();
        setView(view);
    }
    function setView(name) {
        if (name === "front") {
            theta = 0;
            phi = Math.PI / 2;
        }
        else if (name === "back") {
            theta = Math.PI;
            phi = Math.PI / 2;
        }
        else if (name === "right") {
            theta = Math.PI / 2;
            phi = Math.PI / 2;
        }
        else {
            phi = 0.12;
        }
        apply();
    }
    syncFromCamera();
    apply();
    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerup", onUp);
    dom.addEventListener("pointercancel", onUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("contextmenu", onContext);
    window.addEventListener("keydown", onKey);
    return {
        target,
        setView,
        dispose() {
            dom.removeEventListener("pointerdown", onDown);
            dom.removeEventListener("pointermove", onMove);
            dom.removeEventListener("pointerup", onUp);
            dom.removeEventListener("pointercancel", onUp);
            dom.removeEventListener("wheel", onWheel);
            dom.removeEventListener("contextmenu", onContext);
            window.removeEventListener("keydown", onKey);
        },
    };
}
