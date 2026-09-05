import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";

/* ------------------------------------------------------------------ */
/* Book proportions                                                    */
/* ------------------------------------------------------------------ */

const DEG = Math.PI / 180;

/** Each page sits 25° off the viewer-facing plane → ~130° dihedral (open book). */
const OPEN_AZ = 25 * DEG;

const PAGE_W = 0.7; // width of one page, spine → outer edge
const PAGE_H = 1.0; // page height (book height)
const PAGE_T = 0.075; // visible page-stack thickness

const COVER_W = PAGE_W + 0.08; // cover is wider than the pages (reveal)
const COVER_H = PAGE_H + 0.1; // cover pokes above/below the page block
const COVER_T = 0.05; // cover board thickness
const COVER_GAP = 0.004; // gap between page block and cover

const SPINE_W = 0.09;
const SPINE_D = 0.05;
const SPINE_Z = -0.06; // tucked behind the page crease

const BELLY = 0.03; // pages bulge gently toward the viewer
const FAN = 4 * DEG; // pages splay open slightly more toward the top

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

function pageBasis(side: "left" | "right") {
  const sx = side === "left" ? -Math.sin(OPEN_AZ) : Math.sin(OPEN_AZ);
  const e = new THREE.Vector3(sx, 0, Math.cos(OPEN_AZ)); // spine → outer edge
  const up = new THREE.Vector3(0, 1, 0);
  const n = new THREE.Vector3().crossVectors(up, e); // thickness axis (det +1)
  return { e, n };
}

/** Rounded-page cross-section, extruded along the height. */
function roundedSlab(w: number, t: number, h: number, steps: number) {
  const r = t * 0.45;
  const shape = new THREE.Shape();
  shape.moveTo(r, -t / 2);
  shape.lineTo(w - r, -t / 2);
  shape.quadraticCurveTo(w, -t / 2, w, -t / 2 + r);
  shape.lineTo(w, t / 2 - r);
  shape.quadraticCurveTo(w, t / 2, w - r, t / 2);
  shape.lineTo(r, t / 2);
  shape.quadraticCurveTo(0, t / 2, 0, t / 2 - r);
  shape.lineTo(0, -t / 2 + r);
  shape.quadraticCurveTo(0, -t / 2, r, -t / 2);
  return new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 4,
    steps,
  });
}

interface SlabOptions {
  belly: boolean;
  fan: boolean;
}

function buildSlab(
  side: "left" | "right",
  w: number,
  h: number,
  t: number,
  tOffset: number,
  opts: SlabOptions,
) {
  const { e, n } = pageBasis(side);
  const up = new THREE.Vector3(0, 1, 0);
  const basis = new THREE.Matrix4().makeBasis(e, n, up);

  const geo = roundedSlab(w, t, h, 14);
  geo.applyMatrix4(basis);

  // Covers sit on the outside of the page block (mirrored for the left side).
  const dir = side === "left" ? -1 : 1;
  geo.translate(n.x * dir * tOffset, n.y * dir * tOffset, n.z * dir * tOffset);

  // Center the block vertically.
  geo.translate(0, -h / 2, 0);

  // Subtle deformations: belly toward the viewer + splay open toward the top.
  const pos = geo.attributes.position;
  const invSin = 1 / Math.sin(OPEN_AZ);
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i);

    if (opts.belly) {
      const rho = Math.min((Math.abs(x) * invSin) / w, 1);
      z += BELLY * Math.sin(Math.PI * rho);
    }

    if (opts.fan) {
      const ang = (side === "right" ? 1 : -1) * FAN * (y / h + 0.5);
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const nx = x * c + z * s;
      z = -x * s + z * c;
      x = nx;
    }

    pos.setX(i, x);
    pos.setY(i, y);
    pos.setZ(i, z);
  }

  geo.computeVertexNormals();
  return geo;
}

function buildSpine() {
  const geo = new THREE.BoxGeometry(SPINE_W, COVER_H, SPINE_D);
  geo.translate(0, 0, SPINE_Z);
  return geo;
}

/* ------------------------------------------------------------------ */
/* Book                                                                */
/* ------------------------------------------------------------------ */

