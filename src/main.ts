import { getAdapterFeatures, getAdapterInfo, getAdapterLimits, getWebGPUContext, initWebGPU } from "@/webgpu/utils.ts";
import { SliderController } from "@/ui/slider-controller.ts";
import { clearPass } from "@/webgpu/clear_pass.ts";

class WebGPUBasics {
	private adapter: GPUAdapter | null = null;
	private device: GPUDevice | null = null;
	private mainCtx: GPUCanvasContext | null = null;

	// UI
	private mainCanvas: HTMLCanvasElement;
	private adapterInfoPre: HTMLPreElement;
	private adapterLimitsPre: HTMLPreElement;
	private adapterFeaturesPre: HTMLPreElement;
	private redSlider: SliderController;
	private greenSlider: SliderController;
	private blueSlider: SliderController;

	constructor() {
		// Get DOM elements
		this.mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement;
		this.adapterInfoPre = document.getElementById('adapterInfo') as HTMLPreElement;
		this.adapterLimitsPre = document.getElementById('adapterLimits') as HTMLPreElement;
		this.adapterFeaturesPre = document.getElementById('adapterFeatures') as HTMLPreElement;
		this.redSlider = new SliderController("redSlider", "redValue", this.clearCanvas.bind(this));
		this.greenSlider = new SliderController("greenSlider", "greenValue", this.clearCanvas.bind(this));
		this.blueSlider = new SliderController("blueSlider", "blueValue", this.clearCanvas.bind(this));

		this.mainCanvas.width = 512;
		this.mainCanvas.height = 512;

		// Initialize WebGPU
		initWebGPU({ powerPreference: "high-performance" })
      .then(({ adapter, device }) => {
			this.adapter = adapter;
			this.device = device;
			this.mainCtx = getWebGPUContext(this.device, this.mainCanvas);
		  this.injectAdapterInfo();
			this.clearCanvas();
			document.documentElement.setAttribute('data-webgpu', 'yes');
		}).catch(error => {
			document.documentElement.setAttribute('data-webgpu', 'no');
			console.warn(error);
		});
	}

	private injectAdapterInfo() {
		if (!this.device || !this.adapter) {
			return;
		}

		this.adapterInfoPre.innerText = JSON.stringify(getAdapterInfo(this.adapter), null, 4);
		this.adapterLimitsPre.innerText = JSON.stringify(getAdapterLimits(this.adapter), null, 4);
		this.adapterFeaturesPre.innerText = JSON.stringify(getAdapterFeatures(this.adapter), null, 4);
	}

	private clearCanvas() {
		if (!this.device || !this.mainCtx) {
			return;
		}

		this.device.queue.submit([
			clearPass(this.device, this.mainCtx, this.redSlider.value / 255, this.greenSlider.value / 255, this.blueSlider.value / 255),
		]);
	}
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new WebGPUBasics();
});
