import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { CharacterFSM } from "./fsm";

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
    // Params From Scene
    this._params = params;

    // 減速參數
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);

    // 加速度參數
    this._acceleration = new THREE.Vector3(1, 0.25, 50.0);

    // 速率
    this._velocity = new THREE.Vector3(0, 0, 0);

    // 動畫, idle, walk, run
    this._animations = {};

    // 按鍵輸入
    this._input = new BasicCharacterControllerInput();

    // 有限狀態機
    this._stateMachine = new CharacterFSM(new BasicCharacterControllerProxy(this._animations));

    // Load Model
    this._loadModels();
  }
  _loadModels() {
    const loader = new FBXLoader();
    loader.setPath("model/zombie/");
    loader.load("character.fbx", (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse((item) => (item.castShadow = true));

      this._target = fbx;
      this._params.scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this._target);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.setState("idle");
      };

      const _onload = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);
        this._animations[animName] = { clip: clip, action: action };
      };

      const loader = new FBXLoader(this._manager);
      loader.setPath("model/zombie/");
      loader.load("idle.fbx", (a) => _onload("idle", a));
      // loader.load("jump.fbx", (a) => _onload("jump", a));
      loader.load("walk.fbx", (a) => _onload("walk", a));
      loader.load("run.fbx", (a) => _onload("run", a));
      // loader.load("back.fbx", (a) => _onload("back", a));
    });
  }
  update(timeInSeconds) {
    if (!this._target) return;
    this._stateMachine.update(timeInSeconds, this._input);

    const velocity = this._velocity;

    const frameDecceleration = new THREE.Vector3(
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (this._input._keys.shift) {
      acc.multiplyScalar(2);
    }

    // if (this._stateMachine._currentState.Name == "dance") {
    //   acc.multiplyScalar(0.0);
    // }

    if (this._input._keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this._input._keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    oldPosition.copy(controlObject.position);

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }
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
