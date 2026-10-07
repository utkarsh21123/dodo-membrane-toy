import { vertexShaderSource } from '../shaders/membrane.vert';
import { fragmentShaderSource } from '../shaders/membrane.frag';
import { PhysicsParams } from '../types';

export class ShaderPipeline {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private vbo: WebGLBuffer;

  private heightmapTexture: WebGLTexture;
  private substrateTexture: WebGLTexture;

  private uniformLocations: {
    resolution: WebGLUniformLocation | null;
    pointer: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    mode: WebGLUniformLocation | null;
    refractionStrength: WebGLUniformLocation | null;
    dispersionStrength: WebGLUniformLocation | null;
    specularPower: WebGLUniformLocation | null;
    fresnelPower: WebGLUniformLocation | null;
    causticStrength: WebGLUniformLocation | null;
    heightmap: WebGLUniformLocation | null;
    substrate: WebGLUniformLocation | null;
  };

  private gridWidth: number = 256;
  private gridHeight: number = 256;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      throw new Error('WebGL2 is not supported on this browser/device.');
    }
    this.gl = gl;

    // Compile shaders and create program
    const vertShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create WebGL program');
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error(`WebGL Program Link Error: ${info}`);
    }
    this.program = program;

    // Cache Uniform Locations
    this.uniformLocations = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      pointer: gl.getUniformLocation(program, 'u_pointer'),
      time: gl.getUniformLocation(program, 'u_time'),
      mode: gl.getUniformLocation(program, 'u_mode'),
      refractionStrength: gl.getUniformLocation(program, 'u_refractionStrength'),
      dispersionStrength: gl.getUniformLocation(program, 'u_dispersionStrength'),
      specularPower: gl.getUniformLocation(program, 'u_specularPower'),
      fresnelPower: gl.getUniformLocation(program, 'u_fresnelPower'),
      causticStrength: gl.getUniformLocation(program, 'u_causticStrength'),
      heightmap: gl.getUniformLocation(program, 'u_heightmap'),
      substrate: gl.getUniformLocation(program, 'u_substrate'),
    };

    // Full-screen Quad Setup
    const vao = gl.createVertexArray();
    if (!vao) throw new Error('Failed to create VAO');
    this.vao = vao;
    gl.bindVertexArray(vao);

    const quadVertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    const vbo = gl.createBuffer();
    if (!vbo) throw new Error('Failed to create VBO');
    this.vbo = vbo;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Create Heightmap Texture (Unit 0)
    const heightTex = gl.createTexture();
    if (!heightTex) throw new Error('Failed to create heightmap texture');
    this.heightmapTexture = heightTex;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, heightTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.gridWidth,
      this.gridHeight,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    // Create Substrate Texture (Unit 1)
    const subTex = gl.createTexture();
    if (!subTex) throw new Error('Failed to create substrate texture');
    this.substrateTexture = subTex;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, subTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${log}`);
    }
    return shader;
  }

  public initPhysicsGridSize(width: number, height: number): void {
    this.gridWidth = width;
    this.gridHeight = height;
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.heightmapTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
  }

  public updateSubstrate(canvas: HTMLCanvasElement): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.substrateTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  }

  public updateHeightmap(data: Uint8Array): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.heightmapTexture);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      this.gridWidth,
      this.gridHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data
    );
  }

  public render(
    time: number,
    width: number,
    height: number,
    pointerX: number,
    pointerY: number,
    modeIndex: number,
    params: PhysicsParams
  ): void {
    const gl = this.gl;

    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);

    gl.uniform2f(this.uniformLocations.resolution, width, height);
    gl.uniform2f(this.uniformLocations.pointer, pointerX, pointerY);
    gl.uniform1f(this.uniformLocations.time, time);
    gl.uniform1i(this.uniformLocations.mode, modeIndex);

    gl.uniform1f(this.uniformLocations.refractionStrength, params.refractionStrength);
    gl.uniform1f(this.uniformLocations.dispersionStrength, params.dispersionStrength);
    gl.uniform1f(this.uniformLocations.specularPower, params.specularPower);
    gl.uniform1f(this.uniformLocations.fresnelPower, params.fresnelPower);
    gl.uniform1f(this.uniformLocations.causticStrength, params.causticStrength);

    gl.uniform1i(this.uniformLocations.heightmap, 0);
    gl.uniform1i(this.uniformLocations.substrate, 1);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  public dispose(): void {
    const gl = this.gl;
    gl.deleteProgram(this.program);
    gl.deleteBuffer(this.vbo);
    gl.deleteVertexArray(this.vao);
    gl.deleteTexture(this.heightmapTexture);
    gl.deleteTexture(this.substrateTexture);
  }
}
