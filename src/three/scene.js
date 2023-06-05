import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { BasicCharacterController } from "./character";

class BasicScene {
  constructor() {
    this._init();
  }
  _init() {
    // Scene
    this._scene = new THREE.Scene();

    // Camera
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(25, 10, 25);

    // Renderer
    this._engine = new THREE.WebGLRenderer({ antialias: true });
    this._engine.shadowMap.enabled = true;
    this._engine.shadowMap.type = THREE.BasicShadowMap;
    this._engine.setSize(window.innerWidth, window.innerHeight);
    const pixelRatio = window.devicePixelRatio;
    this._engine.setPixelRatio(pixelRatio);
    document.body.appendChild(this._engine.domElement);

    this._clock = new THREE.Clock();

    // CubeMap
    this._loadCubeMap();

    // Oribit Control
    const controls = new OrbitControls(this._camera, this._engine.domElement);
    controls.target.set(0, 10, 0);
    controls.update();

    // Directional Light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-100, 100, 100);
    dirLight.target.position.set(0, 0, 0);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.001;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 500.0;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500.0;
    dirLight.shadow.camera.left = 50;
    dirLight.shadow.camera.right = -50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    this._scene.add(dirLight);

    // Ambient Light
    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    this._scene.add(ambLight);

    // Sphere
    const geometrySphere = new THREE.SphereGeometry(4, 16, 16);
    const materialSphere = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true });
    const sphere = new THREE.Mesh(geometrySphere, materialSphere);
    sphere.position.set(0, 30, 0);
    sphere.castShadow = true;
    this._scene.add(sphere);

    // Plane
    this._loadGround();

    this._mixers = [];
    this._previousRAF = null;

    // Character
    this._loadAnimatedModel();

    // // Audio
    // this._loadAudio();

    // Resize
    window.addEventListener("resize", () => this._onWinodwResize());

    // RenderLoop
    this._renderLoop();
  }
  _loadAnimatedModel() {
    const params = { camera: this._camera, scene: this._scene };
    this._character = new BasicCharacterController(params);
  }
  _renderLoop() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) this._previousRAF = t;
      this._renderLoop();
      this._engine.render(this._scene, this._camera);
      this._step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }
  _step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;

    if (this._character) {
      this._character.update(timeElapsedS);
    }
  }
  _onWinodwResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._engine.setSize(window.innerWidth, window.innerHeight);
  }
  _loadCubeMap() {
    const texture = new THREE.CubeTextureLoader().setPath("image/cubemap/").load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);
    this._scene.background = texture;
  }
  _loadAudio() {
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    this._camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("sound/breeze.mp3", function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
    });
  }
  _loadGround() {
    const geometryGround = new THREE.PlaneGeometry(100, 100, 10, 10);
    const materialGround = new THREE.MeshStandardMaterial();
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("image/texture/mud.jpg", (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(5, 5); // 在S轴方向重复2次，在T轴方向重复7次
      materialGround.map = texture;
      materialGround.needsUpdate = true;
    });
    const ground = new THREE.Mesh(geometryGround, materialGround);
    ground.rotation.x = -Math.PI / 2;
    ground.castShadow = false;
    ground.receiveShadow = true;
    this._scene.add(ground);
  }
}

export { BasicScene };
