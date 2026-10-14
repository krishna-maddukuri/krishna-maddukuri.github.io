import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'

/**
 * His paper-craft figure, in pieces. The picture is cut into ~450 shards that follow the
 * paper's own facets (big ones on the body, small ones on the face). On load they glide in
 * from all around and lock together; afterwards the figure breathes, the shards under the
 * cursor lift out of its way, and a click blows the whole figure apart, far and wide, before
 * it settles back together.
 *
 * Rendered with WebGL2 in one draw call; everything per-shard happens in the vertex shader.
 * Without WebGL, or with "reduce motion" on, the plain cut-out is shown instead.
 */

/** Texture pixels: the cut-out's size (the picture upscaled 4x). */
const TEX_W = 1383
const TEX_H = 3830
/** Distances below were tuned on a 691px-wide picture; this scales them to the texture in use. */
const UNIT = TEX_W / 691

/** The canvas is much bigger than the figure so the shards have room to fly. */
const PAD_X = 1.3 // of the figure's width, each side (more on wide screens, where the scatter reaches farther)
const PAD_TOP = 0.45 // of the figure's height
/**
 * How far a click sends the shards, as a multiple of the distances in buildGeometry: 1 on a phone,
 * where the scatter already fills the screen, up to REACH_WIDE on wide screens, where there is open
 * space around him to use.
 */
const REACH_WIDE = 1.3

/** Timing (seconds). */
const GLIDE = 1.7 // one shard's journey into place
const STAGGER = 0.35 // the last shard starts this much after the first
const BUILD_DELAY = 0.4 // after the figure is ready, so it lands with the rest of the hero
const SCATTER_HOLD = 3 // a click scatters him for this long, then he comes back

type MeshData = { w: number; h: number; p: number[]; z: number[]; t: number[] }
type State = 'loading' | 'building' | 'ready' | 'scattered' | 'fallback'

const VERT = /* glsl */ `#version 300 es
precision highp float;
in vec3 a_pos;      // model space: x from the body's centre line, y up from the feet, z towards the viewer
in vec2 a_uv;
in vec2 a_center;   // the shard's centre
in vec4 a_start;    // where it glides in from (xy), its starting spin, its start delay
in vec4 a_scatter;  // where a click sends it (xy), its spin there, its depth while loose
uniform vec2 u_center;   // model-space point at the middle of the canvas
uniform vec2 u_scale;    // model px → clip space
uniform float u_time;    // seconds since the build started
uniform float u_scatter; // 0 together … 1 scattered (eased)
uniform float u_reach;   // how far the scatter goes on this screen (1 on phones, more on wide screens)
uniform float u_breath;  // -1..1
uniform vec3 u_pointer;  // model-space pointer and its strength (0..1)
out vec2 v_uv;
out float v_shade;
out float v_alpha;

const float GLIDE = ${GLIDE.toFixed(2)};
const float CAM = ${(5200 * UNIT).toFixed(1)};
const float U = ${UNIT.toFixed(4)};

mat2 spin(float r) { float c = cos(r), s = sin(r); return mat2(c, s, -s, c); }

void main() {
  float t = clamp((u_time - a_start.w) / GLIDE, 0.0, 1.0);
  // slow start, fast middle, soft landing
  float e = t < 0.5 ? 8.0 * t * t * t * t : 1.0 - 8.0 * pow(1.0 - t, 4.0);
  float loose = max(1.0 - e, u_scatter);

  vec2 c = a_center;
  // the shards under the pointer drift out of its way
  vec2 away = c - u_pointer.xy;
  float d = length(away);
  float push = smoothstep(230.0 * U, 30.0 * U, d) * u_pointer.z;
  vec2 pushOff = (d > 1.0 ? away / d : vec2(0.0, 1.0)) * push * 18.0 * U;
  // where the shard is right now: gliding in, scattered by a click, nudged by the pointer, drifting a touch
  float phase = a_start.w * 17.0 + a_scatter.w;
  vec2 drift = vec2(sin(u_time * 0.8 + phase), cos(u_time * 0.63 + phase * 1.3)) * 12.0 * U * u_scatter; // only while loose: at rest the shards must meet exactly
  vec2 off = a_start.xy * (1.0 - e) + a_scatter.xy * u_reach * u_scatter + pushOff + drift;
  float ang = a_start.z * (1.0 - e) + a_scatter.z * u_scatter + push * 0.06 * sign(a_scatter.z) + sin(u_time * 0.7 + phase) * 0.05 * u_scatter;
  vec3 p = a_pos;
  // the lifted shards grow a touch, so they overlap their neighbours instead of leaving gaps
  p.xy = c + spin(ang) * (p.xy - c) * (1.0 + 0.05 * push) + off;
  p.z += 30.0 * U * push;
  p.z += a_scatter.w * loose; // loose shards sit at their own depth, so they overlap consistently

  // alive: breathing (the feet stay put)
  p.y *= 1.0 + 0.004 * u_breath;
  p.x += u_breath * 1.2 * U * (p.y / ${TEX_H.toFixed(1)});

  // loose paper catches a little more light
  v_shade = 1.0 + 0.06 * loose + 0.04 * push;
  v_alpha = smoothstep(0.0, 0.18, t);
  v_uv = a_uv;

  float persp = CAM / (CAM - p.z);
  vec2 s = (p.xy - u_center) * persp * u_scale;
  gl_Position = vec4(s, -p.z / (4000.0 * U), 1.0);
}`

