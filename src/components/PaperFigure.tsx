import { asset } from '../lib/asset'
import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { site } from '../data/site'
import { onHome } from '../lib/home'

/**
 * His paper-craft figure, in pieces. The picture is cut into ~500 shards that follow the paper's own
 * facets (big ones on the body, small ones on the face). On load the shards lie spread evenly over the
 * hero, then glide in and lock together; afterwards he breathes, and the shards under the cursor lift
 * and part around it, photo side up. A click (or, on phones and tablets, the "Scatter him" button) sends
 * them back out over the whole screen, each to its own spot, turning over and over on the way so the
 * red back of the paper flashes between the photo; they drift there a moment, then come back by themselves.
 *
 * On the paper page he casts his paper shadow, a little down and to the right, as if the cut-out stands
 * just in front of the page (it fades while his pieces are out). On the black page there is no light round
 * him: the page stays true black.
 *
 * The shards are drawn on a canvas as wide as the hero and as tall as its first screen, which the hero
 * keeps behind its words and over the giant name (`layer`, its [data-shard-layer]); the figure's own box,
 * where he stands, takes the clicks and holds the still picture. WebGL2: his shadow, then the shards in one
 * draw call; everything per shard happens in the vertex shader. The canvas has exactly as many pixels as
 * the screen gives it, so the drawing reaches the screen one to one, never stretched. Without WebGL, or
 * with "reduce motion" on, the plain cut-out is shown, with the same shadow done in CSS (index.css).
 */

/** Texture pixels: the cut-out's size (the picture upscaled 4x). */
const TEX_W = 1383
const TEX_H = 3830
/** Distances below were tuned on a 691px-wide picture; this scales them to the texture in use. */
const UNIT = TEX_W / 691
/** The canvas never draws more device pixels than a 4K screen has. */
const MAX_PIXELS = 3840 * 2160

/** Timing (milliseconds). */
const FADE_IN = 450 // on load the spread shards fade in,
const GATHER_DELAY = 400 // wait a moment, so he lands with the rest of the hero,
const GATHER_IN = 2300 // and glide in to make him
const SCATTER_OUT = 1000 // a click sends them out this quickly,
const SCATTER_HOLD = 2200 // lets them drift this long,
const GATHER_BACK = 1700 // then brings them back
const WAVE = 1100 // when the page comes home, a ripple runs down him from head to feet, this long

/** The back of the paper: the brand red (#f0412e, the same in both modes). */
const RED = [240 / 255, 65 / 255, 46 / 255] as const

/**
 * His shadow on the paper page: his outline in a warm dark at 26%, moved 5% of his width right and 1.4% of
 * his height down, blurred by 1.1% of his height. (index.css has the same for the still picture.)
 */
const SHADOW = { dx: 0.05, dy: 0.014, blur: 0.011 }
const SHADOW_SRC = 'avatar/krishna-shadow.webp'

type MeshData = { w: number; h: number; p: number[]; z: number[]; t: number[] }
type State = 'loading' | 'building' | 'ready' | 'scattered' | 'fallback'

