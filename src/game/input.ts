export class InputManager {
  keys: Set<string> = new Set();
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      this.keys.add(e.key);
    };
    this.onKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key);
    };
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  isDown(key: string): boolean {
    return this.keys.has(key);
  }

  get throttle(): boolean {
    return this.isDown('ArrowRight') || this.isDown('d') || this.isDown('D');
  }

  get brake(): boolean {
    return this.isDown('ArrowLeft') || this.isDown('a') || this.isDown('A');
  }

  get jump(): boolean {
    return this.isDown('ArrowUp') || this.isDown('w') || this.isDown('W') || this.isDown(' ');
  }

  get leanForward(): boolean {
    return this.isDown('e') || this.isDown('E');
  }

  get leanBack(): boolean {
    return this.isDown('q') || this.isDown('Q');
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
