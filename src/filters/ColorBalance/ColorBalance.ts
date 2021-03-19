/*
 * ColorBalance filter
 */

import {BaseFilter} from "../../struct/BaseFilter";
import vertexSource from "./shader.v.glsl";
import fragmentSource from "./shader.f.glsl";
import {setRectangle} from "../../utilities/webglUtils";

export class ColorBalance extends BaseFilter {
    private uResolutionLocation: WebGLUniformLocation;
    private uImageLocation: WebGLUniformLocation;
    private uLuminance: WebGLUniformLocation;

    private state: {
        r: number;
        g: number;
        b: number;
    } = {
        r: 1,
        g: 1,
        b: 1,
    };

    private form: HTMLFormElement;

    private _stateUpdate() {
        this.state.r = parseInt((this.form.elements.namedItem("red") as HTMLInputElement).value) / 100;
        this.state.g = parseInt((this.form.elements.namedItem("green") as HTMLInputElement).value) / 100;
        this.state.b = parseInt((this.form.elements.namedItem("blue") as HTMLInputElement).value) / 100;

        this._callRender();
    };

    constructor(gl: WebGL2RenderingContext,
                private positionBuffer: WebGLBuffer,
                private texCoordBuffer: WebGLBuffer,
                _callRender: Function
    ) {
        super(gl, vertexSource, fragmentSource, _callRender);
        this._initialize();
    }

    private _initialize() {
        this.uResolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution");
        this.uLuminance = this.gl.getUniformLocation(this.program, "u_luminance");
        this.uImageLocation = this.gl.getUniformLocation(this.program, "u_image");
        const aPositionLocation = this.gl.getAttribLocation(this.program, "a_position");
        const aTexCoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");

        const size = 2,
            type = this.gl.FLOAT,
            normalize = false,
            stride = 0,
            offset = 0;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(aPositionLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.vertexAttribPointer(aTexCoordLocation, size, type, normalize, stride, offset);

    }

    public render() {
        this.gl.uniform1i(this.uImageLocation, 0);
        this.gl.uniform2f(this.uResolutionLocation, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.uniform4f(this.uLuminance, this.state.r, this.state.g, this.state.b, 1);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        setRectangle(this.gl, 0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    component(): HTMLDivElement {
        const component = document.createElement("div");
        this.form = document.createElement("form");

        this.form.innerHTML = `
            <div class="adjustments" style="flex-flow: column; display: flex;">
                <label>
                    R
                    <input id="red" name="red" type="range" max="200">
                </label>
                <label>
                    G
                    <input id="green" name="green" type="range" max="200">
                </label>
                <label>
                    B
                    <input id="blue" name="blue" type="range" max="200">
                </label>
            </div>
        `;

        ["blue", "green", "red"].forEach((name) => {
            this.form.elements[name].addEventListener("input", this._stateUpdate.bind(this));
        });
        component.appendChild(this.form);

        return component;
    }
}