import React, { useRef, useState, useEffect,useMemo } from 'react'
import { useFrame,useThree,extend,useLoader } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { a, config, useSpring } from '@react-spring/three'
import { GlobalCanvas, UseCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import { StickyScrollScene } from '@14islands/r3f-scroll-rig/powerups'
import { Box, Plane,PerspectiveCamera,Html,Environment,Lightformer,Text,ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Car from "./Car.js"
import VolumetricSpotlight from "./v/volumetric-spotlight";
import { KernelSize } from 'postprocessing'
import { EffectComposer, Bloom,Glitch } from '@react-three/postprocessing'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import SVGShapes from './SVGShapes';
import { Lamborghini } from './Lamborghini'
import { BlurPass } from "postprocessing";
import { GlitchMode } from "postprocessing";
import { Gallery } from './Gallery'



import Logo from './Logo'
import './styles.css'

const pexel = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`
const images = [
  // Front
  { position: [0, 0, 1.5], rotation: [0, 0, 0], url: "./Grp2.jpg",text:"Real-Time Opinion" },
  // Back

  { position: [-7.15, 0, 4.5], rotation: [0, Math.PI / 2.5, 0], url: "./CarGrp.jpg",text:"Sales Representative Avatar"},
  // Right
  { position: [7.15, 0, 4.5], rotation: [0, -Math.PI / 2.5, 0], url: "./Image4.jpg",text:"Multiple Featured Areas" },
]

function VideoText(props) {
  const [video] = useState(() => Object.assign(document.createElement('video'), { src: '/psych.mp4', crossOrigin: 'Anonymous', loop: true, muted: true }))
  useEffect(() => void video.play(), [video])
  return (
    <Text font="/Inter-Bold.woff" fontSize={2} letterSpacing={-0.06} {...props}>
THE FUTURE OF AUTOMOBILE
<meshBasicMaterial toneMapped={false}>
        <videoTexture attach="map" args={[video]} encoding={THREE.sRGBEncoding} />
      </meshBasicMaterial>
    </Text>
  )
}


function Caption({ children }) {
  const { width } = useThree((state) => state.viewport)
  return (
    <Text
    position={[0, 4,0 ]}
      lineHeight={0.8}
      font="/Ki-Medium.ttf"
      fontSize={width / 8}
      material-toneMapped={false}
      anchorX="center"
      anchorY="middle">
      {children}
    </Text>
  )
}
function SvgButton() {
  const ref = useRef()


  return (
    <>
    <Html
      transform
      distanceFactor={10}
      position={[0, 1, 0]}

      style={{
        width: "100%", // Increase the width value
        height: "100%", // Increase the height value
      }}
    >
      <img
        src={"./triangle.png"}
        alt="expand"
      />

    </Html>

  </>
  )
}

function Triangle({ color, ...props }) {
  const ref = useRef()
  const [r] = useState(() => Math.random() * 10000)
  useFrame((_) => (ref.current.position.y = -1.75 + Math.sin(_.clock.elapsedTime + r) / 10))
     const group = useRef();


  return (
    <group ref={group}>
        {/* Other 3D objects */}
        <SVGShapes path="/triangle.svg" material={new THREE.MeshBasicMaterial()} group={group.current} />
    </group>
  )
}

function Rig({ children }) {
  const ref = useRef()
  const vec = new THREE.Vector3()
  const { camera, mouse } = useThree()
  useFrame(() => {
    camera.position.lerp(vec.set(mouse.xADAS * 2, 0, 3.5), 0.05)
    ref.current.position.lerp(vec.set(mouse.x * 1, mouse.y * 0.1, 0), 0.1)
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, (-mouse.x * Math.PI) / 20, 0.1)
  })
  return <group ref={ref}>{children}</group>
}

function Ground(props) {
  const [floor, normal] = useTexture(['/SurfaceImperfections003_1K_var1.jpg', '/SurfaceImperfections003_1K_Normal.jpg'])
  return (
    <Reflector resolution={1024} args={[8, 8]} {...props}>
      {(Material, props) => <Material color="#f0f0f0" metalness={0} roughnessMap={floor} normalMap={normal} normalScale={[2, 2]} {...props} />}
    </Reflector>
  )
}


const AnimatedRoundedBox = a(RoundedBox)



extend({
  VolumetricSpotlight
});

const MyVolSpotlight = React.forwardRef(function MyVolSpotlight(props, ref) {
  const vs = React.useRef();
  const spotlight = React.useRef();

  const { scene } = useThree();

  const {
    angle = 0.3,
    penumbra = 0.1,
    distance = 60,
    color,
    intensity,
    position,
    target
  } = props;

  // INIT
  useEffect(() => {
    scene.add(spotlight.current.target);

    const geometry = vs.current.geometry;

    geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, -geometry.parameters.height / 2, 0)
    );
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    vs.current.material.uniforms.spotPosition.value = vs.current.position;

    spotlight.current.position.copy(vs.current.position);
  }, [scene, color, position]);

  useFrame(({ clock }) => {
    spotlight.current.position.copy(vs.current.position);
    // @todo fix this
    vs.current.material.uniforms.lightColor.value = spotlight.current.color;

    if (target && target.current) {
      vs.current.lookAt(target.current.position);
      spotlight.current.target.position.copy(target.current.position);
    }
  });

  const setRef = React.useCallback(function setRef(el) {
    vs.current = el;

    if (ref) {
      ref.current = el;
    }
  }, []);

  // maps spotlight angle to volueme cylinder every frame
  // it would be better to do it on a need-to basis
  // but it doesn't play nice with react-spring
  useFrame(() => {
    const angle = spotlight.current.angle;

    vs.current.scale.set(6 * angle, 6 * angle, 1);
  });

  return (
    <>
      <a.spotLight
        castShadow
        ref={spotlight}
        intensity={intensity}
        angle={angle}
        penumbra={penumbra}
        distance={distance}
        color={color}
      />

      <a.mesh ref={setRef} position={position}>
        <a.coneGeometry args={[10, 40, 64, 30, 40, true]} attach="geometry" />

        <volumetricSpotlight
          attach="material"
          uniforms-lightColor-value={color}
          uniforms-attenuation-value={24}
          uniforms-anglePower-value={8}
        />
      </a.mesh>
    </>
  );
});

function Scene({ mouse, scale, scrollState, inViewport }) {
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  const ref = React.useRef();
  const { gl } = useThree()
      const renderer = gl.domElement
  useEffect(() => {
    console.log(renderer,'canvas')
   gl.shadowMap.enabled = true
   gl.shadowMap.type = THREE.PCFSoftShadowMap
 }, [])

  console.log(gl,"canvas")
  useFrame(() => {
    const [x, y] = mouse.current;
    console.log(inViewport)
    if (ref.current) {
      ref.current.position.x = THREE.MathUtils.lerp(
        ref.current.position.x,
        x / aspect / 20,
        0.1
      );
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        0 + y / aspect / 100,
        0.1
      );
      ref.current.rotation.y = 0.8;
    }
  });

  const target = React.useRef();

  // ANIMATION
  const tangle = React.useRef(0);

  const toggle = React.useRef(false);
  const s1 = [
    {
      position: [-12, 15, 0],
      intensity: 1,
      penumbra: 0.8,
      color: "#ffff99",
      angle: 0.3
    },
    {
      position: [-12, 12, -8],
      intensity: 1,
      penumbra: 0.8,
      color: "#ff6b81",
      angle: 0.3
    },
    {
      position: [-15, 6, 12],
      intensity: 2,
      penumbra: 1,
      color: "#900c3f",
      angle: 0.4
    }
  ];

  const s2 = [
    {
      position: [12, 15, 0],
      intensity: 1,
      penumbra: 0.8,
      color: "#43d8c9",
      angle: 0.3
    },
    {
      position: [-12, 12, 4],
      intensity: 1,
      penumbra: 0.8,
      color: "#3498db",
      angle: 0.3
    },
    {
      position: [10, 6, -8],
      intensity: 1.4,
      penumbra: 1,
      color: "#fb7b6b",
      angle: 0.4
    }
  ];

  const [light1, setLight1] = useSpring(() => s1[0]);
  const [light2, setLight2] = useSpring(() => s2[0]);

  useEffect(() => {
    const t = setInterval(() => {
      if (toggle.current % 3 === 0) {
        setLight1(s1[1]);
        setLight2(s2[1]);
      } else if (toggle.current % 3 === 1) {
        setLight1(s1[0]);
        setLight2(s2[0]);
      } else {
        setLight1(s1[2]);
        setLight2(s2[2]);
      }

      toggle.current += 1;
    }, 3000);

    return () => {
      clearInterval(t);
    };
  }, [setLight1]);

  useFrame(({ clock }) => {
    tangle.current += (Math.PI / 2) * 0.01;
    var targetPosition = new THREE.Vector3(
      1.5 * Math.cos(tangle.current * 2),
      Math.sin(tangle.current * 2) - 4,
      1.5 * Math.sin(tangle.current * 2)
    );

    if (target) {
      target.current.position.copy(targetPosition);
    }
  });

  return (
    <>
      <group ref={ref}>
        <Plane
          args={[3000, 3000]}
          receiveShadow
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshPhysicalMaterial
            color={0x666666}
            metalness={0}
            roughness={0.7}
            reflectivity={0.56}
            side={THREE.DoubleSide}
          />
        </Plane>

        <Box
          args={[3, 5, 1]}
          castShadow
          receiveShadow
          position={[0, -10, 0]}
          material-roughness={0.5}
          material-color="#ffffff"
        />
        {inViewport?(        <Gallery images={images}/>
):(null)}
      </group>

      <Box ref={target} />

      <MyVolSpotlight penumbra={0.5} target={target} ref={light2} {...light2} />

      <MyVolSpotlight penumbra={0.5} target={target} ref={light1} {...light1} />
    </>
  );
}


function Scene2({ mouse,scale, scrollState, inViewport }) {
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  const ref = React.useRef();

  useFrame(() => {
    const [x, y] = mouse.current;
    console.log(inViewport)
    if (ref.current) {
      ref.current.position.x = THREE.MathUtils.lerp(
        ref.current.position.x,
        x / aspect / 20,
        0.1
      );
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        0 + y / aspect / 100,
        0.1
      );
      ref.current.rotation.y = 0.8;
    }
  });
  useFrame(({ clock }) => {
    tangle.current += (Math.PI / 2) * 0.01;
    var targetPosition = new THREE.Vector3(
      1.5 * Math.cos(tangle.current * 2),
      Math.sin(tangle.current * 2) - 4,
      1.5 * Math.sin(tangle.current * 2)
    );

    if (target) {
      target.current.position.copy(targetPosition);
    }
  });

  const target = React.useRef();

  // ANIMATION
  const tangle = React.useRef(0);

  const toggle = React.useRef(false);
  const s1 = [
    {
      position: [8, 12, 1],
      intensity: 1,
      penumbra: 1.8,
      color: "#ff6b81",
      angle: 10.3
    },
    {
      position: [8, 12, -8],
      intensity: 1,
      penumbra: 1.8,
      color: "#ff6b81",
      angle: 10.3
    }
  ];

  const s2 = [

    {
      position: [-12, 12, 1],
      intensity: 1,
      penumbra: 1.8,
      color: "#3498db",
      angle: 10.3
    },
    {
      position: [-12, 7, -6],
      intensity: 1,
      penumbra: 1.8,
      color: "#3498db",
      angle: 10.3
    }
  ];

  const [light1, setLight1] = useSpring(() => s1[0]);
  const [light2, setLight2] = useSpring(() => s2[0]);


    useEffect(() => {

        console.log(inViewport,'rg')
        if(inViewport){
          setTimeout(() => {
      // Code to be executed after the timeout
      setLight1(s1[1]);
      setLight2(s2[1]);    },1000);
        } else  {
          setLight1(s1[0]);
          setLight2(s2[0]);
        }

        toggle.current += 1;


    }, [inViewport]);

  return (
    <>
      <group ref={ref}>
        <Plane
          args={[3000, 3000]}
          receiveShadow
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshPhysicalMaterial
            color={0x666666}
            metalness={0}
            roughness={0.7}
            reflectivity={0.56}
            side={THREE.DoubleSide}
          />
        </Plane>

 <Lamborghini rotation={[ -Math.PI / 10.495, Math.PI / 0.495, 0]}   position={[0, 4, -4]}
scale={0.061} />
 <ContactShadows resolution={1024} frames={1} position={[0, -1.16, 0]} scale={15} blur={0.5} opacity={1} far={20} />

 <directionalLight position={[0, 3, 10]} intensity={1} />
 <MyVolSpotlight penumbra={0.5} target={target} ref={light2} {...light2} />

 <MyVolSpotlight penumbra={0.5} target={target} ref={light1} {...light1} />
      </group>

      <Box ref={target} />



    </>
  );
}




function SpinningBox({ scale, scrollState, inViewport }) {
  const box = useRef()
  const size = scale.xy.min() * 0.5

  useFrame(() => {
    box.current.rotation.y = scrollState.progress * Math.PI * 2
  })

  const spring = useSpring({
    scale: inViewport ? size : size * 0.0,
    config: inViewport ? config.wobbly : config.stiff,
    delay: inViewport ? 100 : 0
  })

  return (
    <AnimatedRoundedBox ref={box} {...spring}>
      <meshNormalMaterial />

    </AnimatedRoundedBox>
  )
}

function StickySection() {
  const el = useRef()

    const mouse = React.useRef([0, 0]);
  const onMouseMove = React.useCallback(
    ({ clientX: x, clientY: y }) =>
      (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]),
    []
  );
  return (
    <section>
      <div className="StickyContainer2">
        <div ref={el} className="SomeDomContent Debug">
        </div>
      </div>
      <UseCanvas>
          <StickyScrollScene track={el}>
          {(props) => (
            <>
               <Scene mouse={mouse} {...props} />


            </>
          )}
        </StickyScrollScene>

      </UseCanvas>
    </section>
  )
}
function StickySection2() {
  const el = useRef()

    const mouse = React.useRef([0, 0]);
  const onMouseMove = React.useCallback(
    ({ clientX: x, clientY: y }) =>
      (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]),
    []
  );
  return (
    <section>
      <div className="StickyContainer">
        <div ref={el} className="SomeDomContent Debug">
        </div>
      </div>
      <UseCanvas>
          <StickyScrollScene track={el}>
          {(props) => (
            <>

               <Scene2 mouse={mouse} {...props} />


            </>
          )}
        </StickyScrollScene>

      </UseCanvas>
    </section>
  )
}
export default function App() {
  const [isTouch, setTouch] = useState(false)
    const [messages, setMessages] = useState([]);
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    setTouch(isTouch)
  }, [])
      const mouse = React.useRef([0, 0]);
  const onMouseMove = React.useCallback(
    ({ clientX: x, clientY: y }) =>
      (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]),
    []
  );
  return (
    <>
      <GlobalCanvas scaleMultiplier={0.01}
      camera={{ position: [12, 10, 10] , near:0.1,far:100}}
  style={{ zIndex: -1 }}>{/* UseCanvas children will be inserted here */}


  </GlobalCanvas>
      <SmoothScrollbar>
        {(bind) => (
          <article {...bind}>
            <header>Metadrob Inc</header>
            <div className="stack" style={{'--stacks': 3}}>
        <h1 style={{'--index': 0}}>AUTOMOBILE REVOLUTION</h1>
        <h1 style={{'--index': 1}}>AUTOMOBILE REVOLUTION</h1>
        <h1 style={{'--index': 2}}>AUTOMOBILE REVOLUTION</h1>
      </div>
            <StickySection2 />


            <section>
              <p></p>
            </section>
            <StickySection />

            <Logo />
          </article>
        )}
      </SmoothScrollbar>
    </>
  )
}
