export async function initWebGPU(
  adapterOptions?: GPURequestAdapterOptions,
  deviceDescriptor?: GPUDeviceDescriptor
) {
  if (!navigator.gpu) {
    throw new Error('WebGPU not supported on this browser.');
  }

  const adapter = await navigator.gpu.requestAdapter(adapterOptions);
  if (!adapter) {
    throw new Error('No appropriate GPUAdapter found.');
  }

  return {
    adapter,
    device: await adapter.requestDevice(deviceDescriptor)
  };
}

export function getWebGPUContext(
  device: GPUDevice,
  canvas: HTMLCanvasElement
) {
  const ctx = canvas.getContext('webgpu');
  if (!ctx) {
    throw new Error("Could not get 'webgpu' context from canvas!");
  }

  ctx.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat()
  });

  return ctx;
}

export function getAdapterInfo(adapter: GPUAdapter) {
  return {
    vendor: adapter.info.vendor,
    architecture: adapter.info.architecture,
    device: adapter.info.device,
    description: adapter.info.description
  };
}

export function getAdapterLimits(adapter: GPUAdapter) {
  const limits: Record<string, number> = {};
  for (const key in adapter.limits) {
    // @ts-ignore
    limits[key] = adapter.limits[key];
  }

  return limits;
}

export function getAdapterFeatures(adapter: GPUAdapter) {
  const features: string[] = [];
  for (const feature of adapter.features) {
    features.push(feature);
  }
  return features;
}
