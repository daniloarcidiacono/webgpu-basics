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
    passEncoder.draw(3);
    passEncoder.end();

    return commandEncoder.finish();
  }

  destroy() {
  }

  static shaderCode() {
    // language=WGSL
    return `
      @vertex
      fn vs(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
        let pos = array<vec2f, 3>(
          vec2f(-0.8, -0.8),
          vec2f(0.8, -0.8),
          vec2f(0, 0.8)
        );
  
        return vec4f(pos[index], 0.0, 1.0);
      }
  
      @fragment
      fn fs() -> @location(0) vec4f {
        return vec4f(1, 1, 0, 1);
      }
    `;
  }
}

