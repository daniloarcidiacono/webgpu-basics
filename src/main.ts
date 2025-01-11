import { getAdapterFeatures, getAdapterInfo, getAdapterLimits, getWebGPUContext, initWebGPU } from "@/webgpu/utils.ts";
import { SliderController } from "@/ui/slider-controller.ts";
import { clearPass } from "@/webgpu/clear_pass.ts";
import { createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import { HighlighterCore } from "shiki";

class WebGPUBasics {
	private adapter: GPUAdapter | null = null;
	private device: GPUDevice | null = null;
	private mainCtx: GPUCanvasContext | null = null;
  private highlighter: HighlighterCore | null = null;

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
		this.redSlider = new SliderController("redSlider", "redValue", this.render.bind(this));
		this.greenSlider = new SliderController("greenSlider", "greenValue", this.render.bind(this));
		this.blueSlider = new SliderController("blueSlider", "blueValue", this.render.bind(this));

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
    this.highlighter = await createHighlighterCore({
      themes: [
        // @ts-ignore
        import('shiki/themes/github-dark'),

        // @ts-ignore
        import('shiki/themes/github-light')
      ],
      langs: [
        // @ts-ignore
        import('shiki/langs/wgsl'),

        // @ts-ignore
        import('shiki/langs/json')
      ],
      // `shiki/wasm` contains the wasm binary inlined as base64 string.
      engine: createOnigurumaEngine(import('shiki/wasm'))
    });

    this.render();
  }

	private injectAdapterInfo() {
		if (!this.device || !this.adapter || !this.highlighter) {
			return;
		}

    const themes = {
      dark: 'github-dark',
      light: 'github-light'
    }
    this.adapterInfoPre.innerHTML = this.highlighter.codeToHtml(
      JSON.stringify(getAdapterInfo(this.adapter), null, 4),
      {
        lang: 'json',
        themes
      }
    );
    this.adapterLimitsPre.innerHTML = this.highlighter.codeToHtml(
      JSON.stringify(getAdapterLimits(this.adapter), null, 4),
      {
        lang: 'json',
        themes
      }
    );
    this.adapterFeaturesPre.innerHTML = this.highlighter.codeToHtml(
      JSON.stringify(getAdapterFeatures(this.adapter), null, 4),
      {
        lang: 'json',
        themes
      }
    );
	}

	private render() {
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
