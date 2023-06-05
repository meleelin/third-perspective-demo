// 有限狀態機
class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = null;
  }
  _addState(name, type) {
    this._states[name] = type;
  }
  setState(name) {
    const prevState = this._currentState;
    if (prevState) {
      if (prevState.Name === name) return;
      prevState.exit();
    }
    const state = new this._states[name](this);
    this._currentState = state;
    state.enter(prevState);
  }
  update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.update(timeElapsed, input);
    }
  }
}

class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._init();
  }
  _init() {
    this._addState("idle", IdleState);
    this._addState("walk", WalkState);
    this._addState("run", RunState);
    this._addState("back", BackState);
  }
}

// 狀態
class State {
  constructor(parent) {
    this._parent = parent;
  }
  enter() {}
  exit() {}
  update() {}
}

// Idle
class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return "idle";
  }
  enter(prevState) {
    const idleAction = this._parent._proxy._animations["idle"].action;
    if (prevState) {
      // if prevState 存在, 代表目前正在做其他動畫, 像是 walk or run, 所以要做動畫淡出淡入的效果
      const prevAction = this._parent._proxy._animations[prevState.Name].action; // 取得 prevState 是哪個動畫
      idleAction.time = 0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1);
      idleAction.setEffectiveWeight(1);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }
  exit() {}
  update(_, input) {
    if (input._keys.forward || input._keys.backward) {
      this._parent.setState("walk");
    }
    // else if (input._move.space) {
    //   this._parent.setState("dance");
    // }
  }
}

// Walk
class WalkState extends State {
  constructor(parent) {
    super(parent);
  }
  get Name() {
    return "walk";
  }
  enter(prevState) {
    const walkAction = this._parent._proxy._animations["walk"].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      walkAction.enabled = true;

      if (prevState.Name == "run") {
        const ratio = walkAction.getClip().duration / prevAction.getClip().duration;
        walkAction.time = prevAction.time * ratio;
      } else {
        walkAction.time = 0.0;
        walkAction.setEffectiveTimeScale(1.0);
        walkAction.setEffectiveWeight(1.0);
      }

      walkAction.crossFadeFrom(prevAction, 0.5, true);
      walkAction.play();
    } else {
      walkAction.play();
    }
  }
  exit() {}

  update(timeElapsed, input) {
    if (input._keys.forward||input._keys.backward) {
      if (input._keys.shift) {
        this._parent.setState("run");
      }
      return;
    }

    this._parent.setState("idle");
  }
}

// Walk
class BackState extends State {
  constructor(parent) {
    super(parent);
  }
  get Name() {
    return "back";
  }
  enter(prevState) {
    const backAction = this._parent._proxy._animations["back"].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      backAction.enabled = true;

      if (prevState.Name == "run") {
        const ratio = backAction.getClip().duration / prevAction.getClip().duration;
        backAction.time = prevAction.time * ratio;
      } else {
        backAction.time = 0.0;
        backAction.setEffectiveTimeScale(1.0);
        backAction.setEffectiveWeight(1.0);
      }

      backAction.crossFadeFrom(prevAction, 0.5, true);
      backAction.play();
    } else {
      backAction.play();
    }
  }
  exit() {}

  update(timeElapsed, input) {
    if (input._keys.backward) {
      // if (input._keys.shift) {
      //   this._parent.setState("run");
      // }
      return;
    }

    this._parent.setState("idle");
  }
}

// Run
class RunState extends State {
  constructor(parent) {
    super(parent);
  }
  get Name() {
    return "run";
  }
  enter(prevState) {
    const runAction = this._parent._proxy._animations["run"].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      runAction.enabled = true;

      if (prevState.Name == "walk") {
        const ratio = runAction.getClip().duration / prevAction.getClip().duration;
        runAction.time = prevAction.time * ratio;
      } else {
        runAction.time = 0.0;
        runAction.setEffectiveTimeScale(1.0);
        runAction.setEffectiveWeight(1.0);
      }

      runAction.crossFadeFrom(prevAction, 0.5, true);
      runAction.play();
    } else {
      runAction.play();
    }
  }
  exit() {}
  update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      if (!input._keys.shift) {
        this._parent.setState("walk");
      }
      return;
    }

    this._parent.setState("idle");
  }
}

export { CharacterFSM };
