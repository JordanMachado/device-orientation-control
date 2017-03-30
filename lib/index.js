'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // DeviceOrientationControl.js

var _glMatrix = require('gl-matrix');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var rad = function rad(degree) {
	return degree * Math.PI / 180;
};

var DeviceOrientationControl = function () {
	function DeviceOrientationControl(mViewMatrix) {
		_classCallCheck(this, DeviceOrientationControl);

		this._mtxTarget = mViewMatrix;
		this._rotation = _glMatrix.mat4.create();

		this._hasSet = false;
		this._alpha = 0;
		this._beta = 0;
		this._gamma = 0;
		this.easing = 0.1;

		this._init();
		this.connect();
	}

	_createClass(DeviceOrientationControl, [{
		key: '_init',
		value: function _init() {
			var _this = this;

			this.enabled = true;

			this.deviceOrientation = {};
			this.screenOrientation = 0;

			this.alphaOffsetAngle = 0;

			this.onScreenOrientationChangeBind = function (e) {
				return _this._onScreenOrientationChange(e);
			};
			this.onDeviceOrientationChangeBind = function (e) {
				return _this._onDeviceOrientationChange(e);
			};
		}
	}, {
		key: 'connect',
		value: function connect() {
			this.onScreenOrientationChangeBind();

			window.addEventListener('orientationchange', this.onScreenOrientationChangeBind, false);
			window.addEventListener('deviceorientation', this.onDeviceOrientationChangeBind, false);

			this.enabled = true;
		}
	}, {
		key: 'disconnect',
		value: function disconnect() {

			window.removeEventListener('orientationchange', this.onScreenOrientationChangeBind, false);
			window.removeEventListener('deviceorientation', this.onDeviceOrientationChangeBind, false);
			this.enabled = false;
		}
	}, {
		key: 'update',
		value: function update() {
			var alpha = this.deviceOrientation.alpha ? rad(this.deviceOrientation.alpha) + this.alphaOffsetAngle : 0;
			var beta = this.deviceOrientation.beta ? rad(this.deviceOrientation.beta) : 0;
			var gamma = this.deviceOrientation.gamma ? rad(this.deviceOrientation.gamma) : 0;
			var orient = this.screenOrientation ? rad(this.screenOrientation) : 0;

			if (!this._hasSet) {
				this._alpha = alpha;
				this._beta = beta;
				this._gamma = gamma;
			} else {
				this._alpha += (alpha - this._alpha) * this.easing;
				this._beta += (beta - this._beta) * this.easing;
				this._gamma += (gamma - this._gamma) * this.easing;
			}

			this.setObjectQuaternion(this._alpha, this._beta, this._gamma, orient);
		}
	}, {
		key: 'setObjectQuaternion',
		value: function setObjectQuaternion(alpha, beta, gamma, orient) {
			var q = _glMatrix.quat.create();
			var zee = _glMatrix.vec3.create();
			var q0 = _glMatrix.quat.create();
			var q1 = _glMatrix.quat.create();

			zee[2] = 1;

			// YXZ
			var euler = {
				x: beta,
				y: alpha,
				z: -gamma
			};

			var c1 = Math.cos(euler.x / 2);
			var c2 = Math.cos(euler.y / 2);
			var c3 = Math.cos(euler.z / 2);
			var s1 = Math.sin(euler.x / 2);
			var s2 = Math.sin(euler.y / 2);
			var s3 = Math.sin(euler.z / 2);

			var x = s1 * c2 * c3 + c1 * s2 * s3;
			var y = c1 * s2 * c3 - s1 * c2 * s3;
			var z = c1 * c2 * s3 - s1 * s2 * c3;
			var w = c1 * c2 * c3 + s1 * s2 * s3;

			_glMatrix.quat.set(q, x, y, z, w);
			_glMatrix.quat.set(q1, Math.sqrt(0.5), 0, 0, -Math.sqrt(0.5));

			_glMatrix.quat.setAxisAngle(q0, zee, -orient);

			_glMatrix.quat.multiply(q, q, q1);
			_glMatrix.quat.multiply(q, q, q0);

			_glMatrix.quat.invert(q, q);
			_glMatrix.mat4.fromQuat(this._mtxTarget, q);
			_glMatrix.mat4.fromQuat(this._rotation, q);
		}

		//	Event handlers

	}, {
		key: '_onScreenOrientationChange',
		value: function _onScreenOrientationChange(e) {
			this.screenOrientation = window.orientation || 0;
		}
	}, {
		key: '_onDeviceOrientationChange',
		value: function _onDeviceOrientationChange(e) {
			this.deviceOrientation = event;

			this.update();
		}
	}, {
		key: 'rotation',
		get: function get() {
			return this._rotation;
		}
	}]);

	return DeviceOrientationControl;
}();

exports.default = DeviceOrientationControl;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map