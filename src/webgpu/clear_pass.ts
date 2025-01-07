export function clearPass(
  device: GPUDevice,
  ctx: GPUCanvasContext,
  r: number,
  g: number,
  b: number
): GPUCommandBuffer {
  const commandEncoder = device.createCommandEncoder();

  const passEncoder = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: ctx.getCurrentTexture().createView(),
      clearValue: { r, g, b, a: 1.0 },
      loadOp: 'clear',
      storeOp: 'store'
    }]
  });
  passEncoder.end();

  return commandEncoder.finish();
}