const FRAG = /* glsl */ `#version 300 es
precision mediump float;
uniform sampler2D u_tex;
in vec2 v_uv;
in float v_shade;
in float v_alpha;
out vec4 o;
void main() {
  vec4 c = texture(u_tex, v_uv, -0.4); // premultiplied; a touch below the mip the size calls for keeps the creases crisp
  o = vec4(min(c.rgb * v_shade, vec3(c.a)), c.a) * v_alpha;
}`

export function PaperFigure({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<State>('loading')
  const [hint, setHint] = useState(false) // phones: a one-time "tap to scatter" after he is together
  const toggleRef = useRef<() => void>(() => {})
  const labelRef = useRef<HTMLDivElement>(null)
  const cursor = useRef({ x: 0, y: 0, tx: 0, ty: 0, on: false })
  const { image } = site.hero

  useEffect(() => {
    if (reduce) return
    const canvas = canvasRef.current
    const box = boxRef.current
    if (!canvas || !box) return
    let disposed = false
    let raf = 0
    let cleanup = () => {}
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
      // tests read the pixels back
      preserveDrawingBuffer: navigator.webdriver === true,
    })
    if (!gl) {
      setState('fallback')
      return
    }

    const fail = () => {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(raf)
      setState('fallback')
    }

    // --- load the mesh and the picture --------------------------------------------------
    const img = new Image()
    img.decoding = 'async'
    const texReady = new Promise<HTMLImageElement>((ok, bad) => {
      img.onload = () => ok(img)
      img.onerror = () => bad(new Error('texture'))
    })
    img.src = image
    const meshReady = fetch('avatar/krishna-origami.json').then((r) => {
      if (!r.ok) throw new Error('mesh')
      return r.json() as Promise<MeshData>
    })
    Promise.all([texReady, meshReady])
      .then(([pic, mesh]) => {
        if (!disposed) start(pic, mesh)
      })
      .catch(fail)

    // --- everything below runs once the data is in ----------------------------------------
    function start(pic: HTMLImageElement, mesh: MeshData) {
      if (!gl) return
      const prog = program(gl, VERT, FRAG)
      if (!prog) return fail()
      gl.useProgram(prog)

      // geometry: three vertices per shard so each shard can move on its own
      const geo = buildGeometry(mesh)
      gl.bindVertexArray(gl.createVertexArray())
      const attr = (name: string, data: Float32Array, size: number) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
        const loc = gl.getAttribLocation(prog, name)
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
      }
      attr('a_pos', geo.pos, 3)
      attr('a_uv', geo.uv, 2)
      attr('a_center', geo.center, 2)
      attr('a_start', geo.start, 4)
      attr('a_scatter', geo.scatter, 4)

      // the picture, premultiplied, with mipmaps for the small sizes
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pic)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      const aniso = gl.getExtension('EXT_texture_filter_anisotropic')
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))
      gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0)

      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.clearColor(0, 0, 0, 0)

      const U = {
        center: gl.getUniformLocation(prog, 'u_center'),
        scale: gl.getUniformLocation(prog, 'u_scale'),
        time: gl.getUniformLocation(prog, 'u_time'),
        scatter: gl.getUniformLocation(prog, 'u_scatter'),
        reach: gl.getUniformLocation(prog, 'u_reach'),
        breath: gl.getUniformLocation(prog, 'u_breath'),
        pointer: gl.getUniformLocation(prog, 'u_pointer'),
      }

      // --- size: the canvas covers the figure plus room around it -----------------------
      let scaleModel = 1 // CSS px per model px
      const resize = () => {
        const r = box!.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return
        // (test runners draw WebGL in software: one pixel per CSS pixel is plenty there)
        const dpr = navigator.webdriver ? 1 : Math.min(window.devicePixelRatio || 1, 3)
        // the room around him: a phone is ~2.3 figure-widths wide, a laptop ~4.6; the scatter and the
        // canvas grow with it
        const room = window.innerWidth / r.width
        const reach = 1 + (REACH_WIDE - 1) * Math.min(1, Math.max(0, (room - 2.6) / 2))
        gl.uniform1f(U.reach, reach)
        const w = r.width * (1 + 2 * (PAD_X + (reach - 1) * 1.7))
        const h = r.height * (1 + PAD_TOP + (reach - 1) * 0.5)
        canvas!.style.width = `${w}px`
        canvas!.style.height = `${h}px`
        const pw = Math.round(w * dpr)
        const ph = Math.round(h * dpr)
        if (canvas!.width !== pw || canvas!.height !== ph) {
          canvas!.width = pw
          canvas!.height = ph
        }
        gl.viewport(0, 0, pw, ph)
        scaleModel = r.height / TEX_H
        // model space: x from the centre line, y up from the picture's bottom edge
        const mw = w / scaleModel
        const mh = h / scaleModel
        gl.uniform2f(U.center, 0, mh / 2)
        gl.uniform2f(U.scale, 2 / mw, 2 / mh)
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(box!)

      // --- the pointer: which shards move aside -------------------------------------------
      const ptr = { x: 0, y: 0, k: 0, tx: 0, ty: 0, tk: 0 }
      let lastPointer = 0
      const onMove = (e: PointerEvent) => {
        if (e.pointerType && e.pointerType !== 'mouse') return
        const r = box!.getBoundingClientRect()
        // model-space pointer for the shards
        cursor.current.tx = e.clientX - r.left
        cursor.current.ty = e.clientY - r.top
        const mx = (e.clientX - r.left) / scaleModel - TEX_W / 2
        const my = TEX_H - (e.clientY - r.top) / scaleModel
        ptr.tx = mx
        ptr.ty = my
        ptr.tk = mx > -TEX_W * 0.8 && mx < TEX_W * 0.8 && my > -80 * UNIT && my < TEX_H + 120 * UNIT ? 1 : 0
        lastPointer = performance.now()
      }
      const onLeave = () => {
        ptr.tk = 0
        cursor.current.on = false
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('mouseleave', onLeave)
      window.addEventListener('blur', onLeave)

      // --- run ------------------------------------------------------------------------------
      let visible = true
      const io = new IntersectionObserver(([en]) => {
        visible = en.isIntersecting
        if (visible) schedule()
      })
      io.observe(box!)

      let t0 = performance.now() + BUILD_DELAY * 1000
      let last = performance.now()
      let built = false
      let frames = 0
      const coarse = window.matchMedia('(pointer: coarse)').matches
      const scatter = { v: 0, target: 0, until: 0 }
      setState('building')
      toggleRef.current = () => {
        const now = performance.now()
        if (scatter.target === 0) {
          scatter.target = 1
          scatter.until = now + SCATTER_HOLD * 1000
          setState('scattered')
        } else {
          scatter.target = 0
          setState(built ? 'ready' : 'building')
        }
        lastPointer = now
        schedule()
      }

      const frame = (now: number) => {
        raf = 0
        if (disposed) return
        // once he is built and nobody is pointing, half the frames are plenty for breathing
        // (test runners draw in software and share the machine: they always get half)
        frames++
        const busy = scatter.v > 0.001 || scatter.target > 0 || now - lastPointer < 2500
        if ((navigator.webdriver || (built && !busy)) && frames % 2 === 1) {
          if (visible && !document.hidden) schedule()
          return
        }
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        const time = (now - t0) / 1000
        if (!built && time > STAGGER + GLIDE + 0.1) {
          built = true
          if (scatter.target === 0) setState('ready')
          if (coarse) setHint(true)
        }
        // the label beside the pointer follows it with a little lag
        const lbl = cursor.current
        const label = labelRef.current
        if (label) {
          const kl = 1 - Math.pow(0.0005, dt)
          lbl.x += (lbl.tx - lbl.x) * kl
          lbl.y += (lbl.ty - lbl.y) * kl
          label.style.transform = `translate(${lbl.x + 18}px, ${lbl.y + 22}px)`
          label.dataset.on = lbl.on && built ? '1' : '0'
        }
        if (scatter.target === 1 && now > scatter.until) {
          scatter.target = 0
          setState(built ? 'ready' : 'building')
        }
        // scattering is quick, coming back is unhurried
        const ks = 1 - Math.pow(scatter.target === 1 ? 0.004 : 0.03, dt)
        scatter.v += (scatter.target - scatter.v) * ks
        // the pointer eases towards where it is
        const k = 1 - Math.pow(0.0008, dt)
        const kp = 1 - Math.pow(0.00005, dt)
        ptr.x += (ptr.tx - ptr.x) * kp
        ptr.y += (ptr.ty - ptr.y) * kp
        ptr.k += (ptr.tk - ptr.k) * k
        const breath = Math.sin(now / 1900)

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.uniform1f(U.time, time)
        gl.uniform1f(U.scatter, scatter.v)
        gl.uniform1f(U.breath, breath)
        gl.uniform3f(U.pointer, ptr.x, ptr.y, built ? ptr.k : 0)
        gl.drawArrays(gl.TRIANGLES, 0, geo.count)
        if (visible && !document.hidden) schedule()
      }
      const schedule = () => {
        if (!raf && !disposed) raf = requestAnimationFrame(frame)
      }
      const onVisibility = () => {
        if (!document.hidden) {
          last = performance.now()
          schedule()
        }
      }
      document.addEventListener('visibilitychange', onVisibility)
      canvas!.addEventListener('webglcontextlost', fail)
      schedule()

      cleanup = () => {
        ro.disconnect()
        io.disconnect()
        window.removeEventListener('pointermove', onMove)
        document.removeEventListener('mouseleave', onLeave)
        window.removeEventListener('blur', onLeave)
        document.removeEventListener('visibilitychange', onVisibility)
        canvas!.removeEventListener('webglcontextlost', fail)
      }
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      cleanup()
    }
  }, [reduce, image])

  const still = reduce || state === 'fallback'
  return (
    <div
      ref={boxRef}
      data-paper-figure={still ? 'still' : state}
      className={`relative h-full ${className}`}
      style={{ aspectRatio: `${TEX_W} / ${TEX_H}` }}
    >
      {still ? (
        <img
          src={image}
          alt={site.name}
          decoding="async"
          fetchPriority="high"
          draggable={false}
          className="block h-full w-full select-none object-contain object-bottom"
        />
      ) : (
        <>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={site.name}
            className="pointer-events-none absolute bottom-0 left-1/2 block max-w-none -translate-x-1/2"
          />
          <button
            type="button"
            aria-label={state === 'scattered' ? 'Put the paper figure back together' : 'Scatter the paper figure'}
            aria-pressed={state === 'scattered'}
            onClick={() => toggleRef.current()}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') cursor.current.on = true
            }}
            onPointerLeave={() => {
              cursor.current.on = false
            }}
            className="absolute inset-0 cursor-pointer rounded-[40%] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-ink/60"
          />
          {/* the hint beside the pointer (mouse) … */}
          <div
            ref={labelRef}
            aria-hidden
            data-on="0"
            className="cursor-label pointer-events-none absolute left-0 top-0 z-30 flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-paper shadow-lg"
          >
            <span className={`size-1.5 rounded-full ${state === 'scattered' ? 'bg-paper/60' : 'bg-live'}`} />
            {state === 'scattered' ? 'Put him back' : 'Scatter him'}
          </div>
          {/* … or, on phones, once under his feet after he is together */}
          {hint && (
            <div
              aria-hidden
              onAnimationEnd={() => setHint(false)}
              className="hint-pill pointer-events-none absolute -bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-paper shadow-lg"
            >
              <span className="size-1.5 rounded-full bg-live" />
              Tap to scatter
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* --------------------------------------------------------------------------------------- */

/** A small, repeatable random sequence, so the build looks the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Per-shard attributes from the mesh: positions (model space), picture coordinates, the shard's
 * centre, where it glides in from and where a click sends it. The glide-in starts are spread
 * all around the figure; the scatter targets lean outwards from the body so he visibly comes apart.
 */
function buildGeometry(mesh: MeshData) {
  const { p, z, t } = mesh
  const n = t.length / 3
  const pos = new Float32Array(n * 9)
  const uv = new Float32Array(n * 6)
  const center = new Float32Array(n * 6)
  const start = new Float32Array(n * 12)
  const scatter = new Float32Array(n * 12)
  const rand = rng(11)
  const Z_SCALE = TEX_W * 0.18
  const X = (i: number) => p[i * 2] - TEX_W / 2
  const Y = (i: number) => TEX_H - p[i * 2 + 1]
  for (let f = 0; f < n; f++) {
    const idx = [t[f * 3], t[f * 3 + 1], t[f * 3 + 2]]
    const cx = (X(idx[0]) + X(idx[1]) + X(idx[2])) / 3
    const cy = (Y(idx[0]) + Y(idx[1]) + Y(idx[2])) / 3
    // glide in from anywhere around him; the low shards mostly from the sides, not from below the feet
    const a1 = rand() * Math.PI * 2
    const d1 = (180 + rand() * 360) * UNIT
    const sx = Math.cos(a1) * d1
    let sy = Math.sin(a1) * d1
    if (cy + sy < -60 * UNIT) sy = -60 * UNIT - cy
    const spin1 = (0.35 + rand() * 0.9) * (rand() < 0.5 ? -1 : 1)
    const delay = rand() * STAGGER
    // scatter: far outwards from the middle of the body, with some randomness (never below his feet)
    const ox = cx
    const oy = cy - TEX_H * 0.5
    const olen = Math.hypot(ox, oy) || 1
    const a2 = Math.atan2(oy, ox) + (rand() - 0.5) * 1.4
    const d2 = (180 + rand() * 520) * UNIT + Math.min(150 * UNIT, olen * 0.12)
    const tx = Math.cos(a2) * d2
    let ty = Math.sin(a2) * d2
    if (cy + ty < -40 * UNIT) ty = -40 * UNIT - cy
    const spin2 = (0.3 + rand() * 0.9) * (rand() < 0.5 ? -1 : 1)
    const depth = (rand() - 0.5) * 160 * UNIT
    for (let v = 0; v < 3; v++) {
      const i = idx[v]
      const o = f * 3 + v
      pos[o * 3] = X(i)
      pos[o * 3 + 1] = Y(i)
      pos[o * 3 + 2] = (z[i] / 1000) * Z_SCALE
      uv[o * 2] = p[i * 2] / TEX_W
      uv[o * 2 + 1] = p[i * 2 + 1] / TEX_H
      center[o * 2] = cx
      center[o * 2 + 1] = cy
      start[o * 4] = sx
      start[o * 4 + 1] = sy
      start[o * 4 + 2] = spin1
      start[o * 4 + 3] = delay
      scatter[o * 4] = tx
      scatter[o * 4 + 1] = ty
      scatter[o * 4 + 2] = spin2
      scatter[o * 4 + 3] = depth
    }
  }
  return { pos, uv, center, start, scatter, count: n * 3 }
}

function program(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)
    if (!sh) return null
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(sh))
      return null
    }
    return sh
  }
  const v = compile(gl.VERTEX_SHADER, vs)
  const f = compile(gl.FRAGMENT_SHADER, fs)
  if (!v || !f) return null
  const prog = gl.createProgram()
  if (!prog) return null
  gl.attachShader(prog, v)
  gl.attachShader(prog, f)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog))
    return null
  }
  return prog
}