const VERT = /* glsl */ `#version 300 es
precision highp float;
in vec3 a_pos;    // texture px (y runs down), and the paper's relief, towards the viewer
in vec2 a_uv;
in vec3 a_center; // the shard's centre, in the same space
in vec4 a_rand;   // four random numbers of its own
in vec2 a_cell;   // its spot in the spread: a point of u_spread, 0..1 each way
in float a_size;  // its size: the square root of its area (texture px)
uniform vec2 u_view;    // the canvas (CSS px)
uniform vec3 u_fig;     // where the picture's top-left corner is on the canvas, and its scale
uniform vec2 u_eye;     // where the perspective converges (his chest)
uniform vec4 u_spread;  // the part of the hero the spread covers: x, y, width, height
uniform float u_k;      // 0 together … 1 spread out
uniform float u_time;   // seconds
uniform float u_breath; // -1..1
uniform vec3 u_ptr;     // the pointer on the canvas, and how hard it pushes (0..1)
uniform float u_avg;    // the shards' average size
out vec2 v_uv;
out vec3 v_n;
out float v_shade;

const float PI = 3.14159265;
const float TH = ${TEX_H.toFixed(1)};
const float U = ${UNIT.toFixed(4)};
const float CAM = ${(5200 * UNIT).toFixed(1)};
const vec3 Z = vec3(0.0, 0.0, 1.0);

vec3 turn(vec3 v, vec3 ax, float a) { float c = cos(a), s = sin(a); return v * c + cross(ax, v) * s + ax * dot(ax, v) * (1.0 - c); }
float ease(float x) { x = clamp(x, 0.0, 1.0); return x * x * (3.0 - 2.0 * x); }

void main() {
  float s = u_fig.z;
  // alive: breathing, the feet staying put (the height above his feet is TH - y)
  vec3 v = a_pos;
  vec3 c = a_center;
  float hv = TH - v.y;
  float hc = TH - c.y;
  v.xy = vec2(v.x + u_breath * 1.2 * U * hv / TH, TH - hv * (1.0 + 0.004 * u_breath));
  c.xy = vec2(c.x + u_breath * 1.2 * U * hc / TH, TH - hc * (1.0 + 0.004 * u_breath));
  vec3 home = vec3(u_fig.xy + c.xy * s, c.z * s); // where the shard belongs (canvas px)
  vec3 local = (v - c) * s;                      // this corner, around the shard's centre

  // hover: the shards under the pointer part around it, lift and grow a touch, photo side up
  vec2 away = home.xy - u_ptr.xy;
  float d = length(away);
  float push = smoothstep(230.0 * U * s, 30.0 * U * s, d) * u_ptr.z;
  vec2 dir = d > 0.5 ? away / d : vec2(0.0, -1.0);
  float sg = a_rand.z < 0.5 ? -1.0 : 1.0;
  home += vec3(dir * push * 18.0 * U * s, push * 30.0 * U * s);
  local = turn(local * (1.0 + 0.05 * push), Z, push * 0.06 * sg);

  // the spread: each shard flies out to its own spot on an arc, turning over and over (so the back of
  // the paper flashes between the photo), and drifts and flutters there; some go a little before others
  float k = ease(u_k * 1.5 - a_rand.y * 0.5);
  float reach = min(u_spread.z, u_spread.w) / 900.0;
  vec2 spot = u_spread.xy + a_cell * u_spread.zw
    + vec2(sin(u_time * 0.7 + a_rand.z * 20.0), cos(u_time * 0.55 + a_rand.w * 20.0)) * 12.0 * reach * k;
  float a = a_rand.x * 6.2832;
  vec3 pos = mix(home, vec3(spot, 0.0), k) + vec3(vec2(sin(a), -cos(a)) * sin(k * PI) * 70.0 * reach, 0.0);
  // out there the shards are all about one size, so the spread reads as an even field
  float grow = mix(1.0, clamp(u_avg / a_size, 0.45, 2.4) * 1.3, 0.85 * k);
  vec3 off = turn(local * grow, Z, (a_rand.w - 0.5) * 6.0 * k);
  vec3 ax = vec3(cos(a), sin(a), 0.0);
  float tip = (4.0 * k * (1.0 - k) * (2.4 + 1.6 * a_rand.w) + k * (0.75 + 1.05 * sin(u_time * 2.0 + a_rand.y * 30.0))) * sg;
  pos += turn(off, ax, tip);
  v_n = turn(Z, ax, tip);

  // a gentle perspective, converging on his chest
  float f = CAM * s;
  vec2 p = u_eye + (pos.xy - u_eye) * (f / max(f - pos.z, f * 0.2));
  gl_Position = vec4(p.x / u_view.x * 2.0 - 1.0, 1.0 - p.y / u_view.y * 2.0, -pos.z / (4000.0 * U * s) + a_rand.y * 0.002 * k, 1.0);
  v_uv = a_uv;
  // loose paper catches a little more light
  v_shade = 1.0 + 0.06 * k + 0.04 * push;
}`

