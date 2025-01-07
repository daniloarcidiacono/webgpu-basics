import { getAdapterFeatures, getAdapterInfo, getAdapterLimits, getWebGPUContext, initWebGPU } from "@/webgpu/utils.ts";
import { TrianglePass } from "@/webgpu/triangle_pass.ts";
import dedent from "dedent";

class WebGPUBasics {
	private adapter: GPUAdapter | null = null;
	private device: GPUDevice | null = null;
	private mainCtx: GPUCanvasContext | null = null;
  private trianglePass: TrianglePass | null = null;

	// UI
	private mainCanvas: HTMLCanvasElement;
	private shaderPre: HTMLPreElement;
	private adapterInfoPre: HTMLPreElement;
	private adapterLimitsPre: HTMLPreElement;
	private adapterFeaturesPre: HTMLPreElement;

	constructor() {
		// Get DOM elements
		this.mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement;
		this.shaderPre = document.getElementById('shader') as HTMLPreElement;
		this.adapterInfoPre = document.getElementById('adapterInfo') as HTMLPreElement;
		this.adapterLimitsPre = document.getElementById('adapterLimits') as HTMLPreElement;
		this.adapterFeaturesPre = document.getElementById('adapterFeatures') as HTMLPreElement;

		this.mainCanvas.width = 512;
		this.mainCanvas.height = 512;

		// Initialize WebGPU
		initWebGPU({ powerPreference: "high-performance" })
      .then(({ adapter, device }) => {
			this.adapter = adapter;
			this.device = device;
			this.mainCtx = getWebGPUContext(this.device, this.mainCanvas);
      return this.init();
		}).then(() => {
		  this.injectAdapterInfo();
			document.documentElement.setAttribute('data-webgpu', 'yes');
		}).catch(error => {
			document.documentElement.setAttribute('data-webgpu', 'no');
			console.warn(error);
		});
	}

  private async init() {
    this.trianglePass = await TrianglePass.create(this.device!, navigator.gpu.getPreferredCanvasFormat());
    this.render();
  }

	private injectAdapterInfo() {
		if (!this.device || !this.adapter || !this.trianglePass) {
			return;
		}

    this.shaderPre.innerText = dedent(TrianglePass.shaderCode());
		this.adapterInfoPre.innerText = JSON.stringify(getAdapterInfo(this.adapter), null, 4);
		this.adapterLimitsPre.innerText = JSON.stringify(getAdapterLimits(this.adapter), null, 4);
		this.adapterFeaturesPre.innerText = JSON.stringify(getAdapterFeatures(this.adapter), null, 4);
	}

	private render() {
		if (!this.device || !this.mainCtx || !this.trianglePass) {
			return;
		}

		this.device.queue.submit([
      this.trianglePass.render(this.mainCtx.getCurrentTexture())
		]);
	}
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new WebGPUBasics();
});
