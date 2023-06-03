import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

class BasicCharacterControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }
  get animations() {
    return this._animations;
  }
}

class BasicCharacterController {
  constructor(params) {
    this._init(params);
  }
  _init(params) {
    // For Character Animation
    this._mixer = null;

    // Params From Scene
    this._params = params;

    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this._velocity = new THREE.Vector3(0, 0, 0);

    // 輸入的 Instance
    this._input = new BasicCharacterControllerInput();

    // // 有限狀態機
    // this._stateMachine = new FiniteStateMachine(new BasicCharacterControllerProxy(this));

    // Load Model
    this._loadModels("model/zombie/", "mremireh_o_desbiens.fbx", "run.fbx", new THREE.Vector3(-3, 0, 0));
  }
  _loadModels(path, modelFile, animFile, offset) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse((item) => (item.castShadow = true));
      fbx.position.copy(offset);

      this._target = fbx;
      this._params.scene.add(this._target);

      // Anim
      const anim = new FBXLoader();
      anim.setPath(path);
      anim.load(animFile, (anim) => {
        this._mixer = new THREE.AnimationMixer(fbx);
        const jump = this._mixer.clipAction(anim.animations[0]);
        jump.play();
      });

      // this._mixer = new THREE.AnimationMixer(this._target);

      // this._manager = new THREE.LoadingManager();
      // this._manager.onload = () => {
      //   this._fsm.setState("idle");
      // };

      // const _onload = (animName, anim) => {
      //   const clip = anim.animations[0];
      //   const action = this._mixer.clipAction(clip);

      //   this._animations[animName] = { clip, action };
      // };

      // const loader = new FBXLoader(this._manager);
      // loader.setPath("model/zombie/");
      // loader.load("idle.fbx", (a) => _onload("idle", a));
      // loader.load("jump.fbx", (a) => _onload("jump", a));
      // loader.load("walk.fbx", (a) => _onload("walk", a));
      // loader.load("dance.fbx", (a) => _onload("dance", a));
    });
  }
}

// 負責監聽鍵盤輸入和記錄按鍵之類的
class BasicCharacterControllerInput {
  constructor() {
    this._init();
  }
  _init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };
    document.addEventListener("keydown", (e) => this._onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this._onKeyUp(e), false);
  }
  _onKeyDown(e) {
    switch (e.keyCode) {
      case 87: // w
        this._keys.forward = true;
        break;
      case 65: // a
        this._keys.left = true;
        break;
      case 83: // s
        this._keys.backward = true;
        break;
      case 68: // d
        this._keys.right = true;
        break;
      case 32: // space
        this._keys.space = true;
        break;
      case 16: // shift
        this._keys.shift = true;
        break;
    }
  }
  _onKeyUp(e) {
    switch (e.keyCode) {
      case 87: // w
        this._keys.forward = false;
        break;
      case 65: // a
        this._keys.left = false;
        break;
      case 83: // s
        this._keys.backward = false;
        break;
      case 68: // d
        this._keys.right = false;
        break;
      case 32: // space
        this._keys.space = false;
        break;
      case 16: // shift
        this._keys.shift = false;
        break;
    }
  }
}

export { BasicCharacterController };