const FRAG = /* glsl */ `#version 300 es
precision highp float; // (the picture is 3830 pixels tall: a phone's half-precision would blur its places)
uniform sampler2D u_tex;
uniform vec3 u_red;
uniform float u_alpha;
in vec2 v_uv;
in vec3 v_n;
in float v_shade;
out vec4 o;
void main() {
  // premultiplied; three quarters of a step below the mip his size calls for, so the folds stay crisp on a
  // 4K screen (he is drawn at about 0.4 of the picture's size there)
  vec4 c = texture(u_tex, v_uv, -0.75);
  if (c.a < 0.02) discard; // (the clear paper round his edges must not hide the shards behind it)
  if (gl_FrontFacing) {
    o = vec4(min(c.rgb * v_shade, vec3(c.a)), c.a) * u_alpha;
  } else {
    // the back of the paper: plain red, lit by how it faces the light
    float lit = 0.58 + 0.52 * abs(dot(normalize(v_n), normalize(vec3(-0.4, -0.55, 0.73))));
    o = vec4(min(u_red * lit, vec3(1.0)) * c.a, c.a) * u_alpha;
  }
}`

const AURA_VERT = /* glsl */ `#version 300 es
precision highp float;
in vec2 a_corner;     // 0..1 across the rectangle
uniform vec2 u_view;  // the canvas (CSS px)
uniform vec4 u_rect;  // where the rectangle is on it: x, y, width, height
out vec2 v_q;
void main() {
  v_q = a_corner;
  vec2 p = u_rect.xy + a_corner * u_rect.zw;
  gl_Position = vec4(p.x / u_view.x * 2.0 - 1.0, 1.0 - p.y / u_view.y * 2.0, 0.0, 1.0);
}`

