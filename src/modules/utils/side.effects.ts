export type AsyncEffect = () => Promise<void> | void;

export class SideEffectQueue {
  private effects: { label: string; fn: AsyncEffect }[] = [];

  add(label: string, fn: AsyncEffect) {
    this.effects.push({ label, fn });
  }

  async runAll() {
    if (!this.effects.length) return;

    // eslint-disable-next-line @typescript-eslint/await-thenable
    const results = await Promise.allSettled(this.effects.map((e) => e.fn()));

    results.forEach((r, i) => {
      const { label } = this.effects[i];
      if (r.status === 'rejected')
        console.error(`[SideEffect FAIL] ${label}:`, r.reason);
      else console.log(`[SideEffect OK] ${label}`);
    });

    this.effects = [];
  }
}
