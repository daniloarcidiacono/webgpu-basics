import { compileShader } from "@/webgpu/utils.ts";

export class TrianglePass {
  private readonly device: GPUDevice;
  private readonly pipeline: GPURenderPipeline;

  static async create(device: GPUDevice, format: GPUTextureFormat) {
    const code = TrianglePass.shaderCode();
    const module = await compileShader(device, code);

    // Create render pipeline
    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module,
      },
      fragment: {
        module,
        targets: [{ format }],
      },
      primitive: {
        topology: 'triangle-list'
      }
    });

    return new TrianglePass(device, pipeline);
  }

  private constructor(
    device: GPUDevice,
    pipeline: GPURenderPipeline
  ) {
    this.device = device;
    this.pipeline = pipeline;
  }

  render(texture: GPUTexture) {
    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: texture.createView(),
        loadOp: 'clear',
        clearValue: {
          r: 0,
          g: 0,
          b: 0,
          a: 1
        },
        storeOp: 'store'
      }]
    });
    passEncoder.setPipeline(this.pipeline);
    passEncoder.draw(30);
    passEncoder.end();

    return commandEncoder.finish();
  }

  destroy() {
  }

  static shaderCode() {
    // language=WGSL
    return `
      struct VertexOutput {
        @builtin(position) pos: vec4f,
        @location(0) color: vec4f
      }

      const star = array<vec2f, 30>(
        // Outer star points
        vec2f(0.000000, -0.197140), vec2f(0.309011, -0.425297), vec2f(0.187467, -0.060929),
        vec2f(0.187467, -0.060929), vec2f(0.500000, 0.162443), vec2f(0.115866, 0.159500),
        vec2f(0.115866, 0.159500), vec2f(0.000000, 0.525707), vec2f(-0.115866, 0.159500),
        vec2f(-0.115866, 0.159500), vec2f(-0.500000, 0.162443), vec2f(-0.187467, -0.060929),
        vec2f(-0.187467, -0.060929), vec2f(-0.309011, -0.425297), vec2f(0.000000, -0.197140),
      
        // Inner star points
        vec2f(0.000000, -0.197140), vec2f(0.000000, 0.000000), vec2f(0.187467, -0.060929),
        vec2f(0.187467, -0.060929), vec2f(0.000000, 0.000000), vec2f(0.115866, 0.159500),
        vec2f(0.115866, 0.159500), vec2f(0.000000, 0.000000), vec2f(-0.115866, 0.159500),
        vec2f(-0.115866, 0.159500), vec2f(0.000000, 0.000000), vec2f(-0.187467, -0.060929),
        vec2f(-0.187467, -0.060929), vec2f(0.000000, 0.000000), vec2f(0.000000, -0.197140)
      );

      const colors = array<vec4f, 10>(
        vec4f(1.00, 0.71, 0.76, 1.0),
        vec4f(0.68, 0.85, 0.90, 1.0),
        vec4f(0.87, 0.63, 0.87, 1.0),
        vec4f(0.56, 0.93, 0.56, 1.0),
        vec4f(1.00, 0.85, 0.73, 1.0),
        vec4f(0.69, 0.88, 0.90, 1.0),
        vec4f(1.00, 0.71, 0.76, 1.0),
        vec4f(0.90, 0.90, 0.98, 1.0),
        vec4f(0.74, 0.82, 0.93, 1.0),
        vec4f(1.00, 0.94, 0.96, 1.0)
      );  

      @vertex
      fn vs(@builtin(vertex_index) index: u32) -> VertexOutput {  
        // Step 1: Scale
        let sX = 0.5;
        let sY = 0.5;
        var transformed = vec2f(
          star[index].x * sX,
          star[index].y * sY
        );
      
        // Step 2: Rotate
        let theta = radians(45.0);
        let cosT = cos(theta);
        let sinT = sin(theta);
        transformed = vec2f(
          transformed.x * cosT - transformed.y * sinT,
          transformed.x * sinT + transformed.y * cosT
        );
      
        // Step 3: Traslate
        let tX = 0.2;
        let tY = -0.1;
        transformed += vec2f(tX, tY);
        
        var vertex: VertexOutput;
        vertex.pos = vec4f(transformed, 0.0, 1.0);
        vertex.color = colors[index / 3];
        return vertex;
      }
  
      struct FragmentInput {
        @location(0) color: vec4f
      }
  
      @fragment
      fn fs(fragment: FragmentInput) -> @location(0) vec4f {
        return fragment.color;
      }
    `;
  }
}

