/*
 * Base class for a filter.
 */
import {compileShader, createProgram} from "../utilities/webglUtils";

export abstract class BaseFilter {
    public readonly program: WebGLProgram;
    protected gl: WebGL2RenderingContext;
    protected _callRender: Function;

    protected constructor(
        gl: WebGL2RenderingContext,
        vertexSource: string,
        fragmentSource: string,
        _callRender: Function
    ) {
        this.gl = gl;
        this._callRender = _callRender;
        this.program = createProgram(gl,
            compileShader(gl, vertexSource, gl.VERTEX_SHADER),
            compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER),
        );
    }

    public abstract render(): void;
    public abstract component(): HTMLDivElement | undefined;

}

export interface BaseFilterConstructor {
    new (_context: WebGL2RenderingContext,
         _buffer: WebGLBuffer,
         _buffer2: WebGLBuffer,
         _render: Function): BaseFilter;
}