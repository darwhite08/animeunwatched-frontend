"use client"

import { useEffect, useRef } from "react"

/* ── Three.js animated 3D pirate ship ─────────────────────────────────────
   Exactly from Hero Section.html — hull, masts, sails with skull canvas,
   waving flag, animated ocean waves, sail billow, ship bob & sway.
─────────────────────────────────────────────────────────────────────────── */
export function HeroShip({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    let raf: number

    async function init() {
      const THREE = await import("three")
      const mount = mountRef.current
      if (!mount || !alive) return

      let w = Math.max(2, mount.clientWidth)
      let h = Math.max(2, mount.clientHeight)

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 200)
      camera.position.set(1.2, 1.6, 10)
      camera.lookAt(0, 1.0, 0)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h)
      mount.appendChild(renderer.domElement)

      /* ── Lights ── */
      scene.add(new THREE.AmbientLight(0x8fb8e8, 0.45))
      const sun = new THREE.DirectionalLight(0xffd9a0, 1.9)
      sun.position.set(-4, 6, 5); scene.add(sun)
      const fill = new THREE.DirectionalLight(0x6aa9ff, 0.5)
      fill.position.set(4, 2, -3); scene.add(fill)

      /* ── Ocean ── */
      const oceanGeom = new THREE.PlaneGeometry(80, 80, 90, 90)
      const ocean = new THREE.Mesh(oceanGeom, new THREE.MeshStandardMaterial({ color: 0x2a72c8, roughness: 0.35, metalness: 0.05, flatShading: true }))
      ocean.rotation.x = -Math.PI / 2; ocean.position.y = -1.55; scene.add(ocean)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oceanPos = oceanGeom.attributes.position as any

      /* ── Ship ── */
      const ship = new THREE.Group(); scene.add(ship)

      const hullShape = new THREE.Shape()
      hullShape.moveTo(-2.9, 0.45); hullShape.lineTo(2.9, 0.45)
      hullShape.bezierCurveTo(3.5, 0.0, 3.6, -0.9, 2.5, -1.25)
      hullShape.lineTo(-2.5, -1.25)
      hullShape.bezierCurveTo(-3.6, -0.9, -3.5, 0.0, -2.9, 0.45)
      const hullGeom = new THREE.ExtrudeGeometry(hullShape, { depth: 1.5, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 })
      hullGeom.translate(0, 0, -0.75)
      const hull = new THREE.Mesh(hullGeom, new THREE.MeshStandardMaterial({ color: 0x6a3a1a, roughness: 0.75, flatShading: true }))
      hull.position.y = -0.2; ship.add(hull)

      const stripe = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 1.56), new THREE.MeshStandardMaterial({ color: 0xc4382a, roughness: 0.5 }))
      stripe.position.y = 0.15; ship.add(stripe)

      const deck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.08, 1.4), new THREE.MeshStandardMaterial({ color: 0x8a5a26, roughness: 0.9 }))
      deck.position.y = 0.3; ship.add(deck)

      for (let i = -2; i <= 2; i++) {
        const ph = new THREE.Mesh(new THREE.CircleGeometry(0.13, 16), new THREE.MeshStandardMaterial({ color: 0x0e1a30, roughness: 0.6 }))
        ph.position.set(i * 0.85, -0.25, 0.79); ship.add(ph)
        const rim = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.18, 24), new THREE.MeshStandardMaterial({ color: 0xd4a13a, roughness: 0.5, side: THREE.DoubleSide }))
        rim.position.set(i * 0.85, -0.25, 0.80); ship.add(rim)
      }

      function makeMast(x: number, height: number) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, height, 10), new THREE.MeshStandardMaterial({ color: 0x3a1c08, roughness: 0.85 }))
        m.position.set(x, 0.3 + height / 2, 0); ship.add(m)
      }
      makeMast(-1.6, 3.6); makeMast(0.9, 4.6)

      function makeYard(x: number, y: number, len: number) {
        const y0 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len, 8), new THREE.MeshStandardMaterial({ color: 0x3a1c08, roughness: 0.85 }))
        y0.position.set(x, y, 0); y0.rotation.z = Math.PI / 2; ship.add(y0)
      }
      makeYard(0.9, 3.7, 3.6); makeYard(-1.6, 3.2, 2.4)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function makeSailCanvas(withSkull: boolean): any {
        const c = document.createElement("canvas"); c.width = 512; c.height = 512
        const ctx = c.getContext("2d")!
        const grad = ctx.createLinearGradient(0, 0, 0, 512)
        grad.addColorStop(0, "#fff7dc"); grad.addColorStop(1, "#d9bd7a")
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 512)
        ctx.globalAlpha = 0.07; ctx.fillStyle = "#000"
        for (let i = 0; i < 512; i += 6) ctx.fillRect(0, i, 512, 1)
        ctx.globalAlpha = 1
        ctx.strokeStyle = "#8a5a18"; ctx.lineWidth = 6; ctx.strokeRect(8, 8, 496, 496)
        if (withSkull) {
          ctx.save(); ctx.translate(256, 256)
          ctx.strokeStyle = "#0e1a30"; ctx.lineWidth = 14; ctx.lineCap = "round"
          ctx.beginPath(); ctx.moveTo(-115, 115); ctx.lineTo(115, -115); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(115, 115); ctx.lineTo(-115, -115); ctx.stroke()
          ctx.fillStyle = "#f6f3ea"
          for (const [x, y] of [[-115,115],[115,115],[-115,-115],[115,-115]] as [number,number][]) {
            ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI*2); ctx.fill(); ctx.stroke()
          }
          ctx.beginPath(); ctx.ellipse(0, -12, 78, 70, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(-50,40); ctx.lineTo(50,40); ctx.lineTo(50,72); ctx.lineTo(-50,72); ctx.closePath(); ctx.fill(); ctx.stroke()
          ctx.fillStyle = "#0e1a30"
          ctx.beginPath(); ctx.arc(-26,-10,16,0,Math.PI*2); ctx.fill()
          ctx.beginPath(); ctx.arc(26,-10,16,0,Math.PI*2); ctx.fill()
          ctx.lineWidth = 6
          for (const x of [-26,0,26]) { ctx.beginPath(); ctx.moveTo(x,42); ctx.lineTo(x,72); ctx.stroke() }
          ctx.restore()
        }
        const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4; return tex
      }

      const mainSailTex = makeSailCanvas(true)
      const backSailTex = makeSailCanvas(false)

      const mainSail = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.1, 14, 12), new THREE.MeshStandardMaterial({ map: mainSailTex, side: THREE.DoubleSide, roughness: 0.95 }))
      mainSail.position.set(0.9, 2.0, 0.05); ship.add(mainSail)

      const backSail = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2, 10, 10), new THREE.MeshStandardMaterial({ map: backSailTex, side: THREE.DoubleSide, roughness: 0.95 }))
      backSail.position.set(-1.6, 1.7, 0.05); ship.add(backSail)

      const flagGeom = new THREE.PlaneGeometry(0.9, 0.45, 10, 4)
      flagGeom.translate(0.45, 0, 0)
      const flag = new THREE.Mesh(flagGeom, new THREE.MeshStandardMaterial({ color: 0x0e1a30, side: THREE.DoubleSide, roughness: 0.9 }))
      flag.position.set(0.9, 4.55, 0); ship.add(flag)

      /* ── Animation buffers ── */
      const oceanZ0  = new Float32Array(oceanPos.count);    for (let i=0;i<oceanPos.count;i++) oceanZ0[i] = oceanPos.getZ(i)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mainP    = mainSail.geometry.attributes.position as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backP    = backSail.geometry.attributes.position as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagP    = flag.geometry.attributes.position as any
      const mainZ0   = new Float32Array(mainP.count);       for (let i=0;i<mainP.count;i++) mainZ0[i] = mainP.getZ(i)
      const backZ0   = new Float32Array(backP.count);       for (let i=0;i<backP.count;i++) backZ0[i] = backP.getZ(i)
      const flagZ0   = new Float32Array(flagP.count);       for (let i=0;i<flagP.count;i++) flagZ0[i] = flagP.getZ(i)

      function tick(ms: number) {
        if (!alive) return
        const t = ms * 0.001
        for (let i=0;i<oceanPos.count;i++) {
          const x=oceanPos.getX(i), y=oceanPos.getY(i)
          oceanPos.setZ(i, Math.sin(x*0.45+t*0.9)*0.18 + Math.cos(y*0.35+t*0.7)*0.14 + Math.sin((x+y)*0.25+t*0.4)*0.08)
        }
        oceanPos.needsUpdate=true; oceanGeom.computeVertexNormals()
        for (let i=0;i<mainP.count;i++) {
          mainP.setZ(i, mainZ0[i] + Math.sin(mainP.getY(i)*1.5+t*1.2)*0.08 + Math.cos(mainP.getX(i)*1.1+t)*0.06 + 0.22)
        }
        mainP.needsUpdate=true; mainSail.geometry.computeVertexNormals()
        for (let i=0;i<backP.count;i++) {
          backP.setZ(i, backZ0[i] + Math.sin(backP.getY(i)*1.4+t*1.05)*0.07 + Math.cos(backP.getX(i)+t*0.9)*0.05 + 0.18)
        }
        backP.needsUpdate=true; backSail.geometry.computeVertexNormals()
        for (let i=0;i<flagP.count;i++) {
          const ratio=Math.max(0,flagP.getX(i)/0.9)
          flagP.setZ(i, flagZ0[i]+Math.sin(flagP.getX(i)*5+t*5)*0.10*ratio)
        }
        flagP.needsUpdate=true
        ship.position.y = Math.sin(t*0.75)*0.14
        ship.rotation.z = Math.sin(t*0.55)*0.03
        ship.rotation.x = Math.sin(t*0.7)*0.018
        ship.rotation.y = -0.18 + Math.sin(t*0.35)*0.05
        renderer.render(scene, camera)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

      const onResize = () => {
        w = Math.max(2, mount.clientWidth); h = Math.max(2, mount.clientHeight)
        camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w, h)
      }
      window.addEventListener("resize", onResize)
      const ro = window.ResizeObserver ? new ResizeObserver(onResize) : null
      ro?.observe(mount)

      return () => {
        alive=false; cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); ro?.disconnect()
        renderer.dispose(); mainSailTex.dispose(); backSailTex.dispose()
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      }
    }

    const cleanupPromise = init()
    return () => { alive=false; cleanupPromise.then(fn => fn?.()) }
  }, [])

  return (
    <div ref={mountRef} className={className} style={style}
      aria-label="Animated 3D pirate ship on the open sea" role="img" />
  )
}
