/*
 * ColorBalance filter
 */

import { BaseFilter } from '../../struct/BaseFilter'
import vertexSource from './shader.v.glsl'
import fragmentSource from './shader.f.glsl'
import { setRectangle } from '../../utilities/webglUtils'
import { Filter } from '../index'

class Sepia extends BaseFilter {
    private uColor: WebGLUniformLocation;
    private uResolutionLocation: WebGLUniformLocation;
    private uImageLocation: WebGLUniformLocation;
    private stateForm: HTMLFormElement;

    private force: number = 100;
    private uForce: WebGLUniformLocation;

    constructor (gl: WebGL2RenderingContext,
                private positionBuffer: WebGLBuffer,
                private texCoordBuffer: WebGLBuffer,
                cr: Function
    ) {
      super(gl, vertexSource, fragmentSource, cr)
      this._initialize()
    }

    private _initialize () {
      this.uResolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution')
      this.uImageLocation = this.gl.getUniformLocation(this.program, 'u_image')
      this.uForce = this.gl.getUniformLocation(this.program, 'u_force')
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

      this.uColor = this.gl.getUniformLocation(this.program, 'u_color')
    }

    public render () {
      this.gl.uniform1i(this.uImageLocation, 0)
      this.gl.uniform2f(this.uResolutionLocation, this.gl.canvas.width, this.gl.canvas.height)
      this.gl.uniform1f(this.uForce, this.force)
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
      setRectangle(this.gl, 0, 0, this.gl.canvas.width, this.gl.canvas.height)
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)
    }

    public component (): HTMLDivElement {
      const component = document.createElement('div')
      this.stateForm = document.createElement('form')

      this.stateForm.innerHTML = `
            <div class="adjustments" style="flex-flow: column; display: flex;">
                <label>
                    Force
                    <input id="force" name="force" type="range" max="99">
                </label>
            </div>
        `;

      ['force'].forEach((name) => {
        this.stateForm.elements[name].addEventListener('input', this.update.bind(this))
      })
      component.appendChild(this.stateForm)

      return component
    }

    private update () {
      this.force = parseInt((this.stateForm.elements.namedItem('force') as HTMLInputElement).value) / 100
      this._callRender()
    }
}

export const SepiaFilter: Filter = {
  name: 'Filtre Sépia',
  constructor: Sepia
}