function OpenBook() {
  const geoms = useMemo(() => {
    const coverOffset = PAGE_T / 2 + COVER_GAP + COVER_T / 2;
    return {
      leftPage: buildSlab("left", PAGE_W, PAGE_H, PAGE_T, 0, {
        belly: true,
        fan: true,
      }),
      rightPage: buildSlab("right", PAGE_W, PAGE_H, PAGE_T, 0, {
        belly: true,
        fan: true,
      }),
      leftCover: buildSlab("left", COVER_W, COVER_H, COVER_T, coverOffset, {
        belly: false,
        fan: false,
      }),
      rightCover: buildSlab("right", COVER_W, COVER_H, COVER_T, coverOffset, {
        belly: false,
        fan: false,
      }),
      spine: buildSpine(),
    };
  }, []);

  const pageMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f3e6d0",
        roughness: 0.96,
        metalness: 0,
      }),
    [],
  );
  const coverMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#7a3d28",
        roughness: 0.62,
        metalness: 0.08,
      }),
    [],
  );

  useEffect(
    () => () => {
      Object.values(geoms).forEach((g) => g.dispose());
      pageMat.dispose();
      coverMat.dispose();
    },
    [geoms, pageMat, coverMat],
  );

  return (
    <group>
      <mesh geometry={geoms.leftPage} material={pageMat} castShadow />
      <mesh geometry={geoms.rightPage} material={pageMat} castShadow />
      <mesh geometry={geoms.leftCover} material={coverMat} castShadow />
      <mesh geometry={geoms.rightCover} material={coverMat} castShadow />
      <mesh geometry={geoms.spine} material={coverMat} castShadow />
    </group>
  );
}

function Sway({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.45) * 0.05;
    }
  });
  return <group ref={ref}>{children}</group>;
}

/** Drag anywhere on the canvas to rotate the book in place. */
function Rig({
  rotation,
  children,
}: {
  rotation: [number, number, number];
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl);
  const state = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    targetX: rotation[0],
    targetY: rotation[1],
  });

  useEffect(() => {
    const dom = gl.domElement;
    const onPointerDown = (e: PointerEvent) => {
      state.current.active = true;
      state.current.lastX = e.clientX;
      state.current.lastY = e.clientY;
      dom.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      const s = state.current;
      if (!s.active) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.targetY -= dx * 0.01;
      s.targetX = Math.min(0.95, Math.max(0.05, s.targetX + dy * 0.012));
    };
    const onPointerUp = () => {
      state.current.active = false;
      dom.style.cursor = "";
    };
    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const s = state.current;
    const k = 1 - Math.pow(0.0001, delta);
    ref.current.rotation.x += (s.targetX - ref.current.rotation.x) * k;
    ref.current.rotation.y += (s.targetY - ref.current.rotation.y) * k;
  });

  return (
    <group ref={ref} rotation={rotation}>
      {children}
    </group>
  );
}

/* Responsive scale: keep the book filling a strong portion on any screen. */
function useFitScale() {
  const viewport = useThree((s) => s.viewport);
  return useMemo(() => {
    const compact = viewport.width < 4.2;
    const s = Math.min(
      viewport.width / (compact ? 3.1 : 2.4),
      viewport.height / (compact ? 2.2 : 1.6),
    );
    return Math.max(0.55, Math.min(compact ? 0.9 : 1.15, s));
  }, [viewport.width, viewport.height]);
}

function Scene() {
  const fit = useFitScale();

  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#fff4e0", "#2b3e5c", 0.5]} />
      <directionalLight
        position={[2.4, 3.4, 2.6]}
        intensity={1.6}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-bias={-0.0002}
      />
      <directionalLight
        position={[-2.6, 1.1, 1.8]}
        intensity={0.45}
        color="#e9d5b1"
      />
      <pointLight
        position={[0, -0.4, -2]}
        intensity={0.55}
        color="#c79b4b"
        distance={9}
      />

      <group position={[0, 0.1, 0]} scale={fit}>
        <Rig rotation={[0.32, -0.14, 0]}>
          <Float
            speed={1.1}
            rotationIntensity={0.1}
            floatIntensity={0.4}
            floatingRange={[-0.1, 0.1]}
          >
            <Sway>
              <OpenBook />
            </Sway>
          </Float>
          <Sparkles
            count={36}
            scale={[2.7, 1.9, 2.7]}
            size={2.1}
            speed={0.32}
            color="#c79b4b"
            opacity={0.5}
          />
        </Rig>
      </group>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.72, 0]}
        receiveShadow
      >
        <planeGeometry args={[6, 6]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* WebGL fallback                                                      */
/* ------------------------------------------------------------------ */

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function FallbackPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden>
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-brand-500/25 to-sky-400/25 blur-2xl" />
        <div className="relative flex size-44 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-2 shadow-2xl">
          <span className="font-display text-7xl text-gradient">✶</span>
        </div>
      </div>
    </div>
  );
}

export default function Hero3D() {
  const webglAvailable = useMemo(() => supportsWebGL(), []);

  if (!webglAvailable) {
    return <FallbackPreview />;
  }

  return (
    <div
      className="relative h-full w-full cursor-grab touch-none active:cursor-grabbing"
      aria-hidden
    >
      <Canvas
        className="h-full w-full"
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0.2, 3.6], fov: 38 }}
        style={{ width: "100%", height: "100%", display: "block" }}
        fallback={<FallbackPreview />}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
