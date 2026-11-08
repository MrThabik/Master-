"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Site } from "@/lib/supabase";

// Rotating 3D ring of site cards. Drag to spin, click a card to open it.
export default function Carousel3D({ sites, height }: { sites: Site[]; height: number }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el || !sites.length) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    const dom = renderer.domElement;
    dom.style.touchAction = "pan-y";

    const scene = new THREE.Scene();
    const css = getComputedStyle(document.documentElement);
    const GOLD = css.getPropertyValue("--gold").trim() || "#d4af37";
    const BG = css.getPropertyValue("--bg").trim() || "#0b1a14";
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
    const n = sites.length;
    const R = Math.max(2.2, n * 0.5);
    // phones are narrow: step back and widen the view so cards are not cut off
    const fit = () => {
      const narrow = el.clientWidth / el.clientHeight < 1.2;
      camera.fov = narrow ? 62 : 45;
      camera.position.set(0, 0.4, R + (narrow ? 3.6 : 3.2));
      camera.lookAt(0, 0, 0);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    };
    fit();
    const ring = new THREE.Group();
    scene.add(ring);

    const meshes: THREE.Mesh[] = [];
    const textures: THREE.Texture[] = [];
    sites.forEach((s, k) => {
      const c = document.createElement("canvas");
      c.width = 640; c.height = 400;
      const g = c.getContext("2d")!;
      const draw = (img?: HTMLImageElement) => {
        g.fillStyle = BG; g.fillRect(0, 0, 640, 400);
        if (img) {
          const r = Math.max(640 / img.width, 300 / img.height);
          g.save(); g.beginPath(); g.rect(0, 0, 640, 300); g.clip();
          g.drawImage(img, (640 - img.width * r) / 2, (300 - img.height * r) / 2, img.width * r, img.height * r);
          g.restore();
        }
        g.fillStyle = BG; g.fillRect(0, 300, 640, 100);
        g.fillStyle = GOLD; g.font = "600 34px Georgia, serif"; g.textAlign = "center";
        g.fillText(s.name.slice(0, 32), 320, 360);
        g.strokeStyle = GOLD; g.lineWidth = 6; g.strokeRect(3, 3, 634, 394);
      };
      draw();
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      textures.push(t);
      if (s.screenshot_url) {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => { draw(im); t.needsUpdate = true; };
        im.src = s.screenshot_url;
      }
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.125), new THREE.MeshBasicMaterial({ map: t }));
      const a = (k / n) * Math.PI * 2;
      m.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
      m.rotation.y = a;
      m.userData.url = s.url;
      ring.add(m);
      meshes.push(m);
    });

    let drag = false, lx = 0, moved = 0, raf = 0;
    const ray = new THREE.Raycaster();
    const down = (e: PointerEvent) => { drag = true; lx = e.clientX; moved = 0; };
    const move = (e: PointerEvent) => { if (!drag) return; const dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx); ring.rotation.y += dx * 0.006; };
    const up = (e: PointerEvent) => {
      drag = false;
      if (moved > 5) return;
      const r = dom.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const hit = ray.intersectObjects(meshes)[0];
      if (hit) window.open(hit.object.userData.url, "_blank", "noopener");
    };
    dom.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    const loop = () => { if (!drag) ring.rotation.y += 0.004; renderer.render(scene, camera); raf = requestAnimationFrame(loop); };
    loop();
    const ro = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      fit();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      dom.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      meshes.forEach((m) => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      dom.remove();
    };
  }, [sites]);

  return <div ref={mount} className="mx-auto mb-10 w-full max-w-5xl cursor-grab active:cursor-grabbing" style={{ height }} aria-label="Rotating cards of my websites" />;
}
