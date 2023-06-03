import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

import { BasicCharacterController } from "./character";

class BasicScene {
  constructor() {
    this._previousTime = 0;
    this._clock = new THREE.Clock();
    this._init();
  }
  _init() {
    // Scene
    this._scene = new THREE.Scene();

    // Camera
    this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.set(25, 10, 25);

    // Renderer
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.BasicShadowMap;
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._renderer.domElement);

    // CubeMap
    this._loadCubeMap("image/cubemap/");

    // Oribit Control
    const controls = new OrbitControls(this._camera, this._renderer.domElement);
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

    // // Sphere
    // const geometryS = new THREE.SphereGeometry(2, 32, 32);
    // const materialS = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true });
    // const sphere = new THREE.Mesh(geometryS, materialS);
    // sphere.position.set(0, 3, 0);
    // sphere.castShadow = true;
    // this._scene.add(sphere);

    // Plane
    const geometryP = new THREE.PlaneGeometry(100, 100, 10, 10);
    const materialP = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const plane = new THREE.Mesh(geometryP, materialP);
    plane.rotation.x = -Math.PI / 2;
    plane.castShadow = false;
    plane.receiveShadow = true;
    this._scene.add(plane);

    // // Create a helper for the shadow camera (optional)
    // const helper = new THREE.CameraHelper(dirLight.shadow.camera);
    // this._scene.add(helper);

    // // Load Model GLTF
    // this._loadGltfModel("model/bee-gltf/source/", "bee_gltf.gltf", new THREE.Vector3(3, 3, 0));

    // // Load Model FBX
    // this._loadFbxModel("model/zombie/", "mremireh_o_desbiens.fbx", "jump.fbx", new THREE.Vector3(-3, 0, 0));
    const params = { camera: this._camera, scene: this._scene };
    this._model = new BasicCharacterController(params);

    // Resize
    window.addEventListener("resize", () => this._resizeWindow());

    // RenderLoop
    this._renderLoop();
  }
  _renderLoop() {
    requestAnimationFrame((t) => {
      const elapsedTime = this._clock.getElapsedTime(); // 已過去的時間，從 0 開始
      const deltaTime = elapsedTime - this._previousTime;
      this._previousTime = elapsedTime;
      this._renderLoop();
      this._renderer.render(this._scene, this._camera);
      if (this._model._mixer !== null) this._model._mixer.update(deltaTime);
    });
  }
  _resizeWindow() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }
  // _loadFbxModel(path, modelFile, animFile, offset) {
  //   // Load Model
  //   const loader = new FBXLoader();
  //   loader.setPath(path);
  //   loader.load(modelFile, (fbx) => {
  //     fbx.scale.setScalar(0.1);
  //     fbx.traverse((item) => (item.castShadow = true));
  //     fbx.position.copy(offset);

  //     // Anim
  //     const anim = new FBXLoader();
  //     anim.setPath(path);
  //     anim.load(animFile, (anim) => {
  //       this._mixer = new THREE.AnimationMixer(fbx);
  //       const dance = this._mixer.clipAction(anim.animations[0]);
  //       dance.play();
  //     });
  //     this._scene.add(fbx);
  //   });
  // }
  _loadGltfModel(path, modelFile, offset) {
    const loader = new GLTFLoader();
    loader.setPath(path);
    loader.load(modelFile, (gltf) => {
      gltf.scene.position.copy(offset);
      gltf.scene.traverse((item) => {
        item.castShadow = true;
      });

      this._scene.add(gltf.scene);
    });
  }
  _loadCubeMap(path) {
    const texture = new THREE.CubeTextureLoader().setPath(path).load(["posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg"]);
    this._scene.background = texture;
  }
}

export { BasicScene };
