import {BaseFilter, BaseFilterConstructor} from "./struct/BaseFilter";
import {compileShader, createAndSetupTexture, createProgram, setRectangle} from "./utilities/webglUtils";
import vertexShader from "./shader.v.glsl";
import fragmentShader from "./shader.f.glsl";

export class Renderer {
    private readonly program: WebGLProgram;
    private readonly gl: WebGL2RenderingContext;
    private frameBuffers: WebGLFramebuffer[] = [];
    private textures: WebGLTexture[] = [];

    private currentFilters: {
        filter: BaseFilter;
        domNode: Node;
        id: number;
    }[] = [];

    private readonly form: HTMLSpanElement;

    private readonly uResolutionLocation: WebGLUniformLocation;
    private readonly uImageLocation: WebGLUniformLocation;
    private readonly uFlipY: WebGLUniformLocation;

    private readonly aPositionLocation: GLint;
    private readonly aTexCoordLocation: GLint;

    private readonly vertexArray: WebGLVertexArrayObject;
    private readonly positionBuffer: WebGLBuffer;
    private readonly texCoordBuffer: WebGLBuffer;
    private readonly texture: WebGLTexture;

    private filterIndex: number = 0;

    constructor(canvas: HTMLCanvasElement, mountPoint: HTMLElement) {

        this.gl = canvas.getContext("webgl2");
        this.form = mountPoint;

        this.program = createProgram(this.gl,
            compileShader(this.gl, vertexShader, this.gl.VERTEX_SHADER),
            compileShader(this.gl, fragmentShader, this.gl.FRAGMENT_SHADER)
        );

        this.uResolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution");
        this.uImageLocation = this.gl.getUniformLocation(this.program, "u_image");
        this.uFlipY = this.gl.getUniformLocation(this.program, "u_flipY");

        this.aPositionLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.aTexCoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");


        this.vertexArray = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vertexArray);


        this.positionBuffer = this.gl.createBuffer();
        this.gl.enableVertexAttribArray(this.aPositionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.aPositionLocation, 2, this.gl.FLOAT, false, 0, 0);


        this.texCoordBuffer = this.gl.createBuffer();
        // Use this buffer for the next operations.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);

        // Provide a basic shape for the image.
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0
        ]), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.aTexCoordLocation);

        const size = 2,
            type = this.gl.FLOAT,
            normalize = false,
            stride = 0,
            offset = 0;

        this.gl.vertexAttribPointer(this.aTexCoordLocation, size, type, normalize, stride, offset);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.texture = createAndSetupTexture(this.gl);

        this.render();
    }

    public updateImage (image: OffscreenCanvas) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        // Upload the image into the texture.
        const mipLevel = 0,
            internalFormat = this.gl.RGBA,
            srcFormat = this.gl.RGBA,
            srcType = this.gl.UNSIGNED_BYTE;

        this.gl.texImage2D(this.gl.TEXTURE_2D,
            mipLevel,
            internalFormat,
            srcFormat,
            srcType,
            image
        );

        this.gl.canvas.height = image.height;
        this.gl.canvas.width = image.width;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 0, 0,0);

        this.textures = [];
        this.frameBuffers = [];

        // Create two textures and framebuffers for the texture ping-pong.
        for (let i = 0; i < 2; i++) {
            const texture = createAndSetupTexture(this.gl);
            this.textures.push(texture);

            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                mipLevel,
                internalFormat,
                image.width,
                image.height,
                0,
                srcFormat,
                srcType,
                null
            );

            const frameBuffer = this.gl.createFramebuffer();
            this.frameBuffers.push(frameBuffer);

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, mipLevel);
        }
    }

    public render () {
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vertexArray);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

        // Use the texture 0
        this.gl.uniform1i(this.uImageLocation, 0);
        // Do not flip.
        this.gl.uniform2f(this.uResolutionLocation, this.gl.canvas.width, this.gl.canvas.height);

        let index = 0;


        for (const { filter } of this.currentFilters) {
            this.gl.useProgram(filter.program);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffers[index % 2]);
            filter.render.bind(filter)(
                this.texCoordBuffer
            );
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[index % 2]);
            index++;
        }

        this.gl.useProgram(this.program);
        this.gl.uniform1f(this.uFlipY, index % 2 == 0 ? -1 : 1);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        setRectangle(this.gl, 0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    public addFilter (name: string, filterConstructor: BaseFilterConstructor) {
        const filter = new filterConstructor(this.gl, this.positionBuffer, this.texCoordBuffer, this.render.bind(this));
        const div = filter.component();
        const index = ++this.filterIndex;

        const element = document.createElement("div");
        element.innerHTML = `
            <h4>${ name } # ${index}</h4>
            <button id="remove-${index}">
                Remove
            </button>
        `;
        element.appendChild(div);
        element.setAttribute("renderer-filter-index", index.toString());
        this.form.appendChild(element);
        document.getElementById(`remove-${index}`).onclick = () => {
            this.form.removeChild(element);
            this.currentFilters = this.currentFilters.filter(({ id }) => id !== index);
            this.render();
        };

        this.currentFilters.push({
            domNode: element,
            filter: filter,
            id: index,
        });
    }
}