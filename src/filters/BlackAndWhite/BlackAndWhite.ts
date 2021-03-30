/*
 * ColorBalance filter
 */

import { BaseFilter } from '../../struct/BaseFilter'
import vertexSource from './shader.v.glsl'
import fragmentSource from './shader.f.glsl'
import { setRectangle } from '../../utilities/webglUtils'
import { Filter } from '../index'

class BlackAndWhite extends BaseFilter {
    private uResolutionLocation: WebGLUniformLocation;
    private uImageLocation: WebGLUniformLocation;
    private uForce: WebGLUniformLocation;

    private state: number;

    private form: HTMLFormElement;

    private _stateUpdate () {
      this.state = 2 - (parseInt((this.form.elements.namedItem('factor') as HTMLInputElement).value) / 100)

      this._callRender()
    };

    constructor (gl: WebGL2RenderingContext,
                 private positionBuffer: WebGLBuffer,
                 private texCoordBuffer: WebGLBuffer,
                 _callRender: Function
    ) {
      super(gl, vertexSource, fragmentSource, _callRender)
      this._initialize()
    }

    private _initialize () {
      this.uResolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution')
      this.uForce = this.gl.getUniformLocation(this.program, 'u_colorFactor')
      this.uImageLocation = this.gl.getUniformLocation(this.program, 'u_image')
      const aPositionLocation = this.gl.getAttribLocation(this.program, 'a_position')
      const aTexCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord')

      const size = 2
      const type = this.gl.FLOAT
      const normalize = false
      const stride = 0
      const offset = 0

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
      this.gl.vertexAttribPointer(aPositionLocation, 2, this.gl.FLOAT, false, 0, 0)

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer)
      this.gl.vertexAttribPointer(aTexCoordLocation, size, type, normalize, stride, offset)
    }

    public render () {
      this.gl.uniform1i(this.uImageLocation, 0)
      this.gl.uniform2f(this.uResolutionLocation, this.gl.canvas.width, this.gl.canvas.height)

      this.gl.uniform1f(this.uForce, this.state)

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
      setRectangle(this.gl, 0, 0, this.gl.canvas.width, this.gl.canvas.height)
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)
    }

    component (): HTMLDivElement {
      const component = document.createElement('div')
      this.form = document.createElement('form')

      this.form.innerHTML = `
            <div class="adjustments" style="flex-flow: column; display: flex;">
                <label>
                    Factor
                    <input id="factor" name="factor" type="range" max="200">
                </label>
            </div>
        `;

      ['factor'].forEach((name) => {
        this.form.elements[name].addEventListener('input', this._stateUpdate.bind(this))
      })
      component.appendChild(this.form)

      return component
    }
}

export const BlackAndWhiteFilter: Filter = {
  name: 'Noir et blanc',
  constructor: BlackAndWhite
}