const AURA_FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D u_shade; // his outline, blurred (the red channel)
uniform float u_amount;    // 0..1
in vec2 v_q;
out vec4 o;
void main() {
  float a = texture(u_shade, v_q).r * 0.26 * u_amount;
  o = vec4(vec3(0.169, 0.133, 0.098) * a, a);
}`

export function PaperFigure({ layer, className = '' }: { layer: HTMLElement | null; className?: string }) {
  const reduce = useReducedMotion()
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<State>('loading')
  const toggleRef = useRef<() => void>(() => {})
  const labelRef = useRef<HTMLDivElement>(null)
  const hovered = useRef(false)
  const image = asset(site.hero.image)

  useEffect(() => {
    if (reduce) return
    const canvas = canvasRef.current
    const box = boxRef.current
    const section = layer?.parentElement
    if (!canvas || !box || !section) return
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
    const meshReady = fetch(asset('avatar/krishna-origami.json')).then((r) => {
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
      if (!gl || !canvas || !box || !section) return
      const prog = program(gl, VERT, FRAG)
      if (!prog) return fail()
      gl.useProgram(prog)

      // geometry: three vertices per shard so each shard can move on its own
      const geo = buildGeometry(mesh)
      const shardVao = gl.createVertexArray()
      gl.bindVertexArray(shardVao)
      const attr = (name: string, data: Float32Array, size: number, usage: number = gl.STATIC_DRAW) => {
        const buf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, data, usage)
        const loc = gl.getAttribLocation(prog, name)
        if (loc >= 0) {
          gl.enableVertexAttribArray(loc)
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
        }
        return buf
      }
      attr('a_pos', geo.pos, 3)
      attr('a_uv', geo.uv, 2)
      attr('a_center', geo.center, 3)
      attr('a_rand', geo.rand, 4)
      attr('a_size', geo.size, 1)
      const cellBuf = attr('a_cell', new Float32Array(geo.count * 2), 2, gl.DYNAMIC_DRAW)

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

      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.clearColor(0, 0, 0, 0)

      const loc = (name: string) => gl.getUniformLocation(prog, name)
      const U = {
        view: loc('u_view'),
        fig: loc('u_fig'),
        eye: loc('u_eye'),
        spread: loc('u_spread'),
        k: loc('u_k'),
        time: loc('u_time'),
        breath: loc('u_breath'),
        ptr: loc('u_ptr'),
        alpha: loc('u_alpha'),
      }
      gl.uniform1i(loc('u_tex'), 0)
      gl.uniform3f(loc('u_red'), RED[0], RED[1], RED[2])
      gl.uniform1f(loc('u_avg'), geo.avgSize)

      // his shadow: a rectangle drawn under the shards
      const aura = program(gl, AURA_VERT, AURA_FRAG)
      if (!aura) return fail()
      const auraVao = gl.createVertexArray()
      gl.bindVertexArray(auraVao)
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)
      const cornerLoc = gl.getAttribLocation(aura, 'a_corner')
      gl.enableVertexAttribArray(cornerLoc)
      gl.vertexAttribPointer(cornerLoc, 2, gl.FLOAT, false, 0, 0)
      gl.bindVertexArray(shardVao)
      // the shadow's shape is a small picture made ahead of time (SHADOW_SRC), so nothing is worked out here
      // at startup; until it has loaded the texture is one clear texel (no shadow)
      const shade = shadowBox()
      const shadeTex = gl.createTexture()
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, shadeTex)
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(1))
      const shadePic = new Image()
      shadePic.decoding = 'async'
      shadePic.src = asset(SHADOW_SRC)
      shadePic
        .decode()
        .then(() => {
          if (disposed || shadePic.naturalWidth !== shade.w || shadePic.naturalHeight !== shade.h) return
          gl.activeTexture(gl.TEXTURE1)
          gl.bindTexture(gl.TEXTURE_2D, shadeTex)
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
          gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, shadePic)
          gl.activeTexture(gl.TEXTURE0)
        })
        .catch(() => {})
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.activeTexture(gl.TEXTURE0)
      const auraLoc = (name: string) => gl.getUniformLocation(aura, name)
      const AU = {
        view: auraLoc('u_view'),
        rect: auraLoc('u_rect'),
        amount: auraLoc('u_amount'),
      }
      gl.useProgram(aura)
      gl.uniform1i(auraLoc('u_shade'), 1)
      gl.useProgram(prog)
      // how much of his shadow shows: all of it on the paper page, none on the black page (eased when the
      // theme switches; set straight away on the first frame)
      let lit = -1

      // --- size: the canvas is as wide as the hero and runs from its top past his feet, to the bottom of
      // the screen at least (on wide screens that is the whole hero; on phones and tablets the first screen,
      // where the words come after him). It only grows while the width stays, so a phone's toolbar
      // sliding away doesn't make it start over.
      let view = { w: 1, h: 1 }
      let sizedFor = 0
      // the canvas's size in the screen's own pixels, as the browser lays it out (where it says so): with
      // exactly that many, the drawing reaches the screen one to one, never stretched
      let device: { w: number; h: number } | null = null
      const resize = () => {
        const w = section.clientWidth
        const sr = section.getBoundingClientRect()
        const br = box.getBoundingClientRect()
        if (w === 0 || br.height === 0) return
        const need = Math.min(sr.height, Math.max(window.innerHeight, br.bottom - sr.top + 90))
        const h = Math.ceil(Math.min(sr.height, w === sizedFor ? Math.max(view.h, need) : need))
        sizedFor = w
        view = { w, h }
        canvas.style.height = `${h}px`
        // (test runners draw WebGL in software: one pixel per CSS pixel is plenty there)
        const full = Math.min(window.devicePixelRatio || 1, 3)
        const dpr = navigator.webdriver ? 1 : Math.min(full, Math.sqrt(MAX_PIXELS / (w * h)))
        let pw = Math.round(w * dpr)
        let ph = Math.round(h * dpr)
        if (device && dpr === full && !navigator.webdriver && Math.abs(device.w - pw) <= 2 && Math.abs(device.h - ph) <= 2) {
          pw = device.w
          ph = device.h
        }
        if (canvas.width !== pw || canvas.height !== ph) {
          canvas.width = pw
          canvas.height = ph
        }
        gl.viewport(0, 0, pw, ph)
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(section)
      ro.observe(box)
      const exact = new ResizeObserver((entries) => {
        const size = entries[0]?.devicePixelContentBoxSize?.[0]
        if (!size) return
        device = { w: size.inlineSize, h: size.blockSize }
        resize()
      })
      try {
        exact.observe(canvas, { box: 'device-pixel-content-box' })
      } catch {
        // (a browser that can't say keeps the rounded size above)
      }

      // where he stands on the canvas right now (the hero moves him: his entrance, and the scroll on wide screens)
      const place = () => {
        const cr = canvas.getBoundingClientRect()
        const br = box.getBoundingClientRect()
        return { cr, br, x: br.left - cr.left, y: br.top - cr.top, s: br.height / TEX_H }
      }

      // --- the spread: a jittered grid over the part of the hero on screen (clear of the header and the red
      // tape's lane), one spot per shard. Shards and spots are both taken in turn around his middle, so each
      // shard flies out the way it already faces and the figure opens outwards.
      let spread: [number, number, number, number] = [0, 0, 1, 1]
      const lay = () => {
        const { cr, x, y, s } = place()
        const head = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0
        const lane = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lane')) || 0
        let top = Math.max(cr.top, head + 8, 8)
        let bottom = Math.min(cr.bottom, window.innerHeight) - 12
        if (bottom - top < 160) {
          // (the hero is mostly off screen: its own first screen, then)
          top = cr.top + 72
          bottom = Math.min(cr.bottom, cr.top + window.innerHeight) - 12
        }
        const left = Math.max(cr.left, 0) + 12
        const right = Math.min(cr.right, window.innerWidth) - 12 - lane
        spread = [left - cr.left, top - cr.top, Math.max(1, right - left), Math.max(1, bottom - top)]
        const [sx, sy, sw, sh] = spread
        const n = geo.shards
        const rand = rng(5)
        const cols = Math.max(1, Math.round(Math.sqrt((n * sw) / sh)))
        const rows = Math.ceil(n / cols)
        let spots: { u: number; v: number; a: number }[] = []
        for (let i = 0; i < rows; i++)
          for (let j = 0; j < cols; j++) spots.push({ u: (j + 0.15 + rand() * 0.7) / cols, v: (i + 0.15 + rand() * 0.7) / rows, a: 0 })
        // the spare spots come out of the corners
        spots = spots.sort((p, q) => Math.hypot(p.u - 0.5, p.v - 0.5) - Math.hypot(q.u - 0.5, q.v - 0.5)).slice(0, n)
        const mx = x + (TEX_W / 2) * s
        const my = y + TEX_H * 0.45 * s
        for (const p of spots) p.a = Math.atan2(sy + p.v * sh - my, sx + p.u * sw - mx)
        spots.sort((p, q) => p.a - q.a)
        const data = new Float32Array(geo.count * 2)
        geo.order.forEach((shard, i) => {
          for (let v = 0; v < 3; v++) {
            data[(shard * 3 + v) * 2] = spots[i].u
            data[(shard * 3 + v) * 2 + 1] = spots[i].v
          }
        })
        gl.bindBuffer(gl.ARRAY_BUFFER, cellBuf)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
      }

      // --- the motion: k runs from 0 (together) to 1 (spread out) ---------------------------
      const smooth = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
      const quick = (t: number) => 1 - Math.pow(1 - t, 3)
      let k = 1
      const tw = { from: 1, to: 0, t0: 0, ms: 0, ease: smooth }
      const tween = (to: number, ms: number, ease: (t: number) => number, t0: number) => {
        tw.from = k
        tw.to = to
        tw.t0 = t0
        tw.ms = ms
        tw.ease = ease
      }
      let phase: 'gather' | 'out' | 'hold' | 'rest' = 'gather'
      let holdUntil = 0
      let built = false
      let holdTimer: ReturnType<typeof setTimeout> | undefined
      const gather = (now: number) => {
        clearTimeout(holdTimer)
        phase = 'gather'
        tween(0, GATHER_BACK * (0.45 + 0.55 * k), smooth, now)
        setState(built ? 'ready' : 'building')
      }
      const scatter = (now: number) => {
        // fresh spots only when he is whole (moving them mid-flight would make the shards jump)
        if (k < 0.02) lay()
        phase = 'out'
        const ms = SCATTER_OUT * (0.4 + 0.6 * (1 - k))
        tween(1, ms, quick, now)
        setState('scattered')
        // the frames bring him back once the hold is over; this timer does the same should the frames stop
        // meanwhile (the hero scrolled away, a switch of tabs), so the buttons never stay on "put him back"
        clearTimeout(holdTimer)
        holdTimer = setTimeout(() => {
          if (!disposed && (phase === 'out' || phase === 'hold')) {
            gather(performance.now())
            schedule()
          }
        }, ms + SCATTER_HOLD + 150)
      }
      toggleRef.current = () => {
        const now = performance.now()
        if (phase === 'out' || phase === 'hold') gather(now)
        else scatter(now)
        lastPointer = now
        schedule()
      }

      // --- the pointer: which shards move aside -----------------------------------------------
      const mouse = { x: 0, y: 0, in: false } // the mouse, in the window's px
      const ptr = { x: 0, y: 0, k: 0 } // the eased push, in the canvas's px
      const lbl = { x: 0, y: 0 } // the label beside the pointer, in the box's px
      let lastPointer = 0
      let wave = 0 // when the ripple started; 0 while there is none
      const onMove = (e: PointerEvent) => {
        if (e.pointerType && e.pointerType !== 'mouse') return
        mouse.x = e.clientX
        mouse.y = e.clientY
        mouse.in = true
        lastPointer = performance.now()
      }
      const onLeave = () => {
        mouse.in = false
        hovered.current = false
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('mouseleave', onLeave)
      window.addEventListener('blur', onLeave)
      // home: the ripple, once he is built and whole
      const offHome = onHome(() => {
        if (!built || phase !== 'rest') return
        wave = performance.now()
        lastPointer = wave
        schedule()
      })

      // --- run ------------------------------------------------------------------------------
      let visible = true
      const io = new IntersectionObserver(([en]) => {
        visible = en.isIntersecting
        if (visible) schedule()
      })
      io.observe(canvas)

      const born = performance.now()
      let last = born
      let frames = 0
      lay()
      setState('building')
      tween(0, GATHER_IN, smooth, born + GATHER_DELAY)

      const frame = (now: number) => {
        raf = 0
        if (disposed) return
        // once he is whole and nobody is pointing, half the frames are plenty for breathing
        // (test runners draw in software and share the machine: they always get half)
        frames++
        const busy = phase !== 'rest' || now - lastPointer < 2500
        if ((navigator.webdriver || !busy) && frames % 2 === 1) {
          if (visible && !document.hidden) schedule()
          return
        }
        const gap = now - last
        const dt = Math.min(0.05, gap / 1000)
        last = now

        // the spread: out, a moment there, and back
        if (tw.ms > 0) {
          const p = Math.min(1, Math.max(0, (now - tw.t0) / tw.ms))
          k = tw.from + (tw.to - tw.from) * tw.ease(p)
          if (p >= 1) {
            tw.ms = 0
            if (tw.to === 1) {
              phase = 'hold'
              holdUntil = now + SCATTER_HOLD
            } else {
              phase = 'rest'
              built = true
              setState('ready')
            }
          }
        }
        if (phase === 'hold' && now >= holdUntil) gather(now)

        const { cr, br, x, y, s } = place()
        // the pointer: the mouse, while it is over him (and he is whole) … or the ripple, a pointer nobody holds
        let tx = mouse.x - cr.left
        let ty = mouse.y - cr.top
        let tk = 0
        if (wave) {
          const p = (now - wave) / WAVE
          if (p >= 1) wave = 0
          else {
            tx = x + (TEX_W / 2) * s
            ty = y + (-120 * UNIT + (TEX_H + 240 * UNIT) * p) * s
            tk = 1
          }
        } else if (mouse.in) {
          const dx = mouse.x - (br.left + br.width / 2)
          const dy = mouse.y - br.top
          tk = Math.abs(dx) < br.width * 0.8 && dy > -120 * UNIT * s && dy < br.height + 80 * UNIT * s ? 1 : 0
        }
        if (ptr.k < 0.001) {
          ptr.x = tx
          ptr.y = ty
        }
        const kp = 1 - Math.pow(0.00005, dt)
        ptr.x += (tx - ptr.x) * kp
        ptr.y += (ty - ptr.y) * kp
        ptr.k += (tk * (built ? 1 - k : 0) - ptr.k) * (1 - Math.pow(0.0008, dt))
        // the label beside the pointer follows it with a little lag
        const label = labelRef.current
        if (label) {
          const kl = 1 - Math.pow(0.0005, dt)
          lbl.x += (mouse.x - br.left - lbl.x) * kl
          lbl.y += (mouse.y - br.top - lbl.y) * kl
          label.style.transform = `translate(${lbl.x + 18}px, ${lbl.y + 22}px)`
          label.dataset.on = hovered.current && built ? '1' : '0'
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // his shadow, under the shards, on the paper page only (it goes while his pieces are out); a switch of
        // theme fades it in or out (straight away when the switch happened with him out of sight)
        const dark = document.documentElement.getAttribute('data-mode') !== 'light'
        const ke = lit < 0 || gap > 250 ? 1 : 1 - Math.pow(0.0005, dt)
        lit += ((dark ? 0 : 1) - lit) * ke
        const fade = Math.min(1, (now - born) / FADE_IN)
        const shadowA = lit * (1 - k) * fade
        if (shadowA > 0.002) {
          const fw = TEX_W * s
          const fh = TEX_H * s
          gl.useProgram(aura)
          gl.bindVertexArray(auraVao)
          gl.disable(gl.DEPTH_TEST)
          gl.depthMask(false)
          gl.uniform2f(AU.view, view.w, view.h)
          gl.uniform1f(AU.amount, shadowA)
          gl.uniform4f(AU.rect, x + (SHADOW.dx - shade.px) * fw, y + (SHADOW.dy - shade.py) * fh, fw * (1 + 2 * shade.px), fh * (1 + 2 * shade.py))
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
          gl.enable(gl.DEPTH_TEST)
          gl.depthMask(true)
          gl.useProgram(prog)
          gl.bindVertexArray(shardVao)
        }

        gl.uniform2f(U.view, view.w, view.h)
        gl.uniform3f(U.fig, x, y, s)
        gl.uniform2f(U.eye, x + (TEX_W / 2) * s, y + TEX_H * 0.25 * s)
        gl.uniform4f(U.spread, spread[0], spread[1], spread[2], spread[3])
        gl.uniform1f(U.k, k)
        gl.uniform1f(U.time, (now - born) / 1000)
        gl.uniform1f(U.breath, Math.sin(now / 1900))
        gl.uniform3f(U.ptr, ptr.x, ptr.y, ptr.k)
        gl.uniform1f(U.alpha, fade)
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
      canvas.addEventListener('webglcontextlost', fail)
      schedule()

      cleanup = () => {
        clearTimeout(holdTimer)
        ro.disconnect()
        exact.disconnect()
        io.disconnect()
        window.removeEventListener('pointermove', onMove)
        document.removeEventListener('mouseleave', onLeave)
        window.removeEventListener('blur', onLeave)
        offHome()
        document.removeEventListener('visibilitychange', onVisibility)
        canvas.removeEventListener('webglcontextlost', fail)
      }
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      cleanup()
    }
  }, [reduce, image, layer])

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
          {layer &&
            createPortal(
              <canvas ref={canvasRef} role="img" aria-label={site.name} className="pointer-events-none block w-full" />,
              layer,
            )}
          <button
            type="button"
            aria-label={state === 'scattered' ? 'Put the paper figure back together' : 'Scatter the paper figure'}
            aria-pressed={state === 'scattered'}
            onClick={() => toggleRef.current()}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') hovered.current = true
            }}
            onPointerLeave={() => {
              hovered.current = false
            }}
            className="absolute inset-0 cursor-pointer rounded-[40%] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-ink/60"
          />
          {/* the hint beside the pointer (mouse) … */}
          <div
            ref={labelRef}
            aria-hidden
            data-on="0"
            className="btn-key cursor-label pointer-events-none absolute left-0 top-0 z-30"
          >
            <span className={`size-1.5 rounded-full ${state === 'scattered' ? 'bg-ink-soft' : 'bg-live'}`} />
            {state === 'scattered' ? 'Put him back' : 'Scatter him'}
          </div>
          {/* … and, below the lg breakpoint, a button under his feet that stays (tapping him works too);
              "Keep together" brings him back sooner than the hold would */}
          <button
            type="button"
            onClick={() => toggleRef.current()}
            aria-pressed={state === 'scattered'}
            disabled={state === 'loading' || state === 'building'}
            data-figure-toggle
            className={`btn-key figure-pill absolute -bottom-[62px] left-1/2 z-30 -translate-x-1/2 ${state === 'loading' || state === 'building' ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
          >
            <span className={`size-1.5 rounded-full ${state === 'scattered' ? 'bg-ink-soft' : 'bg-live'}`} />
            {state === 'scattered' ? 'Keep together' : 'Scatter him'}
          </button>
        </>
      )}
    </div>
  )
}

