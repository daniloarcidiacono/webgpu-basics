export type OnInputCallback = (value: number) => void;

export class SliderController {
  private readonly sliderEl: HTMLInputElement;
  private readonly outputEl: HTMLOutputElement;
  private readonly onInput?: OnInputCallback;

  constructor(sliderId: string, outputId: string, onInput?: OnInputCallback) {
    this.onInput = onInput;

    this.sliderEl = document.getElementById(sliderId) as HTMLInputElement;
    this.outputEl = document.getElementById(outputId) as HTMLOutputElement
    this.sliderEl.addEventListener('input', this.update.bind(this));
  }

  update() {
    this.outputEl.value = this.value.toString();
    this.onInput && this.onInput(this.value);
  }

  set value(value: number) {
    this.sliderEl.valueAsNumber = value;
  }

  get value() {
    return this.sliderEl.valueAsNumber;
  }
}