/* --------------------------------------------------------------------------------------- */

/** A small, repeatable random sequence, so the motion looks the same on every visit. */
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
 * Per-shard attributes from the mesh: corners and centres in the picture's pixels (with the paper's
 * relief as depth), picture coordinates, four random numbers and the shard's size. Each shard is wound
 * counter-clockwise as drawn, so its photo side is the front face and a shard that turns over shows
 * its back (red). `order` lists the shards in turn around his middle, for the spread.
 */
function buildGeometry(mesh: MeshData) {
  const { p, z, t } = mesh
  const n = t.length / 3
  const pos = new Float32Array(n * 9)
  const uv = new Float32Array(n * 6)
  const center = new Float32Array(n * 9)
  const rand = new Float32Array(n * 12)
  const size = new Float32Array(n * 3)
  const angle = new Float32Array(n)
  const r = rng(7)
  const Z_SCALE = TEX_W * 0.18
  for (let f = 0; f < n; f++) {
    let [a, b, c] = [t[f * 3], t[f * 3 + 1], t[f * 3 + 2]]
    // (the picture's y runs down and the screen's up: this sign is clockwise in the picture)
    const a2 = (p[b * 2] - p[a * 2]) * (p[c * 2 + 1] - p[a * 2 + 1]) - (p[c * 2] - p[a * 2]) * (p[b * 2 + 1] - p[a * 2 + 1])
    if (a2 > 0) [b, c] = [c, b]
    const idx = [a, b, c]
    const cx = (p[a * 2] + p[b * 2] + p[c * 2]) / 3
    const cy = (p[a * 2 + 1] + p[b * 2 + 1] + p[c * 2 + 1]) / 3
    const cz = ((z[a] + z[b] + z[c]) / 3000) * Z_SCALE
    const rr = [r(), r(), r(), r()]
    angle[f] = Math.atan2(cy - TEX_H * 0.45, cx - TEX_W / 2)
    for (let v = 0; v < 3; v++) {
      const i = idx[v]
      const o = f * 3 + v
      pos.set([p[i * 2], p[i * 2 + 1], (z[i] / 1000) * Z_SCALE], o * 3)
      uv.set([p[i * 2] / TEX_W, p[i * 2 + 1] / TEX_H], o * 2)
      center.set([cx, cy, cz], o * 3)
      rand.set(rr, o * 4)
      size[o] = Math.sqrt(Math.abs(a2) / 2)
    }
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => angle[i] - angle[j])
  let avgSize = 0
  for (let f = 0; f < n; f++) avgSize += size[f * 3] / n
  return { pos, uv, center, rand, size, avgSize, order, shards: n, count: n * 3 }
}

/**
 * His shadow on the paper page is a picture made ahead of time (public/avatar/krishna-shadow.webp): the
 * cut-out's outline at a fifth of its size, blurred (three box blurs each way, about a Gaussian of SHADOW.blur
 * of his height), with room round it for the blur. This is that picture's size; `px` and `py` are the room,
 * as fractions of his width and height. A new cut-out or a new SHADOW.blur needs the picture made again.
 */
function shadowBox() {
  const S = 0.2
  const fw = Math.round(TEX_W * S)
  const fh = Math.round(TEX_H * S)
  const sigma = SHADOW.blur * fh
  const r = Math.max(1, Math.round((Math.sqrt(4 * sigma * sigma + 1) - 1) / 2))
  const pad = 3 * r + 2
  return { w: fw + pad * 2, h: fh + pad * 2, px: pad / fw, py: pad / fh }
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
